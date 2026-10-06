import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { supportSchema } from "@/validations/forms";
import { notifyNewLead, sendConfirmationEmail } from "@/lib/email";
import { buildAdminUrl, buildIdempotencyKey, emitN8nEvent } from "@/lib/n8n";
import { processLeadCapture } from "@/lib/n8n/lead-pipeline";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = supportSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { subject, priority, message, ...rest } = parsed.data;

    const lead = await prisma.lead.create({
      data: {
        ...rest,
        message: `[${priority}] ${subject}\n\n${message}`,
        type: "CONTACT",
        source: "Support Form",
      },
    });

    await notifyNewLead({
      type: "CONTACT",
      name: lead.name,
      email: lead.email,
      message: lead.message,
    });
    await sendConfirmationEmail(lead.email, lead.name, "CONTACT");
    await processLeadCapture({
      lead,
      event: "form.support",
      notifyTitle: `Support ticket (${priority})`,
      notifyBody: `${lead.name}: ${subject}`,
    });

    await emitN8nEvent(
      "support.ticket.created",
      "support",
      {
        leadId: lead.id,
        subject,
        priority,
        name: lead.name,
        email: lead.email,
        message,
        adminUrl: buildAdminUrl("/admin/crm/leads"),
      },
      buildIdempotencyKey(["support", lead.id])
    );

    return NextResponse.json({ lead, ticketId: lead.id }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
