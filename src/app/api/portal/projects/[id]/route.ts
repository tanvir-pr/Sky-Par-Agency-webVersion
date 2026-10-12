import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireClientSession();
    if ("error" in auth) return auth.error;

    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: { id, clientId: auth.clientId },
      include: {
        package: { include: { category: true } },
        milestones: { orderBy: { order: "asc" } },
        files: { orderBy: { createdAt: "desc" } },
        order: true,
      },
    });

    if (!project) {
      return jsonError("Project not found", 404);
    }

    const completedMilestones = project.milestones.filter((m) => m.completed).length;

    return NextResponse.json({
      project,
      milestoneProgress: {
        completed: completedMilestones,
        total: project.milestones.length,
      },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
