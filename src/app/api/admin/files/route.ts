import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requirePermission("files:read");
    if ("error" in auth) return auth.error;

    const [clientFiles, projectFiles] = await Promise.all([
      prisma.clientFile.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { client: { select: { id: true, name: true } } },
      }),
      prisma.projectFile.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          project: {
            select: { id: true, title: true, client: { select: { name: true } } },
          },
        },
      }),
    ]);

    return NextResponse.json({ clientFiles, projectFiles });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
