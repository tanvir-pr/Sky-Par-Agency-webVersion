import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;

    const [entries, activeEntry] = await Promise.all([
      prisma.timeEntry.findMany({
        where: { userId: auth.user.id },
        orderBy: { startTime: "desc" },
        take: 50,
        include: {
          task: { select: { id: true, title: true, project: { select: { title: true } } } },
        },
      }),
      prisma.timeEntry.findFirst({
        where: { userId: auth.user.id, endTime: null },
        include: {
          task: { select: { id: true, title: true } },
        },
      }),
    ]);

    return NextResponse.json({ entries, activeEntry });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body || typeof body !== "object") return jsonError("Invalid JSON body", 400);

    const action = (body as { action?: string }).action;

    if (action === "start") {
      const existing = await prisma.timeEntry.findFirst({
        where: { userId: auth.user.id, endTime: null },
      });
      if (existing) return jsonError("Timer already running", 400);

      const taskId = (body as { taskId?: string }).taskId;
      const entry = await prisma.timeEntry.create({
        data: {
          userId: auth.user.id,
          taskId: taskId || null,
          startTime: new Date(),
        },
        include: { task: { select: { id: true, title: true } } },
      });
      return NextResponse.json({ entry });
    }

    if (action === "stop") {
      const active = await prisma.timeEntry.findFirst({
        where: { userId: auth.user.id, endTime: null },
      });
      if (!active) return jsonError("No active timer", 400);

      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - active.startTime.getTime()) / 1000);

      const entry = await prisma.timeEntry.update({
        where: { id: active.id },
        data: { endTime, duration },
        include: { task: { select: { id: true, title: true } } },
      });
      return NextResponse.json({ entry });
    }

    return jsonError("Invalid action", 400);
  } catch {
    return jsonError("Internal server error", 500);
  }
}
