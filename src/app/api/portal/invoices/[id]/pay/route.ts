import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";
import { SITE_CONFIG } from "@/lib/constants";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

// Client initiates payment for one of their own invoices via Stripe Checkout.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireClientSession();
    if ("error" in auth) return auth.error;

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!invoice || invoice.clientId !== auth.clientId) {
      return jsonError("Invoice not found", 404);
    }

    if (invoice.status === "PAID") {
      return jsonError("This invoice is already paid", 400);
    }
    if (invoice.status === "CANCELLED" || invoice.status === "DRAFT") {
      return jsonError("This invoice is not available for payment", 400);
    }

    if (!isStripeConfigured()) {
      return jsonError(
        "Online payment is not configured. Please contact us to settle this invoice.",
        503
      );
    }

    const stripe = getStripe();
    const siteUrl = SITE_CONFIG.url;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: invoice.client.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(invoice.total * 100),
            product_data: {
              name: `Invoice ${invoice.invoiceNumber}`,
              description: `Payment for invoice ${invoice.invoiceNumber}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        kind: "invoice_payment",
      },
      success_url: `${siteUrl}/portal/invoices?paid=${invoice.invoiceNumber}`,
      cancel_url: `${siteUrl}/portal/invoices?cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Portal] invoice pay error:", error);
    return jsonError("Failed to start payment", 500);
  }
}
