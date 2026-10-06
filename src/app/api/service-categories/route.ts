import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requirePermission("services:read");
    if ("error" in auth) return auth.error;

    const categories = await prisma.serviceCategory.findMany({
      include: {
        packages: { orderBy: { order: "asc" } },
        service: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ categories });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
