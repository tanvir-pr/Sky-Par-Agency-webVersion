import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requirePermission("calendar:read");
    if ("error" in auth) return auth.error;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const meetings = await prisma.meeting.findMany({
      where: {
        startTime: { gte: startOfMonth, lte: endOfMonth },
        OR: [
          { creatorId: auth.user.id },
          { attendees: { some: { userId: auth.user.id } } },
        ],
      },
      orderBy: { startTime: "asc" },
      include: {
        creator: { select: { id: true, name: true } },
        attendees: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json({ meetings });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
