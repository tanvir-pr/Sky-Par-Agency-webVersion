import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;

    const [tasks, projects, notifications] = await Promise.all([
      prisma.task.findMany({
        where: { assigneeId: auth.user.id, status: { not: "DONE" } },
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
        take: 20,
        include: {
          project: { select: { id: true, title: true, status: true } },
        },
      }),
      prisma.projectMember.findMany({
        where: { userId: auth.user.id },
        include: {
          project: {
            select: { id: true, title: true, status: true, progress: true, deadline: true },
          },
        },
      }),
      prisma.notification.findMany({
        where: { userId: auth.user.id, read: false },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const taskStats = {
      todo: tasks.filter((t) => t.status === "TODO").length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      inReview: tasks.filter((t) => t.status === "IN_REVIEW").length,
      blocked: tasks.filter((t) => t.status === "BLOCKED").length,
    };

    return NextResponse.json({
      tasks,
      projects: projects.map((p) => p.project),
      notifications,
      taskStats,
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
