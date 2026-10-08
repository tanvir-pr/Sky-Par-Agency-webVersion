import { NextResponse } from "next/server";
import { z } from "zod";
import { DealStage } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const dealStageSchema = z.enum([
  "QUALIFICATION",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
]);

const updateDealSchema = z.object({
  title: z.string().min(2).optional(),
  clientId: z.string().nullable().optional(),
  leadId: z.string().nullable().optional(),
  value: z.number().nullable().optional(),
  stage: dealStageSchema.optional(),
  assignedToId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  closedAt: z.string().datetime().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("deals:read");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        client: true,
        lead: true,
      },
    });

    if (!deal) return jsonError("Deal not found", 404);
    return NextResponse.json({ deal });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("deals:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateDealSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const existing = await prisma.deal.findUnique({ where: { id } });
    if (!existing) return jsonError("Deal not found", 404);

    const { closedAt, stage, ...rest } = parsed.data;
    const data = {
      ...rest,
      stage: stage as DealStage | undefined,
      ...(closedAt !== undefined && { closedAt: closedAt ? new Date(closedAt) : null }),
      ...(stage === "CLOSED_WON" || stage === "CLOSED_LOST"
        ? { closedAt: closedAt ? new Date(closedAt) : new Date() }
        : {}),
    };

    const deal = await prisma.deal.update({
      where: { id },
      data,
      include: {
        client: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, name: true, email: true } },
      },
    });

    if (parsed.data.stage && parsed.data.stage !== existing.stage) {
      await logActivity(
        auth.user.id,
        "STATUS_CHANGE",
        `Deal stage changed to ${parsed.data.stage}`,
        "Deal",
        id
      );
    } else {
      await logActivity(auth.user.id, "UPDATE", "Updated deal", "Deal", id);
    }

    return NextResponse.json({ deal });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("deals:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const existing = await prisma.deal.findUnique({ where: { id } });
    if (!existing) return jsonError("Deal not found", 404);

    await prisma.deal.delete({ where: { id } });
    await logActivity(auth.user.id, "DELETE", "Deleted deal", "Deal", id);

    return NextResponse.json({ message: "Deal deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
