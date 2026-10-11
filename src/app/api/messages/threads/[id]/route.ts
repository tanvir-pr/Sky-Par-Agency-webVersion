import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { createNotification } from "@/lib/notifications/create";

const createMessageSchema = z.object({
  content: z.string().min(1),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("messages:read");
    if ("error" in auth) return auth.error;

    const { id } = await params;

    const membership = await prisma.messageThreadMember.findUnique({
      where: { threadId_userId: { threadId: id, userId: auth.user.id } },
    });
    if (!membership) return jsonError("Thread not found", 404);

    const thread = await prisma.messageThread.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        project: { select: { id: true, title: true } },
      },
    });

    if (!thread) return jsonError("Thread not found", 404);

    const messages = await prisma.message.findMany({
      where: { threadId: id },
      include: {
        sender: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ thread, messages });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("messages:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createMessageSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const membership = await prisma.messageThreadMember.findUnique({
      where: { threadId_userId: { threadId: id, userId: auth.user.id } },
    });
    if (!membership) return jsonError("Thread not found", 404);

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          threadId: id,
          senderId: auth.user.id,
          content: parsed.data.content,
        },
        include: {
          sender: { select: { id: true, name: true, email: true, avatar: true } },
        },
      });

      await tx.messageThread.update({
        where: { id },
        data: { updatedAt: new Date() },
      });

      return created;
    });

    const otherMembers = await prisma.messageThreadMember.findMany({
      where: { threadId: id, userId: { not: auth.user.id } },
      select: { userId: true },
    });

    await Promise.all(
      otherMembers.map((m) =>
        createNotification({
          userId: m.userId,
          type: "CLIENT_MESSAGE",
          title: "New message",
          body: `${auth.user.name}: ${parsed.data.content.slice(0, 100)}`,
          metadata: { threadId: id, messageId: message.id },
        })
      )
    );

    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
