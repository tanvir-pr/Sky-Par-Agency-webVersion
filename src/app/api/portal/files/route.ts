import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireClientSession();
    if ("error" in auth) return auth.error;

    const [clientFiles, projectFiles] = await Promise.all([
      prisma.clientFile.findMany({
        where: { clientId: auth.clientId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.projectFile.findMany({
        where: { project: { clientId: auth.clientId } },
        orderBy: { createdAt: "desc" },
        include: { project: { select: { id: true, title: true } } },
      }),
    ]);

    return NextResponse.json({ clientFiles, projectFiles });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
