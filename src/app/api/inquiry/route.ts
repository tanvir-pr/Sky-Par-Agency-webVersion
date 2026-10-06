import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { inquirySchema } from "@/validations/forms";
import { notifyNewLead, sendConfirmationEmail } from "@/lib/email";
import { processLeadCapture } from "@/lib/n8n/lead-pipeline";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const lead = await prisma.lead.create({
      data: { ...parsed.data, type: "INQUIRY" },
    });

    await notifyNewLead({
      type: "INQUIRY",
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      service: lead.projectType,
      budget: lead.budget,
      message: lead.requirements,
    });
    await sendConfirmationEmail(lead.email, lead.name, "INQUIRY");
    await processLeadCapture({
      lead,
      event: "form.inquiry",
      notifyTitle: "New Project Inquiry",
      notifyBody: `${lead.name} submitted a project inquiry`,
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
