import { NextResponse } from "next/server";
import { z } from "zod";
import { ProjectStatus } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const projectStatusSchema = z.enum([
  "PLANNING",
  "IN_PROGRESS",
  "ON_HOLD",
  "CLIENT_REVIEW",
  "COMPLETED",
  "CANCELLED",
]);

const updateProjectSchema = z.object({
  title: z.string().min(2).optional(),
  status: projectStatusSchema.optional(),
  progress: z.number().int().min(0).max(100).optional(),
  deadline: z.string().datetime().nullable().optional(),
  stagingUrl: z.string().nullable().optional(),
  liveUrl: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  packageId: z.string().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("projects:read");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        package: { include: { category: true } },
        order: true,
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        tasks: { orderBy: { order: "asc" } },
        milestones: { orderBy: { order: "asc" } },
      },
    });

    if (!project) return jsonError("Project not found", 404);
    return NextResponse.json({ project });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("projects:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateProjectSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return jsonError("Project not found", 404);

    const { deadline, ...rest } = parsed.data;
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...rest,
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        package: { include: { category: true } },
      },
    });

    if (parsed.data.status && parsed.data.status !== existing.status) {
      await logActivity(
        auth.user.id,
        "STATUS_CHANGE",
        `Project status changed to ${parsed.data.status}`,
        "Project",
        id
      );
    } else {
      await logActivity(auth.user.id, "UPDATE", "Updated project", "Project", id);
    }

    return NextResponse.json({ project });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("projects:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return jsonError("Project not found", 404);

    await prisma.project.delete({ where: { id } });
    await logActivity(auth.user.id, "DELETE", "Deleted project", "Project", id);

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
