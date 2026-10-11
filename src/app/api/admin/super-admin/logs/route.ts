import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;
    if (auth.user.role !== "SUPER_ADMIN") return jsonError("Forbidden", 403);

    const allActivity = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ systemLogs: allActivity });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
