import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { newsletterSchema } from "@/validations/forms";
import { notifyNewLead, sendConfirmationEmail } from "@/lib/email";
import { buildIdempotencyKey, emitN8nEvent } from "@/lib/n8n";
import { processLeadCapture, leadToEventData } from "@/lib/n8n/lead-pipeline";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const { email } = parsed.data;

    const existing = await prisma.newsletter.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Already subscribed", newsletter: existing },
        { status: 200 }
      );
    }

    const [newsletter, lead] = await prisma.$transaction([
      prisma.newsletter.create({ data: { email } }),
      prisma.lead.create({
        data: {
          name: email.split("@")[0] || "Subscriber",
          email,
          type: "NEWSLETTER",
          source: "Website Newsletter",
        },
      }),
    ]);

    await notifyNewLead({ type: "NEWSLETTER", name: email.split("@")[0], email });
    await sendConfirmationEmail(email, email.split("@")[0], "NEWSLETTER");

    await processLeadCapture({
      lead,
      event: "form.newsletter",
      notifyTitle: "Newsletter signup",
      notifyBody: `${email} subscribed to newsletter`,
      runAutomationTrigger: false,
    });

    await emitN8nEvent(
      "newsletter.subscribed",
      "marketing",
      { email, lead: leadToEventData(lead) },
      buildIdempotencyKey(["newsletter", lead.id])
    );

    return NextResponse.json({ newsletter }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
