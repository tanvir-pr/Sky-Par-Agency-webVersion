import { NextResponse } from "next/server";
import { z } from "zod";
import { InvoiceStatus } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const invoiceStatusSchema = z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]);

const lineItemSchema = z.object({
  description: z.string().min(1),
  amount: z.number(),
  qty: z.number().optional().default(1),
});

const updateInvoiceSchema = z.object({
  status: invoiceStatusSchema.optional(),
  lineItems: z.array(lineItemSchema).optional(),
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  total: z.number().optional(),
  dueDate: z.string().nullable().optional(),
  pdfUrl: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  sentAt: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("invoices:read");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        payments: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!invoice) return jsonError("Invoice not found", 404);
    return NextResponse.json({ invoice });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("invoices:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateInvoiceSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) return jsonError("Invoice not found", 404);

    const { dueDate, sentAt, paidAt, status, ...rest } = parsed.data;
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...rest,
        status: status as InvoiceStatus | undefined,
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(sentAt !== undefined && { sentAt: sentAt ? new Date(sentAt) : null }),
        ...(paidAt !== undefined && { paidAt: paidAt ? new Date(paidAt) : null }),
        ...(status === "SENT" && !sentAt && { sentAt: new Date() }),
        ...(status === "PAID" && !paidAt && { paidAt: new Date() }),
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        payments: true,
      },
    });

    // When manually marked PAID, record a Payment so revenue reporting stays accurate.
    if (status === "PAID" && existing.status !== "PAID") {
      const completed = await prisma.payment.aggregate({
        where: { invoiceId: id, status: "COMPLETED" },
        _sum: { amount: true },
      });
      const alreadyPaid = completed._sum.amount ?? 0;
      const remaining = invoice.total - alreadyPaid;
      if (remaining > 0.01) {
        await prisma.payment.create({
          data: {
            invoiceId: id,
            amount: remaining,
            method: "BANK_TRANSFER",
            status: "COMPLETED",
            reference: "manual-mark-paid",
          },
        });
      }
    }

    if (parsed.data.status && parsed.data.status !== existing.status) {
      await logActivity(
        auth.user.id,
        "STATUS_CHANGE",
        `Invoice status changed to ${parsed.data.status}`,
        "Invoice",
        id
      );
    } else {
      await logActivity(auth.user.id, "UPDATE", "Updated invoice", "Invoice", id);
    }

    return NextResponse.json({ invoice });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("invoices:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const existing = await prisma.invoice.findUnique({
      where: { id },
      include: { _count: { select: { payments: true } } },
    });
    if (!existing) return jsonError("Invoice not found", 404);

    if (existing._count.payments > 0) {
      return jsonError(
        "Cannot delete an invoice with recorded payments. Cancel it instead.",
        400
      );
    }

    await prisma.invoice.delete({ where: { id } });
    await logActivity(auth.user.id, "DELETE", "Deleted invoice", "Invoice", id);

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
