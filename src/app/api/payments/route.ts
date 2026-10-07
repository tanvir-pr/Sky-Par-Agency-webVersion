import { NextResponse } from "next/server";
import { z } from "zod";
import { PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity, notifyAdmins } from "@/lib/notifications/create";

const paymentMethodSchema = z.enum(["STRIPE", "PAYPAL", "BANK_TRANSFER", "CASH"]);
const paymentStatusSchema = z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]);

const createPaymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().positive(),
  method: paymentMethodSchema,
  status: paymentStatusSchema.optional(),
  reference: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("finance:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId") ?? undefined;
    const statusParam = searchParams.get("status");
    const status = paymentStatusSchema.safeParse(statusParam).success
      ? (statusParam as PaymentStatus)
      : undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where = {
      ...(invoiceId && { invoiceId }),
      ...(status && { status }),
    };

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          invoice: {
            include: { client: { select: { id: true, name: true, email: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("finance:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createPaymentSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const invoice = await prisma.invoice.findUnique({ where: { id: parsed.data.invoiceId } });
    if (!invoice) return jsonError("Invoice not found", 404);

    const { metadata, ...rest } = parsed.data;
    const payment = await prisma.payment.create({
      data: {
        ...rest,
        method: parsed.data.method as PaymentMethod,
        status: (parsed.data.status as PaymentStatus) ?? "PENDING",
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
      include: {
        invoice: { include: { client: { select: { id: true, name: true } } } },
      },
    });

    if (payment.status === "COMPLETED") {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID", paidAt: new Date() },
      });
    }

    await logActivity(auth.user.id, "PAYMENT", "Recorded payment", "Payment", payment.id);
    await notifyAdmins(
      "NEW_PAYMENT",
      "Payment received",
      `$${payment.amount} payment recorded for invoice ${invoice.invoiceNumber}`,
      { paymentId: payment.id, invoiceId: invoice.id }
    );

    return NextResponse.json({ payment }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
