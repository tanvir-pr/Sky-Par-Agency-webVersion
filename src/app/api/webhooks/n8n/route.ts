import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { runAutomation } from "@/lib/automation/triggers";
import { createNotification, notifyAdmins } from "@/lib/notifications/create";
import { verifyN8nSignature } from "@/lib/n8n/verify";
import { n8nConfig } from "@/lib/n8n/config";
import type { N8nInboundAction } from "@/lib/n8n/types";

const inboundSchema = z.object({
  action: z.enum([
    "lead.update",
    "lead.assign",
    "lead.qualify",
    "client.create_from_lead",
    "task.create",
    "meeting.create",
    "notification.admin",
    "project.create_from_order",
  ]),
  payload: z.record(z.string(), z.unknown()),
});

async function handleAction(action: N8nInboundAction, payload: Record<string, unknown>) {
  switch (action) {
    case "lead.update": {
      const leadId = payload.leadId as string;
      const status = payload.status as string | undefined;
      const leadScore = payload.leadScore as number | undefined;
      if (!leadId) throw new Error("leadId required");
      return prisma.lead.update({
        where: { id: leadId },
        data: {
          ...(status ? { status: status as never } : {}),
          ...(leadScore !== undefined ? { leadScore } : {}),
          ...(payload.followUpAt ? { followUpAt: new Date(payload.followUpAt as string) } : {}),
        },
      });
    }
    case "lead.assign": {
      const leadId = payload.leadId as string;
      const userId = payload.userId as string;
      if (!leadId || !userId) throw new Error("leadId and userId required");
      const lead = await prisma.lead.update({
        where: { id: leadId },
        data: { assignedToId: userId },
      });
      await createNotification({
        userId,
        type: "NEW_LEAD",
        title: "Lead assigned via n8n",
        body: `${lead.name} was assigned to you`,
      });
      return lead;
    }
    case "lead.qualify": {
      const leadId = payload.leadId as string;
      const leadScore = (payload.leadScore as number) ?? 80;
      const notes = payload.notes as string | undefined;
      if (!leadId) throw new Error("leadId required");
      const lead = await prisma.lead.update({
        where: { id: leadId },
        data: { leadScore, status: "CONTACTED" },
      });
      if (notes) {
        await prisma.leadActivity.create({
          data: { leadId, type: "NOTE", content: `[AI Qualification] ${notes}` },
        });
      }
      return lead;
    }
    case "client.create_from_lead": {
      const leadId = payload.leadId as string;
      if (!leadId) throw new Error("leadId required");
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead) throw new Error("Lead not found");
      const existing = await prisma.client.findUnique({ where: { email: lead.email } });
      if (existing) return existing;
      const client = await prisma.client.create({
        data: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
        },
      });
      await runAutomation("CLIENT_CREATED", {
        clientId: client.id,
        clientEmail: client.email,
        clientName: client.name,
      });
      return client;
    }
    case "task.create": {
      const projectId = payload.projectId as string;
      const title = payload.title as string;
      if (!projectId || !title) throw new Error("projectId and title required");
      return prisma.task.create({
        data: {
          projectId,
          title,
          description: (payload.description as string) ?? null,
          status: (payload.status as never) ?? "TODO",
          priority: (payload.priority as never) ?? "MEDIUM",
          assigneeId: (payload.assigneeId as string) ?? null,
          dueDate: payload.dueDate ? new Date(payload.dueDate as string) : null,
        },
      });
    }
    case "meeting.create": {
      const title = payload.title as string;
      const startTime = payload.startTime as string;
      const creatorId = payload.creatorId as string;
      if (!title || !startTime || !creatorId) {
        throw new Error("title, startTime, creatorId required");
      }
      return prisma.meeting.create({
        data: {
          title,
          startTime: new Date(startTime),
          endTime: new Date((payload.endTime as string) || startTime),
          creatorId,
          description: (payload.description as string) ?? null,
        },
      });
    }
    case "notification.admin": {
      const title = payload.title as string;
      const body = payload.body as string;
      if (!title || !body) throw new Error("title and body required");
      await notifyAdmins("SYSTEM", title, body, payload.data as Record<string, string> | undefined);
      return { ok: true };
    }
    case "project.create_from_order": {
      const orderId = payload.orderId as string;
      if (!orderId) throw new Error("orderId required");
      const { createProjectFromOrder } = await import("@/lib/orders/create-project");
      return createProjectFromOrder(orderId);
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-n8n-signature");

  if (n8nConfig.webhookSecret && !verifyN8nSignature(rawBody, signature, n8nConfig.webhookSecret)) {
    return jsonError("Invalid n8n signature", 401);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = inboundSchema.safeParse(body);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  try {
    const result = await handleAction(parsed.data.action, parsed.data.payload);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return jsonError(message, 400);
  }
}
