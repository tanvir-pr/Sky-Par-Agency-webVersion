import { NextResponse } from "next/server";
import { z } from "zod";
import { MessageThreadType } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";

const threadTypeSchema = z.enum(["DIRECT", "GROUP", "PROJECT", "CLIENT_TICKET"]);

const createThreadSchema = z.object({
  title: z.string().optional(),
  type: threadTypeSchema.optional(),
  projectId: z.string().optional(),
  memberIds: z.array(z.string()).min(1),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("messages:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") ?? undefined;

    const threads = await prisma.messageThread.findMany({
      where: {
        members: { some: { userId: auth.user.id } },
        ...(projectId && { projectId }),
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: { select: { id: true, name: true } } },
        },
        project: { select: { id: true, title: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ threads });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("messages:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createThreadSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const memberIds = [...new Set([auth.user.id, ...parsed.data.memberIds])];

    const thread = await prisma.messageThread.create({
      data: {
        title: parsed.data.title,
        type: (parsed.data.type as MessageThreadType) ?? "DIRECT",
        projectId: parsed.data.projectId,
        members: {
          create: memberIds.map((userId) => ({ userId })),
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
      },
    });

    return NextResponse.json({ thread }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
