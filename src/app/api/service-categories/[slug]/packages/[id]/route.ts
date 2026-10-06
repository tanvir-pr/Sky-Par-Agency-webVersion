import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";

const packageSchema = z.object({
  name: z.string().min(2).optional(),
  price: z.string().optional(),
  deliveryTime: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  popular: z.boolean().optional(),
  order: z.number().int().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const auth = await requirePermission("services:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = packageSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const pkg = await prisma.servicePackage.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ package: pkg });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const auth = await requirePermission("services:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    await prisma.servicePackage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
