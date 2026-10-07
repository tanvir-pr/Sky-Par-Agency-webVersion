import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";
import { notifyNewLead, sendConfirmationEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";
import { notifyAdmins, logActivity } from "@/lib/notifications/create";
import { emitInvoiceEvent, emitLeadWon, emitPaymentReceived } from "@/lib/n8n";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return jsonError("Stripe webhook secret is not configured", 503);
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return jsonError("Missing stripe-signature header", 400);
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("[Stripe] webhook signature verification failed:", error);
    return jsonError("Invalid webhook signature", 400);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const leadId = session.metadata?.leadId;
      const invoiceId = session.metadata?.invoiceId;
      const amountPaid = (session.amount_total || 0) / 100;

      // Invoice payment from the client portal
      if (invoiceId && session.metadata?.kind === "invoice_payment") {
        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId },
          include: { client: true },
        });

        if (invoice && invoice.status !== "PAID") {
          // Idempotency: skip if this Stripe session was already recorded
          const existingPayment = await prisma.payment.findFirst({
            where: { reference: session.id },
          });

          if (!existingPayment) {
            await prisma.payment.create({
              data: {
                invoiceId: invoice.id,
                amount: amountPaid || invoice.total,
                method: "STRIPE",
                status: "COMPLETED",
                reference: session.id,
                metadata: {
                  paymentIntent:
                    typeof session.payment_intent === "string"
                      ? session.payment_intent
                      : (session.payment_intent?.id ?? null),
                  customerEmail: session.customer_email ?? null,
                } as Prisma.InputJsonValue,
              },
            });

            await prisma.invoice.update({
              where: { id: invoice.id },
              data: { status: "PAID", paidAt: new Date() },
            });

            await notifyAdmins(
              "NEW_PAYMENT",
              "Invoice paid",
              `${invoice.client.name} paid invoice ${invoice.invoiceNumber} ($${(amountPaid || invoice.total).toFixed(2)})`,
              { invoiceId: invoice.id }
            );

            await logActivity(null, "PAYMENT", `Invoice ${invoice.invoiceNumber} paid via Stripe`, "Invoice", invoice.id);

            const updatedInvoice = await prisma.invoice.findUnique({
              where: { id: invoice.id },
              include: { client: true },
            });
            if (updatedInvoice) {
              await emitInvoiceEvent(updatedInvoice, "invoice.paid");
              await emitPaymentReceived({
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                amount: amountPaid || Number(invoice.total),
                method: "STRIPE",
                reference: session.id,
                clientName: invoice.client.name,
              });
            }
          }
        }

        return NextResponse.json({ received: true });
      }

      if (leadId) {
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });

        if (lead) {
          const paymentNote = [
            lead.message,
            `\nPayment confirmed via Stripe.`,
            `Session: ${session.id}`,
            session.payment_intent
              ? `Payment Intent: ${session.payment_intent}`
              : null,
            `Amount Paid: $${((session.amount_total || 0) / 100).toFixed(2)}`,
          ]
            .filter(Boolean)
            .join("\n");

          await prisma.lead.update({
            where: { id: leadId },
            data: {
              status: "WON",
              message: paymentNote,
            },
          });

          await notifyNewLead({
            type: "CHECKOUT (PAID)",
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            service: lead.service,
            budget: lead.budget,
            message: paymentNote,
          });

          await sendConfirmationEmail(
            lead.email,
            lead.name,
            "CHECKOUT — Payment Received"
          );

          await emitLeadWon({
            leadId: lead.id,
            stripeSessionId: session.id,
            amountPaid: (session.amount_total || 0) / 100,
            currency: session.currency ?? "usd",
            service: lead.service ?? undefined,
            customer: {
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
            },
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe] webhook handler error:", error);
    return jsonError("Webhook handler failed", 500);
  }
}
