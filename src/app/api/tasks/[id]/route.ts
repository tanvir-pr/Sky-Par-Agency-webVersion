import { NextResponse } from "next/server";
import { z } from "zod";
import { TaskPriority, TaskStatus, TaskType } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { createNotification, logActivity } from "@/lib/notifications/create";

const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"]);
const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const taskTypeSchema = z.enum([
  "WEB_UI_DESIGN", "WEB_FRONTEND", "WEB_BACKEND", "WEB_TESTING", "WEB_DEPLOYMENT",
  "AUTO_REQUIREMENT", "AUTO_WORKFLOW", "AUTO_API_SETUP", "AUTO_TESTING",
  "AI_SETUP", "AI_PROMPT", "AI_API_INTEGRATION", "AI_DEPLOYMENT",
  "VIDEO_REVIEW", "VIDEO_EDITING", "VIDEO_EFFECTS", "VIDEO_EXPORT",
  "PHOTO_RETOUCH", "PHOTO_COLOR", "PHOTO_EXPORT",
  "MKT_SEO", "MKT_CONTENT", "MKT_ADS", "MKT_REPORTING",
  "GENERAL",
]);

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  type: taskTypeSchema.optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  kanbanCol: z.string().optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  order: z.number().int().optional(),
  completedAt: z.string().datetime().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("tasks:read");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
        subtasks: true,
        timeEntries: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!task) return jsonError("Task not found", 404);
    return NextResponse.json({ task });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("tasks:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return jsonError("Task not found", 404);

    const { dueDate, completedAt, status, ...rest } = parsed.data;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...rest,
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
        ...(status === "DONE" && !completedAt && { completedAt: new Date() }),
        type: rest.type as TaskType | undefined,
        status: status as TaskStatus | undefined,
        priority: rest.priority as TaskPriority | undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
      },
    });

    if (parsed.data.assigneeId && parsed.data.assigneeId !== existing.assigneeId) {
      await createNotification({
        userId: parsed.data.assigneeId,
        type: "NEW_TASK",
        title: "Task assigned",
        body: `You were assigned: ${task.title}`,
        metadata: { taskId: task.id },
      });
      await logActivity(auth.user.id, "ASSIGNMENT", "Assigned task", "Task", id);
    } else if (parsed.data.status && parsed.data.status !== existing.status) {
      await logActivity(
        auth.user.id,
        "STATUS_CHANGE",
        `Task status changed to ${parsed.data.status}`,
        "Task",
        id
      );
    } else {
      await logActivity(auth.user.id, "UPDATE", "Updated task", "Task", id);
    }

    return NextResponse.json({ task });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("tasks:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return jsonError("Task not found", 404);

    await prisma.task.delete({ where: { id } });
    await logActivity(auth.user.id, "DELETE", "Deleted task", "Task", id);

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
