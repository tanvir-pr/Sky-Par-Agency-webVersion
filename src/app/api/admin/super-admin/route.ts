import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;

    if (auth.user.role !== "SUPER_ADMIN") {
      return jsonError("Forbidden", 403);
    }

    const [
      userCount,
      clientCount,
      projectCount,
      activeRules,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.client.count(),
      prisma.project.count(),
      prisma.automationRule.count({ where: { active: true } }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true } } },
      }),
    ]);

    return NextResponse.json({
      stats: { userCount, clientCount, projectCount, activeRules },
      recentActivity,
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
