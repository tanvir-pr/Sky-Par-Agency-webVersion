import { NextResponse } from "next/server";
import { z } from "zod";
import { InvoiceStatus } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { generateInvoiceNumber } from "@/lib/serial-numbers";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity, notifyAdmins } from "@/lib/notifications/create";

const invoiceStatusSchema = z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]);

// Standardized line item shape used across seed, PDF, portal and admin.
const lineItemSchema = z.object({
  description: z.string().min(1),
  amount: z.number(),
  qty: z.number().optional().default(1),
});

const createInvoiceSchema = z.object({
  clientId: z.string(),
  status: invoiceStatusSchema.optional(),
  lineItems: z.array(lineItemSchema).min(1),
  subtotal: z.number(),
  tax: z.number().optional(),
  total: z.number(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("invoices:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status = invoiceStatusSchema.safeParse(statusParam).success
      ? (statusParam as InvoiceStatus)
      : undefined;
    const clientId = searchParams.get("clientId") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(clientId && { clientId }),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true, company: true } },
          _count: { select: { payments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("invoices:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createInvoiceSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const client = await prisma.client.findUnique({ where: { id: parsed.data.clientId } });
    if (!client) return jsonError("Client not found", 404);

    const invoiceNumber = await generateInvoiceNumber();
    const { dueDate, status, ...rest } = parsed.data;

    const parsedDue = dueDate ? new Date(dueDate) : undefined;
    if (parsedDue && Number.isNaN(parsedDue.getTime())) {
      return jsonError("Invalid due date", 400);
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        status: (status as InvoiceStatus) ?? "DRAFT",
        dueDate: parsedDue,
        tax: parsed.data.tax ?? 0,
        ...rest,
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity(auth.user.id, "CREATE", "Created invoice", "Invoice", invoice.id);
    await notifyAdmins("SYSTEM", "New invoice", `Invoice ${invoiceNumber} created for ${client.name}`, {
      invoiceId: invoice.id,
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
