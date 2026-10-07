import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-utils";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function GET(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return jsonError("Stripe is not configured", 503);
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return jsonError("session_id is required", 400);
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total,
      currency: session.currency,
      packageName: session.metadata?.packageName ?? null,
    });
  } catch {
    return jsonError("Failed to retrieve payment session", 500);
  }
}
