import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requirePermission("team:read");
    if ("error" in auth) return auth.error;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [users, todayLogins, activeTimers] = await Promise.all([
      prisma.user.findMany({
        where: { role: { not: "CLIENT" }, status: "ACTIVE" },
        select: { id: true, name: true, email: true, role: true, lastLoginAt: true },
        orderBy: { name: "asc" },
      }),
      prisma.loginHistory.findMany({
        where: { createdAt: { gte: today, lt: tomorrow } },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.timeEntry.findMany({
        where: { endTime: null },
        include: { user: { select: { id: true, name: true } } },
      }),
    ]);

    const loginByUser = todayLogins.reduce<Record<string, typeof todayLogins>>((acc, log) => {
      if (!acc[log.userId]) acc[log.userId] = [];
      acc[log.userId].push(log);
      return acc;
    }, {});

    const attendance = users.map((user) => ({
      ...user,
      checkedIn: !!loginByUser[user.id]?.length,
      firstLogin: loginByUser[user.id]?.[0]?.createdAt ?? null,
      isWorking: activeTimers.some((t) => t.userId === user.id),
    }));

    return NextResponse.json({ attendance, date: today.toISOString() });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
