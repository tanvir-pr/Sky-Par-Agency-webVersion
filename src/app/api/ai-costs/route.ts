import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const createAiCostSchema = z.object({
  clientId: z.string().optional(),
  provider: z.string().min(1),
  model: z.string().optional(),
  tokens: z.number().int().optional(),
  cost: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("ai:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where = clientId ? { clientId } : {};

    const [logs, total] = await Promise.all([
      prisma.aiCostLog.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.aiCostLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("ai:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createAiCostSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    if (parsed.data.clientId) {
      const client = await prisma.client.findUnique({ where: { id: parsed.data.clientId } });
      if (!client) return jsonError("Client not found", 404);
    }

    const { metadata, ...rest } = parsed.data;
    const log = await prisma.aiCostLog.create({
      data: {
        ...rest,
        tokens: parsed.data.tokens ?? 0,
        metadata: metadata as Prisma.InputJsonValue | undefined,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    });

    await logActivity(auth.user.id, "CREATE", "Logged AI cost", "AiCostLog", log.id);

    return NextResponse.json({ log }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
