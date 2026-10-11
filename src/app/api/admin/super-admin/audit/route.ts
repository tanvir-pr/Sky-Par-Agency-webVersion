import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;
    if (auth.user.role !== "SUPER_ADMIN") return jsonError("Forbidden", 403);

    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    });

    const byType = logs.reduce<Record<string, number>>((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({ logs, byType, total: logs.length });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
