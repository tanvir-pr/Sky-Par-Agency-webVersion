import { NextResponse } from "next/server";
import { z } from "zod";
import { ProposalStatus } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const proposalStatusSchema = z.enum(["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED"]);

const createProposalSchema = z.object({
  title: z.string().min(2),
  clientId: z.string(),
  content: z.string().min(1),
  status: proposalStatusSchema.optional(),
  value: z.number().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("proposals:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status = proposalStatusSchema.safeParse(statusParam).success
      ? (statusParam as ProposalStatus)
      : undefined;
    const clientId = searchParams.get("clientId") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(clientId && { clientId }),
    };

    const [proposals, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.proposal.count({ where }),
    ]);

    return NextResponse.json({
      proposals,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("proposals:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createProposalSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const client = await prisma.client.findUnique({ where: { id: parsed.data.clientId } });
    if (!client) return jsonError("Client not found", 404);

    const proposal = await prisma.proposal.create({
      data: {
        ...parsed.data,
        status: (parsed.data.status as ProposalStatus) ?? "DRAFT",
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity(auth.user.id, "CREATE", "Created proposal", "Proposal", proposal.id);

    return NextResponse.json({ proposal }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
