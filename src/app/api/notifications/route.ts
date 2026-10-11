import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;

    const [notifications, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: auth.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.notification.count({
        where: { userId: auth.user.id, read: false },
      }),
    ]);

    return NextResponse.json({ notifications, unread });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
