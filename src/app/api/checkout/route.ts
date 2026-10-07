import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { checkoutSchema } from "@/validations/forms";
import { notifyNewLead, sendConfirmationEmail } from "@/lib/email";
import { processLeadCapture } from "@/lib/n8n/lead-pipeline";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const {
      packageName,
      packagePrice,
      serviceSlug,
      serviceTitle,
      paymentMethod,
      message,
      ...rest
    } = parsed.data;

    const leadMessage = [
      `Service: ${serviceTitle}`,
      `Plan: ${packageName} (${packagePrice})`,
      `Payment Method: ${paymentMethod.replace("_", " ")}`,
      message || null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const lead = await prisma.lead.create({
      data: {
        ...rest,
        service: `${serviceTitle} — ${packageName}`,
        budget: packagePrice,
        message: leadMessage,
        type: "CHECKOUT",
      },
    });

    await notifyNewLead({
      type: "CHECKOUT",
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      service: lead.service,
      budget: lead.budget,
      message: lead.message,
    });
    await sendConfirmationEmail(lead.email, lead.name, "CHECKOUT");
    await processLeadCapture({
      lead,
      event: "form.checkout",
      notifyTitle: "New Checkout Lead",
      notifyBody: `${lead.name} submitted a checkout request`,
    });

    return NextResponse.json({ lead, message: "Payment request submitted successfully" }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
