import { prisma } from "@/lib/db";
import { NotificationType, Prisma } from "@prisma/client";
import { triggerPusherEvent, userChannel } from "@/lib/pusher/server";
import { sendEmail } from "@/lib/email";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  sendEmail?: boolean;
  emailTo?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });

  await triggerPusherEvent(userChannel(input.userId), "notification", {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
  });

  if (input.sendEmail && input.emailTo) {
    try {
      await sendEmail({
        to: input.emailTo,
        subject: input.title,
        html: `<p>${input.body}</p>`,
      });
    } catch {
      // email optional
    }
  }

  return notification;
}

export async function notifyAdmins(
  type: NotificationType,
  title: string,
  body: string,
  metadata?: Record<string, unknown>
) {
  const admins = await prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, status: "ACTIVE" },
    select: { id: true, email: true },
  });

  await Promise.all(
    admins.map((admin) =>
      createNotification({ userId: admin.id, type, title, body, metadata })
    )
  );
}

export async function logActivity(
  userId: string | null,
  type: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "STATUS_CHANGE" | "ASSIGNMENT" | "PAYMENT" | "UPLOAD",
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>,
  ip?: string
) {
  return prisma.activityLog.create({
    data: {
      userId: userId ?? undefined,
      type,
      action,
      entityType,
      entityId,
      metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      ip,
    },
  });
}
