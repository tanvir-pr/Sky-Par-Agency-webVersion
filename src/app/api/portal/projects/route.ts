import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireClientSession();
    if ("error" in auth) return auth.error;

    const projects = await prisma.project.findMany({
      where: { clientId: auth.clientId },
      orderBy: { updatedAt: "desc" },
      include: {
        package: { include: { category: true } },
        milestones: { orderBy: { order: "asc" } },
        _count: { select: { tasks: true, files: true } },
      },
    });

    return NextResponse.json({ projects });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
