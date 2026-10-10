import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requirePermission("reports:read");
    if ("error" in auth) return auth.error;

    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: {
            projects: true,
            orders: true,
            invoices: true,
            subscriptions: true,
          },
        },
        subscriptions: { where: { status: "ACTIVE" } },
        invoices: {
          where: { status: "PAID" },
          select: { total: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const clientStats = clients.map((c) => ({
      id: c.id,
      name: c.name,
      company: c.company,
      email: c.email,
      industry: c.industry,
      projects: c._count.projects,
      orders: c._count.orders,
      invoices: c._count.invoices,
      activeSubscriptions: c.subscriptions.length,
      totalRevenue: c.invoices.reduce((sum, i) => sum + i.total, 0),
      createdAt: c.createdAt,
    }));

    return NextResponse.json({
      totalClients: clients.length,
      clients: clientStats,
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
