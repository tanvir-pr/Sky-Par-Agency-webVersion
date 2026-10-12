import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireClientSession();
    if ("error" in auth) return auth.error;

    const { clientId } = auth;

    const [
      client,
      subscriptions,
      projects,
      invoices,
      orders,
      unreadMessages,
    ] = await Promise.all([
      prisma.client.findUnique({
        where: { id: clientId },
        select: { id: true, name: true, company: true, email: true },
      }),
      prisma.clientSubscription.findMany({
        where: { clientId, status: "ACTIVE" },
        include: {
          package: {
            include: { category: true },
          },
        },
      }),
      prisma.project.findMany({
        where: { clientId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          progress: true,
          deadline: true,
          updatedAt: true,
        },
      }),
      prisma.invoice.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.order.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { package: true },
      }),
      prisma.message.count({
        where: {
          read: false,
          thread: {
            members: {
              some: { userId: auth.user.id },
            },
          },
          senderId: { not: auth.user.id },
        },
      }),
    ]);

    const activeProjects = await prisma.project.count({
      where: {
        clientId,
        status: { in: ["PLANNING", "IN_PROGRESS", "CLIENT_REVIEW"] },
      },
    });

    const pendingInvoices = invoices.filter(
      (inv) => inv.status === "SENT" || inv.status === "OVERDUE"
    );

    const outstandingBalance = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);

    return NextResponse.json({
      client,
      stats: {
        activeSubscriptions: subscriptions.length,
        activeProjects,
        pendingInvoices: pendingInvoices.length,
        outstandingBalance,
        unreadMessages,
      },
      subscriptions,
      recentProjects: projects,
      recentInvoices: invoices,
      recentOrders: orders,
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
