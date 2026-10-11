import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function POST() {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;

    await prisma.notification.updateMany({
      where: { userId: auth.user.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
