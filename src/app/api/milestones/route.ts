import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const createMilestoneSchema = z.object({
  projectId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  order: z.number().int().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("projects:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") ?? undefined;

    const milestones = await prisma.milestone.findMany({
      where: projectId ? { projectId } : undefined,
      include: { project: { select: { id: true, title: true } } },
      orderBy: [{ project: { title: "asc" } }, { order: "asc" }],
    });

    return NextResponse.json({ milestones });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("projects:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createMilestoneSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const project = await prisma.project.findUnique({ where: { id: parsed.data.projectId } });
    if (!project) return jsonError("Project not found", 404);

    const { dueDate, ...rest } = parsed.data;

    const milestone = await prisma.milestone.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    await logActivity(auth.user.id, "CREATE", "Created milestone", "Milestone", milestone.id);

    return NextResponse.json({ milestone }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
