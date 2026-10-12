import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireClientSession();
    if ("error" in auth) return auth.error;

    const threads = await prisma.messageThread.findMany({
      where: {
        members: { some: { userId: auth.user.id } },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, role: true } } },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: { select: { id: true, name: true } } },
        },
        project: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ threads });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
