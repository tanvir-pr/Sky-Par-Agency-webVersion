import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { quoteSchema } from "@/validations/forms";
import { notifyNewLead, sendConfirmationEmail } from "@/lib/email";
import { buildIdempotencyKey, emitN8nEvent } from "@/lib/n8n";
import { processLeadCapture } from "@/lib/n8n/lead-pipeline";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = quoteSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { timeline, requirements, ...rest } = parsed.data;
    const message = [timeline ? `Timeline: ${timeline}` : null, requirements].filter(Boolean).join("\n\n");

    const lead = await prisma.lead.create({
      data: {
        ...rest,
        requirements,
        message,
        type: "INQUIRY",
        source: "Quote Request",
      },
    });

    await notifyNewLead({
      type: "INQUIRY",
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      service: lead.service,
      budget: lead.budget,
      message: lead.message,
    });
    await sendConfirmationEmail(lead.email, lead.name, "INQUIRY");
    await processLeadCapture({
      lead,
      event: "form.quote",
      notifyTitle: "New Quote Request",
      notifyBody: `${lead.name} requested a custom quote`,
    });

    await emitN8nEvent(
      "form.quote",
      "sales",
      { leadId: lead.id, service: lead.service, budget: lead.budget },
      buildIdempotencyKey(["quote", lead.id])
    );

    return NextResponse.json({ lead }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
