import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalClients,
      activeClients,
      totalLeads,
      newLeadsThisMonth,
      wonLeads,
      activeProjects,
      completedProjects,
      pendingInvoices,
      totalRevenue,
      monthlyRevenue,
      recentLeads,
      recentActivities,
      upcomingMeetings,
      leadsRaw,
      paymentsByMonth,
      leadsBySource,
      clientsByMonth,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.clientSubscription.count({ where: { status: "ACTIVE" } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.lead.count({ where: { status: "WON" } }),
      prisma.project.count({ where: { status: { in: ["PLANNING", "IN_PROGRESS", "CLIENT_REVIEW"] } } }),
      prisma.project.count({ where: { status: "COMPLETED" } }),
      prisma.invoice.count({ where: { status: { in: ["SENT", "OVERDUE"] } } }),
      prisma.payment.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
      prisma.payment.aggregate({
        where: { status: "COMPLETED", createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, service: true, status: true, source: true, leadScore: true, createdAt: true },
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true } } },
      }),
      prisma.meeting.findMany({
        where: { startTime: { gte: now } },
        orderBy: { startTime: "asc" },
        take: 5,
        include: { creator: { select: { name: true } } },
      }),
      prisma.lead.findMany({
        select: { createdAt: true, status: true, source: true },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.payment.findMany({
        where: { status: "COMPLETED" },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.lead.groupBy({ by: ["source"], _count: { id: true }, where: { source: { not: null } } }),
      prisma.client.findMany({
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
    ]);

    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    const monthMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {
      NEW: 0, CONTACTED: 0, MEETING_SCHEDULED: 0, PROPOSAL_SENT: 0, NEGOTIATION: 0, WON: 0, LOST: 0,
    };

    for (const lead of leadsRaw) {
      statusMap[lead.status] = (statusMap[lead.status] || 0) + 1;
      const date = new Date(lead.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    }

    const leadsByMonth = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, count]) => ({
        month: new Date(`${key}-01`).toLocaleString("en-US", { month: "short", year: "2-digit" }),
        count,
      }));

    const revenueMonthMap: Record<string, number> = {};
    for (const p of paymentsByMonth) {
      const date = new Date(p.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      revenueMonthMap[key] = (revenueMonthMap[key] || 0) + p.amount;
    }
    const revenueByMonth = Object.entries(revenueMonthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, amount]) => ({
        month: new Date(`${key}-01`).toLocaleString("en-US", { month: "short", year: "2-digit" }),
        amount: Math.round(amount),
      }));

    const clientMonthMap: Record<string, number> = {};
    for (const c of clientsByMonth) {
      const date = new Date(c.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      clientMonthMap[key] = (clientMonthMap[key] || 0) + 1;
    }
    const clientGrowth = Object.entries(clientMonthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, count]) => ({
        month: new Date(`${key}-01`).toLocaleString("en-US", { month: "short", year: "2-digit" }),
        count,
      }));

    const leadSources = leadsBySource.map((s) => ({
      source: s.source || "Unknown",
      count: s._count.id,
    }));

    const pipeline = Object.entries(statusMap).map(([status, count]) => ({
      status: status.replace(/_/g, " "),
      count,
    }));

    const teamPerformance = await prisma.task.groupBy({
      by: ["assigneeId"],
      _count: { id: true },
      where: { status: "DONE", assigneeId: { not: null } },
    });

    const teamStats = await Promise.all(
      teamPerformance.slice(0, 5).map(async (t) => {
        const user = t.assigneeId
          ? await prisma.user.findUnique({ where: { id: t.assigneeId }, select: { name: true } })
          : null;
        return { name: user?.name ?? "Unknown", completedTasks: t._count.id };
      })
    );

    return NextResponse.json({
      totalClients,
      activeClients,
      totalLeads,
      newLeadsThisMonth,
      conversionRate,
      activeProjects,
      completedProjects,
      pendingInvoices,
      totalRevenue: totalRevenue._sum.amount ?? 0,
      monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
      recentLeads,
      recentActivities,
      upcomingMeetings,
      leadsByMonth,
      revenueByMonth,
      clientGrowth,
      leadSources,
      pipeline,
      teamPerformance: teamStats,
      totalProjects: activeProjects + completedProjects,
      totalBlogPosts: await prisma.blog.count(),
    });
  } catch (err) {
    console.error("Stats error:", err);
    return jsonError("Internal server error", 500);
  }
}
