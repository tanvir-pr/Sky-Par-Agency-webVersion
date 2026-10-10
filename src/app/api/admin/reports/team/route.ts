import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requirePermission("reports:read");
    if ("error" in auth) return auth.error;

    const users = await prisma.user.findMany({
      where: { role: { not: "CLIENT" }, status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            assignedTasks: true,
            createdTasks: true,
            projects: true,
            timeEntries: true,
          },
        },
        assignedTasks: {
          where: { status: "DONE" },
          select: { id: true },
        },
      },
    });

    const teamStats = await Promise.all(
      users.map(async (user) => {
        const timeEntries = await prisma.timeEntry.aggregate({
          where: { userId: user.id, duration: { not: null } },
          _sum: { duration: true },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          assignedTasks: user._count.assignedTasks,
          completedTasks: user.assignedTasks.length,
          projects: user._count.projects,
          totalHours: Math.round((timeEntries._sum.duration ?? 0) / 3600 * 10) / 10,
        };
      })
    );

    return NextResponse.json({ team: teamStats });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
