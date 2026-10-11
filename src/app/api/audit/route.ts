import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { auditSchema } from "@/validations/forms";
import { notifyNewLead, sendConfirmationEmail } from "@/lib/email";
import { processLeadCapture } from "@/lib/n8n/lead-pipeline";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = auditSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const { website, message, ...rest } = parsed.data;
    const auditMessage = [
      website ? `Website: ${website}` : null,
      message || null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const lead = await prisma.lead.create({
      data: {
        ...rest,
        message: auditMessage || undefined,
        type: "AUDIT",
      },
    });

    await notifyNewLead({
      type: "AUDIT",
      name: lead.name,
      email: lead.email,
      message: lead.message,
    });
    await sendConfirmationEmail(lead.email, lead.name, "AUDIT");
    await processLeadCapture({
      lead,
      event: "form.audit",
      notifyTitle: "New Audit Request",
      notifyBody: `${lead.name} requested a free audit`,
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
