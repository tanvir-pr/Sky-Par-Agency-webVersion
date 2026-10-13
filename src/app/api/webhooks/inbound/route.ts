import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { notifyNewLead, sendConfirmationEmail } from "@/lib/email";
import { buildIdempotencyKey, emitN8nEvent } from "@/lib/n8n";
import { processLeadCapture } from "@/lib/n8n/lead-pipeline";
import { verifyN8nSignature } from "@/lib/n8n/verify";
import { n8nConfig } from "@/lib/n8n/config";

const inboundLeadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().optional(),
  source: z.string().min(1),
  channel: z.string().optional(),
  type: z.enum(["CONTACT", "INQUIRY", "AUDIT", "NEWSLETTER", "CONSULTATION", "CHECKOUT"]).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/** External lead sources (Facebook, WhatsApp, LinkedIn, etc.) forwarded by n8n */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-n8n-signature");

  if (n8nConfig.webhookSecret && !verifyN8nSignature(rawBody, signature, n8nConfig.webhookSecret)) {
    return jsonError("Invalid signature", 401);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = inboundLeadSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  const data = parsed.data;
  const source = data.channel ? `${data.source} / ${data.channel}` : data.source;

  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      service: data.service,
      budget: data.budget,
      message: data.message,
      type: data.type ?? "CONTACT",
      source,
    },
  });

  await notifyNewLead({ type: lead.type, ...data, message: data.message ?? "" });
  await sendConfirmationEmail(lead.email, lead.name, lead.type);

  await processLeadCapture({
    lead,
    event: "lead.created",
    notifyTitle: `New lead from ${source}`,
    notifyBody: `${lead.name} via ${source}`,
  });

  await emitN8nEvent(
    "lead.created",
    "lead_generation",
    { ...lead, channel: data.channel ?? data.source, metadata: data.metadata },
    buildIdempotencyKey(["inbound", lead.id])
  );

  return NextResponse.json({ lead }, { status: 201 });
}
