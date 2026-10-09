import { NextResponse } from "next/server";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { createProjectFromOrder } from "@/lib/orders/create-project";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity, notifyAdmins } from "@/lib/notifications/create";
import { emitOrderAccepted, emitProjectCreated } from "@/lib/n8n";

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

const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  price: z.number().positive().optional(),
  notes: z.string().nullable().optional(),
  managerId: z.string().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("orders:read");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        package: { include: { category: true } },
        manager: { select: { id: true, name: true, email: true } },
        project: { include: { tasks: true } },
      },
    });

    if (!order) return jsonError("Order not found", 404);
    return NextResponse.json({ order });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("orders:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateOrderSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { project: true },
    });
    if (!existing) return jsonError("Order not found", 404);

    const order = await prisma.order.update({
      where: { id },
      data: parsed.data,
      include: {
        client: { select: { id: true, name: true, email: true } },
        package: { include: { category: true } },
        manager: { select: { id: true, name: true, email: true } },
        project: { include: { tasks: true } },
      },
    });

    let projectResult = null;
    if (parsed.data.status === "ACCEPTED" && existing.status !== "ACCEPTED") {
      projectResult = await createProjectFromOrder(id, auth.user.id);
      await notifyAdmins(
        "SYSTEM",
        "Order accepted",
        `Order ${order.orderNumber} was accepted and project created`,
        { orderId: id, projectId: projectResult.project.id }
      );
      await emitOrderAccepted({
        ...order,
        project: projectResult.project,
      });
      await emitProjectCreated(projectResult.project);
    }

    if (parsed.data.status && parsed.data.status !== existing.status) {
      await logActivity(
        auth.user.id,
        "STATUS_CHANGE",
        `Order status changed to ${parsed.data.status}`,
        "Order",
        id,
        { from: existing.status, to: parsed.data.status }
      );
    } else {
      await logActivity(auth.user.id, "UPDATE", "Updated order", "Order", id);
    }

    return NextResponse.json({
      order,
      ...(projectResult && {
        project: projectResult.project,
        invoice: projectResult.invoice,
      }),
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
