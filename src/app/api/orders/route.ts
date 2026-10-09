import { NextResponse } from "next/server";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/serial-numbers";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity, notifyAdmins } from "@/lib/notifications/create";

const orderStatusSchema = z.enum([
  "NEW",
  "REVIEW",
  "ACCEPTED",
  "IN_PROGRESS",
  "CLIENT_REVIEW",
  "REVISION",
  "COMPLETED",
  "CANCELLED",
]);

const createOrderSchema = z.object({
  clientId: z.string(),
  packageId: z.string(),
  price: z.number().positive(),
  status: orderStatusSchema.optional(),
  notes: z.string().optional(),
  managerId: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("orders:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status = orderStatusSchema.safeParse(statusParam).success
      ? (statusParam as OrderStatus)
      : undefined;
    const clientId = searchParams.get("clientId") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(clientId && { clientId }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true } },
          package: { include: { category: true } },
          manager: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, title: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("orders:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const [client, pkg] = await Promise.all([
      prisma.client.findUnique({ where: { id: parsed.data.clientId } }),
      prisma.servicePackage.findUnique({ where: { id: parsed.data.packageId } }),
    ]);

    if (!client) return jsonError("Client not found", 404);
    if (!pkg) return jsonError("Package not found", 404);

    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        ...parsed.data,
        status: (parsed.data.status as OrderStatus) ?? "NEW",
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        package: { include: { category: true } },
        manager: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity(auth.user.id, "CREATE", "Created order", "Order", order.id);
    await notifyAdmins("SYSTEM", "New order", `Order ${orderNumber} created for ${client.name}`, {
      orderId: order.id,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
