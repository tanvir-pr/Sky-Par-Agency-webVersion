import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";

const packageSchema = z.object({
  name: z.string().min(2),
  price: z.string(),
  deliveryTime: z.string(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  popular: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requirePermission("services:read");
    if ("error" in auth) return auth.error;

    const { slug } = await params;
    const category = await prisma.serviceCategory.findUnique({ where: { slug } });
    if (!category) return jsonError("Category not found", 404);

    const packages = await prisma.servicePackage.findMany({
      where: { categoryId: category.id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ packages });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await requirePermission("services:write");
    if ("error" in auth) return auth.error;

    const { slug } = await params;
    const category = await prisma.serviceCategory.findUnique({ where: { slug } });
    if (!category) return jsonError("Category not found", 404);

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = packageSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const pkgSlug = parsed.data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

    const pkg = await prisma.servicePackage.create({
      data: {
        categoryId: category.id,
        slug: pkgSlug,
        name: parsed.data.name,
        price: parsed.data.price,
        deliveryTime: parsed.data.deliveryTime,
        description: parsed.data.description,
        features: parsed.data.features ?? [],
        popular: parsed.data.popular ?? false,
        order: parsed.data.order ?? 0,
      },
    });

    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
