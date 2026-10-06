import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { bookingSchema } from "@/validations/forms";
import { notifyNewLead, sendConfirmationEmail } from "@/lib/email";
import { buildIdempotencyKey, emitN8nEvent } from "@/lib/n8n";
import { processLeadCapture } from "@/lib/n8n/lead-pipeline";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { preferredDate, preferredTime, message, ...rest } = parsed.data;
    const bookingNote = [
      `Preferred: ${preferredDate} at ${preferredTime}`,
      message || null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const lead = await prisma.lead.create({
      data: {
        ...rest,
        message: bookingNote,
        type: "CONSULTATION",
        source: "Booking Form",
        status: "MEETING_SCHEDULED",
      },
    });

    await notifyNewLead({
      type: "CONSULTATION",
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      service: lead.service,
      message: bookingNote,
    });
    await sendConfirmationEmail(lead.email, lead.name, "CONSULTATION");
    await processLeadCapture({
      lead,
      event: "form.booking",
      notifyTitle: "Consultation booking request",
      notifyBody: `${lead.name} requested a consultation`,
    });

    await emitN8nEvent(
      "consultation.booked",
      "client_onboarding",
      {
        leadId: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        scheduledAt: `${preferredDate}T${preferredTime}`,
        eventType: lead.service,
      },
      buildIdempotencyKey(["booking", lead.id])
    );

    return NextResponse.json({ lead }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
