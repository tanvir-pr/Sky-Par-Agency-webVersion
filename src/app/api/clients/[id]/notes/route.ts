import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";

const createNoteSchema = z.object({
  content: z.string().min(1),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("clients:read");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) return jsonError("Client not found", 404);

    const notes = await prisma.clientNote.findMany({
      where: { clientId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notes });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("clients:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createNoteSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) return jsonError("Client not found", 404);

    const note = await prisma.clientNote.create({
      data: {
        clientId: id,
        content: parsed.data.content,
        authorId: auth.user.id,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
