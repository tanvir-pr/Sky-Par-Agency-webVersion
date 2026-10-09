import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const updateMilestoneSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  completed: z.boolean().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  order: z.number().int().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("projects:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateMilestoneSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const existing = await prisma.milestone.findUnique({ where: { id } });
    if (!existing) return jsonError("Milestone not found", 404);

    const { dueDate, completedAt, completed, ...rest } = parsed.data;
    const milestone = await prisma.milestone.update({
      where: { id },
      data: {
        ...rest,
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
        ...(completed === true && !completedAt && { completedAt: new Date() }),
        ...(completed !== undefined && { completed }),
      },
    });

    await logActivity(auth.user.id, "UPDATE", "Updated milestone", "Milestone", id);

    return NextResponse.json({ milestone });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("projects:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const existing = await prisma.milestone.findUnique({ where: { id } });
    if (!existing) return jsonError("Milestone not found", 404);

    await prisma.milestone.delete({ where: { id } });
    await logActivity(auth.user.id, "DELETE", "Deleted milestone", "Milestone", id);

    return NextResponse.json({ message: "Milestone deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
