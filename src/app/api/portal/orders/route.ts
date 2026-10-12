import { NextResponse } from "next/server";
import { z } from "zod";
import { requireClientSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/serial-numbers";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { notifyAdmins } from "@/lib/notifications/create";

const orderSchema = z.object({
  packageId: z.string().min(1),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const auth = await requireClientSession();
    if ("error" in auth) return auth.error;

    const orders = await prisma.order.findMany({
      where: { clientId: auth.clientId },
      orderBy: { createdAt: "desc" },
      include: {
        package: { include: { category: true } },
        project: { select: { id: true, title: true, status: true } },
      },
    });

    return NextResponse.json({ orders });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireClientSession();
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const pkg = await prisma.servicePackage.findUnique({
      where: { id: parsed.data.packageId },
    });

    if (!pkg) {
      return jsonError("Package not found", 404);
    }

    const price = pkg.priceCents ? pkg.priceCents / 100 : parseFloat(pkg.price.replace(/[^0-9.]/g, "")) || 0;

    const orderNumber = await generateOrderNumber();

    const client = await prisma.client.findUnique({
      where: { id: auth.clientId },
      select: { name: true },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        clientId: auth.clientId,
        packageId: parsed.data.packageId,
        price,
        notes: parsed.data.notes,
        status: "NEW",
      },
      include: {
        package: { include: { category: true } },
      },
    });

    // Notify admins so a client-placed order shows up in the admin dashboard.
    await notifyAdmins(
      "SYSTEM",
      "New order request",
      `${client?.name ?? "A client"} placed order ${orderNumber} for ${order.package.name}`,
      { orderId: order.id }
    );

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
