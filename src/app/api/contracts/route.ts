import { NextResponse } from "next/server";
import { z } from "zod";
import { ContractStatus } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const contractStatusSchema = z.enum(["DRAFT", "SENT", "SIGNED", "EXPIRED", "RENEWED"]);

const createContractSchema = z.object({
  title: z.string().min(2),
  clientId: z.string(),
  fileUrl: z.string().optional(),
  status: contractStatusSchema.optional(),
  renewalDate: z.string().datetime().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("contracts:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status = contractStatusSchema.safeParse(statusParam).success
      ? (statusParam as ContractStatus)
      : undefined;
    const clientId = searchParams.get("clientId") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(clientId && { clientId }),
    };

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contract.count({ where }),
    ]);

    return NextResponse.json({
      contracts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("contracts:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createContractSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const client = await prisma.client.findUnique({ where: { id: parsed.data.clientId } });
    if (!client) return jsonError("Client not found", 404);

    const { renewalDate, status, ...rest } = parsed.data;

    const contract = await prisma.contract.create({
      data: {
        ...rest,
        status: (status as ContractStatus) ?? "DRAFT",
        renewalDate: renewalDate ? new Date(renewalDate) : undefined,
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity(auth.user.id, "CREATE", "Created contract", "Contract", contract.id);

    return NextResponse.json({ contract }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
