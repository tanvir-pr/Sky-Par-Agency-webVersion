import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const startTimerSchema = z.object({
  taskId: z.string().optional(),
  notes: z.string().optional(),
});

const stopTimerSchema = z.object({
  id: z.string(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("tasks:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId") ?? undefined;
    const userId = searchParams.get("userId") ?? auth.user.id;
    const activeOnly = searchParams.get("active") === "true";

    const where = {
      userId,
      ...(taskId && { taskId }),
      ...(activeOnly && { endTime: null }),
    };

    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        task: { select: { id: true, title: true, projectId: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { startTime: "desc" },
      take: activeOnly ? 1 : 50,
    });

    return NextResponse.json({ entries });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("tasks:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = startTimerSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const activeEntry = await prisma.timeEntry.findFirst({
      where: { userId: auth.user.id, endTime: null },
    });
    if (activeEntry) {
      return jsonError("You already have an active timer. Stop it first.", 409);
    }

    if (parsed.data.taskId) {
      const task = await prisma.task.findUnique({ where: { id: parsed.data.taskId } });
      if (!task) return jsonError("Task not found", 404);
    }

    const entry = await prisma.timeEntry.create({
      data: {
        userId: auth.user.id,
        taskId: parsed.data.taskId,
        startTime: new Date(),
        notes: parsed.data.notes,
      },
      include: {
        task: { select: { id: true, title: true } },
      },
    });

    await logActivity(auth.user.id, "CREATE", "Started time entry", "TimeEntry", entry.id);

    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requirePermission("tasks:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = stopTimerSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const existing = await prisma.timeEntry.findUnique({ where: { id: parsed.data.id } });
    if (!existing) return jsonError("Time entry not found", 404);
    if (existing.userId !== auth.user.id) return jsonError("Forbidden", 403);
    if (existing.endTime) return jsonError("Timer already stopped", 400);

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - existing.startTime.getTime()) / 1000);

    const entry = await prisma.timeEntry.update({
      where: { id: parsed.data.id },
      data: {
        endTime,
        duration,
        notes: parsed.data.notes ?? existing.notes,
      },
      include: {
        task: { select: { id: true, title: true } },
      },
    });

    await logActivity(auth.user.id, "UPDATE", "Stopped time entry", "TimeEntry", entry.id);

    return NextResponse.json({ entry });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
