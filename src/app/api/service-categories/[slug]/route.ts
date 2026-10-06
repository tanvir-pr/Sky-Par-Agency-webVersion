import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requirePermission("services:read");
    if ("error" in auth) return auth.error;

    const { slug } = await params;
    const category = await prisma.serviceCategory.findUnique({
      where: { slug },
      include: {
        packages: { orderBy: { order: "asc" } },
        service: { select: { id: true, title: true, slug: true } },
      },
    });

    if (!category) return jsonError("Category not found", 404);

    return NextResponse.json({ category });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
