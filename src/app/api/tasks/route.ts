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

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string(),
  parentId: z.string().optional(),
  type: taskTypeSchema.optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  kanbanCol: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  order: z.number().int().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("tasks:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") ?? undefined;
    const assigneeId = searchParams.get("assigneeId") ?? undefined;
    const statusParam = searchParams.get("status");
    const status = taskStatusSchema.safeParse(statusParam).success
      ? (statusParam as TaskStatus)
      : undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const where = {
      ...(projectId && { projectId }),
      ...(assigneeId && { assigneeId }),
      ...(status && { status }),
    };

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, title: true } },
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      tasks,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
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

    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const project = await prisma.project.findUnique({ where: { id: parsed.data.projectId } });
    if (!project) return jsonError("Project not found", 404);

    const { dueDate, type, status, priority, ...rest } = parsed.data;

    const task = await prisma.task.create({
      data: {
        ...rest,
        type: (type as TaskType) ?? "GENERAL",
        status: (status as TaskStatus) ?? "TODO",
        priority: (priority as TaskPriority) ?? "MEDIUM",
        creatorId: auth.user.id,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
      },
    });

    if (task.assigneeId) {
      await createNotification({
        userId: task.assigneeId,
        type: "NEW_TASK",
        title: "New task assigned",
        body: `You were assigned: ${task.title}`,
        metadata: { taskId: task.id, projectId: task.projectId },
      });
    }

    await logActivity(auth.user.id, "CREATE", "Created task", "Task", task.id);

    return NextResponse.json({ task }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
