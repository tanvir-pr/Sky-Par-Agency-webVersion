import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { notifyNewLead, sendConfirmationEmail } from "@/lib/email";
import { buildIdempotencyKey, emitN8nEvent } from "@/lib/n8n";
import { processLeadCapture } from "@/lib/n8n/lead-pipeline";

const calendlySchema = z.object({
  event: z.literal("invitee.created"),
  payload: z.object({
    name: z.string().optional(),
    email: z.string().email(),
    scheduled_event: z
      .object({
        start_time: z.string(),
        name: z.string().optional(),
        uri: z.string().optional(),
      })
      .optional(),
    timezone: z.string().optional(),
    questions_and_answers: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
  }),
});

/** Calendly webhook — creates CONSULTATION lead + triggers n8n onboarding flow */
export async function POST(request: Request) {
  const body = await parseJsonBody(request);
  if (!body) return jsonError("Invalid JSON body", 400);

  const parsed = calendlySchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const { payload } = parsed.data;
  const name =
    payload.name ||
    payload.questions_and_answers?.find((q) => q.question.toLowerCase().includes("name"))?.answer ||
    payload.email.split("@")[0];

  const phone =
    payload.questions_and_answers?.find((q) => q.question.toLowerCase().includes("phone"))?.answer;

  const scheduledAt = payload.scheduled_event?.start_time ?? new Date().toISOString();

  const lead = await prisma.lead.create({
    data: {
      name,
      email: payload.email,
      phone,
      type: "CONSULTATION",
      status: "MEETING_SCHEDULED",
      source: "Calendly",
      message: payload.scheduled_event?.name ?? "Consultation booked",
    },
  });

  await notifyNewLead({
    type: "CONSULTATION",
    name,
    email: payload.email,
    phone,
    message: `Booked for ${scheduledAt}`,
  });
  await sendConfirmationEmail(payload.email, name, "CONSULTATION");

  await processLeadCapture({
    lead,
    event: "lead.created",
    notifyTitle: "Consultation booked",
    notifyBody: `${name} booked a consultation`,
  });

  await emitN8nEvent(
    "consultation.booked",
    "client_onboarding",
    {
      leadId: lead.id,
      name,
      email: payload.email,
      phone,
      scheduledAt,
      timezone: payload.timezone,
      eventType: payload.scheduled_event?.name,
      calendlyEventUri: payload.scheduled_event?.uri,
    },
    buildIdempotencyKey(["calendly", lead.id])
  );

  return NextResponse.json({ lead }, { status: 201 });
}
