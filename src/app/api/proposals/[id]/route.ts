import { NextResponse } from "next/server";
import { z } from "zod";
import { ProposalStatus } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const proposalStatusSchema = z.enum(["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED"]);

const updateProposalSchema = z.object({
  title: z.string().min(2).optional(),
  content: z.string().min(1).optional(),
  status: proposalStatusSchema.optional(),
  value: z.number().nullable().optional(),
  sentAt: z.string().datetime().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("proposals:read");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!proposal) return jsonError("Proposal not found", 404);
    return NextResponse.json({ proposal });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("proposals:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateProposalSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const existing = await prisma.proposal.findUnique({ where: { id } });
    if (!existing) return jsonError("Proposal not found", 404);

    const { sentAt, status, ...rest } = parsed.data;
    const proposal = await prisma.proposal.update({
      where: { id },
      data: {
        ...rest,
        status: status as ProposalStatus | undefined,
        ...(sentAt !== undefined && { sentAt: sentAt ? new Date(sentAt) : null }),
        ...(status === "SENT" && !sentAt && { sentAt: new Date() }),
      },
      include: { client: { select: { id: true, name: true, email: true } } },
    });

    if (parsed.data.status && parsed.data.status !== existing.status) {
      await logActivity(
        auth.user.id,
        "STATUS_CHANGE",
        `Proposal status changed to ${parsed.data.status}`,
        "Proposal",
        id
      );
    } else {
      await logActivity(auth.user.id, "UPDATE", "Updated proposal", "Proposal", id);
    }

    return NextResponse.json({ proposal });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("proposals:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const existing = await prisma.proposal.findUnique({ where: { id } });
    if (!existing) return jsonError("Proposal not found", 404);

    await prisma.proposal.delete({ where: { id } });
    await logActivity(auth.user.id, "DELETE", "Deleted proposal", "Proposal", id);

    return NextResponse.json({ message: "Proposal deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
