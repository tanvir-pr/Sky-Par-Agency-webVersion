import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const updatePackageSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  price: z.string().optional(),
  priceCents: z.number().int().nullable().optional(),
  deliveryTime: z.string().optional(),
  description: z.string().nullable().optional(),
  features: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  popular: z.boolean().optional(),
  order: z.number().int().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("services:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updatePackageSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const existing = await prisma.servicePackage.findUnique({ where: { id } });
    if (!existing) return jsonError("Package not found", 404);

    const { metadata, ...rest } = parsed.data;
    const pkg = await prisma.servicePackage.update({
      where: { id },
      data: {
        ...rest,
        ...(metadata !== undefined && {
          metadata: metadata === null ? Prisma.JsonNull : (metadata as Prisma.InputJsonValue),
        }),
      },
      include: { category: true },
    });

    await logActivity(auth.user.id, "UPDATE", "Updated service package", "ServicePackage", id);

    return NextResponse.json({ package: pkg });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("services:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const existing = await prisma.servicePackage.findUnique({ where: { id } });
    if (!existing) return jsonError("Package not found", 404);

    await prisma.servicePackage.delete({ where: { id } });
    await logActivity(auth.user.id, "DELETE", "Deleted service package", "ServicePackage", id);

    return NextResponse.json({ message: "Package deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
