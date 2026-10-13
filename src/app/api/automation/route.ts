import { NextResponse } from "next/server";
import { z } from "zod";
import { AutomationAction, AutomationTrigger, Prisma } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const triggerSchema = z.enum([
  "LEAD_CREATED",
  "CLIENT_CREATED",
  "ORDER_ACCEPTED",
  "INVOICE_OVERDUE",
  "CONTRACT_EXPIRING",
  "TASK_OVERDUE",
  "LEAD_INACTIVE",
]);

const actionSchema = z.enum([
  "ASSIGN_LEAD",
  "SEND_EMAIL",
  "CREATE_TASK",
  "SEND_NOTIFICATION",
]);

const createRuleSchema = z.object({
  name: z.string().min(2),
  trigger: triggerSchema,
  action: actionSchema,
  config: z.record(z.string(), z.unknown()).optional(),
  active: z.boolean().optional(),
});

const updateRuleSchema = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  trigger: triggerSchema.optional(),
  action: actionSchema.optional(),
  config: z.record(z.string(), z.unknown()).nullable().optional(),
  active: z.boolean().optional(),
});

export async function GET() {
  try {
    const auth = await requirePermission("automation:read");
    if ("error" in auth) return auth.error;

    const rules = await prisma.automationRule.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ rules });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("automation:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createRuleSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { config, ...rest } = parsed.data;
    const rule = await prisma.automationRule.create({
      data: {
        ...rest,
        trigger: parsed.data.trigger as AutomationTrigger,
        action: parsed.data.action as AutomationAction,
        active: parsed.data.active ?? true,
        config: config as Prisma.InputJsonValue | undefined,
      },
    });

    await logActivity(auth.user.id, "CREATE", "Created automation rule", "AutomationRule", rule.id);

    return NextResponse.json({ rule }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requirePermission("automation:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateRuleSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { id, trigger, action, config, ...rest } = parsed.data;
    const existing = await prisma.automationRule.findUnique({ where: { id } });
    if (!existing) return jsonError("Rule not found", 404);

    const rule = await prisma.automationRule.update({
      where: { id },
      data: {
        ...rest,
        trigger: trigger as AutomationTrigger | undefined,
        action: action as AutomationAction | undefined,
        ...(config !== undefined && {
          config: config === null ? Prisma.JsonNull : (config as Prisma.InputJsonValue),
        }),
      },
    });

    await logActivity(auth.user.id, "UPDATE", "Updated automation rule", "AutomationRule", id);

    return NextResponse.json({ rule });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
