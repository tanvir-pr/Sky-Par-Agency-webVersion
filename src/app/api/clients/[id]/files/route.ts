import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const createFileSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  type: z.string().optional(),
  size: z.number().int().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("files:read");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) return jsonError("Client not found", 404);

    const files = await prisma.clientFile.findMany({
      where: { clientId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ files });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("files:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createFileSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) return jsonError("Client not found", 404);

    const file = await prisma.clientFile.create({
      data: { clientId: id, ...parsed.data },
    });

    await logActivity(auth.user.id, "UPLOAD", "Uploaded client file", "ClientFile", file.id, {
      clientId: id,
    });

    return NextResponse.json({ file }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
