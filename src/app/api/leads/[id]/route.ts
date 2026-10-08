import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";

const updateLeadSchema = z.object({
  status: z
    .enum([
      "NEW",
      "CONTACTED",
      "MEETING_SCHEDULED",
      "PROPOSAL_SENT",
      "NEGOTIATION",
      "WON",
      "LOST",
    ])
    .optional(),
  leadScore: z.number().int().min(0).max(100).optional(),
  source: z.string().nullable().optional(),
  followUpAt: z.string().datetime().nullable().optional(),
  assignedToId: z.string().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await params;

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!lead) {
      return jsonError("Lead not found", 404);
    }

    return NextResponse.json({ lead });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = updateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Lead not found", 404);
    }

    if (parsed.data.assignedToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: parsed.data.assignedToId },
      });
      if (!assignee) {
        return jsonError("Assigned user not found", 400);
      }
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.followUpAt !== undefined) {
      data.followUpAt = parsed.data.followUpAt
        ? new Date(parsed.data.followUpAt)
        : null;
    }

    const lead = await prisma.lead.update({
      where: { id },
      data,
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({ lead });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await params;

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Lead not found", 404);
    }

    await prisma.lead.delete({ where: { id } });

    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
