import { NextResponse } from "next/server";
import { z } from "zod";
import { SITE_CONFIG } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { getCheckoutSelection, getDepositCentsFromPlan } from "@/lib/pricing";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const createSessionSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(1),
  company: z.string().optional(),
  serviceSlug: z.string().min(1),
  serviceTitle: z.string().min(1),
  packageName: z.string().min(1),
  packagePrice: z.string().min(1),
  message: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return jsonError(
        "Stripe is not configured. Add STRIPE_SECRET_KEY to your environment.",
        503
      );
    }

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createSessionSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const {
      serviceSlug,
      serviceTitle,
      packageName,
      packagePrice,
      message,
      ...customer
    } = parsed.data;

    const selection = await getCheckoutSelection(serviceSlug, packageName);
    if (!selection) {
      return jsonError("Invalid service or plan selected", 400);
    }

    const depositCents = getDepositCentsFromPlan(selection.plan);
    if (!depositCents) {
      return jsonError(
        "Online card payment is not available for this plan. Please contact us for a custom quote.",
        400
      );
    }

    const leadMessage = [
      `Service: ${serviceTitle}`,
      `Plan: ${packageName} (${packagePrice})`,
      `Payment: Stripe — Visa/Mastercard (50% deposit)`,
      message || null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const lead = await prisma.lead.create({
      data: {
        ...customer,
        service: `${serviceTitle} — ${packageName}`,
        budget: packagePrice,
        message: leadMessage,
        type: "CHECKOUT",
        status: "NEW",
      },
    });

    const stripe = getStripe();
    const siteUrl = SITE_CONFIG.url;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customer.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: depositCents,
            product_data: {
              name: `${serviceTitle} — ${packageName} (50% Deposit)`,
              description: `${serviceTitle} ${packageName} plan (${packagePrice} total). Remaining balance due on completion.`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        leadId: lead.id,
        serviceSlug,
        serviceTitle,
        packageName,
        customerName: customer.name,
        phone: customer.phone,
        company: customer.company || "",
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel?service=${encodeURIComponent(serviceSlug)}&plan=${encodeURIComponent(packageName.toLowerCase().replace(/\s+/g, "-"))}`,
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        message: `${leadMessage}\n\nStripe Session: ${session.id}`,
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("[Stripe] create-checkout-session error:", error);
    return jsonError("Failed to create payment session", 500);
  }
}
