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

const createDealSchema = z.object({
  title: z.string().min(2),
  clientId: z.string().optional(),
  leadId: z.string().optional(),
  value: z.number().optional(),
  stage: dealStageSchema.optional(),
  assignedToId: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("deals:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const stageParam = searchParams.get("stage");
    const stage = dealStageSchema.safeParse(stageParam).success
      ? (stageParam as DealStage)
      : undefined;
    const clientId = searchParams.get("clientId") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where = {
      ...(stage && { stage }),
      ...(clientId && { clientId }),
    };

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true } },
          lead: { select: { id: true, name: true, email: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.deal.count({ where }),
    ]);

    return NextResponse.json({
      deals,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("deals:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createDealSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    if (parsed.data.clientId) {
      const client = await prisma.client.findUnique({ where: { id: parsed.data.clientId } });
      if (!client) return jsonError("Client not found", 404);
    }

    if (parsed.data.leadId) {
      const lead = await prisma.lead.findUnique({ where: { id: parsed.data.leadId } });
      if (!lead) return jsonError("Lead not found", 404);
    }

    const deal = await prisma.deal.create({
      data: {
        ...parsed.data,
        stage: (parsed.data.stage as DealStage) ?? "QUALIFICATION",
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity(auth.user.id, "CREATE", "Created deal", "Deal", deal.id);

    return NextResponse.json({ deal }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
