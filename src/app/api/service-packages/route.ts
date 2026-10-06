import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const createPackageSchema = z.object({
  categoryId: z.string(),
  name: z.string().min(2),
  slug: z.string().min(2),
  price: z.string(),
  priceCents: z.number().int().optional(),
  deliveryTime: z.string(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  popular: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("services:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId") ?? undefined;

    const packages = await prisma.servicePackage.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: true },
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    });

    return NextResponse.json({ packages });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("services:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createPackageSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const category = await prisma.serviceCategory.findUnique({
      where: { id: parsed.data.categoryId },
    });
    if (!category) return jsonError("Category not found", 404);

    const { metadata, features, ...rest } = parsed.data;
    const pkg = await prisma.servicePackage.create({
      data: {
        ...rest,
        features: features ?? [],
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
      include: { category: true },
    });

    await logActivity(auth.user.id, "CREATE", "Created service package", "ServicePackage", pkg.id);

    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
