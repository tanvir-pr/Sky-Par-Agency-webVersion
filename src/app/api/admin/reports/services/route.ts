import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requirePermission("reports:read");
    if ("error" in auth) return auth.error;

    const [subscriptions, orders, packages] = await Promise.all([
      prisma.clientSubscription.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
        _sum: { price: true },
      }),
      prisma.servicePackage.findMany({
        include: {
          category: true,
          _count: { select: { subscriptions: true, orders: true } },
        },
        orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
      }),
    ]);

    const activeSubscriptions = await prisma.clientSubscription.count({
      where: { status: "ACTIVE" },
    });

    return NextResponse.json({
      activeSubscriptions,
      subscriptionsByStatus: subscriptions,
      ordersByStatus: orders,
      packageStats: packages.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category.name,
        subscriptions: p._count.subscriptions,
        orders: p._count.orders,
      })),
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
