import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const createReportSchema = z.object({
  clientId: z.string(),
  type: z.string().min(1),
  period: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("reports:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId") ?? undefined;
    const type = searchParams.get("type") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where = {
      ...(clientId && { clientId }),
      ...(type && { type }),
    };

    const [reports, total] = await Promise.all([
      prisma.marketingReport.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.marketingReport.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("reports:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createReportSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const client = await prisma.client.findUnique({ where: { id: parsed.data.clientId } });
    if (!client) return jsonError("Client not found", 404);

    const { data, ...rest } = parsed.data;
    const report = await prisma.marketingReport.create({
      data: {
        ...rest,
        data: data as Prisma.InputJsonValue,
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity(auth.user.id, "CREATE", "Created marketing report", "MarketingReport", report.id);

    return NextResponse.json({ report }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
