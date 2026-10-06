import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { contactSchema } from "@/validations/forms";
import { notifyNewLead, sendConfirmationEmail } from "@/lib/email";
import { processLeadCapture } from "@/lib/n8n/lead-pipeline";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const lead = await prisma.lead.create({
      data: {
        ...parsed.data,
        type: "CONTACT",
        source: "Website",
      },
    });

    await notifyNewLead({ type: "CONTACT", ...parsed.data });
    await sendConfirmationEmail(lead.email, lead.name, "CONTACT");
    await processLeadCapture({
      lead,
      event: "form.contact",
      notifyTitle: "New Contact Lead",
      notifyBody: `${lead.name} submitted a contact form`,
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
