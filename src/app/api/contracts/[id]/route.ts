import { NextResponse } from "next/server";
import { z } from "zod";
import { ContractStatus } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const contractStatusSchema = z.enum(["DRAFT", "SENT", "SIGNED", "EXPIRED", "RENEWED"]);

const updateContractSchema = z.object({
  title: z.string().min(2).optional(),
  fileUrl: z.string().nullable().optional(),
  status: contractStatusSchema.optional(),
  renewalDate: z.string().datetime().nullable().optional(),
  signedAt: z.string().datetime().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("contracts:read");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!contract) return jsonError("Contract not found", 404);
    return NextResponse.json({ contract });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("contracts:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateContractSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const existing = await prisma.contract.findUnique({ where: { id } });
    if (!existing) return jsonError("Contract not found", 404);

    const { renewalDate, signedAt, status, ...rest } = parsed.data;
    const contract = await prisma.contract.update({
      where: { id },
      data: {
        ...rest,
        status: status as ContractStatus | undefined,
        ...(renewalDate !== undefined && { renewalDate: renewalDate ? new Date(renewalDate) : null }),
        ...(signedAt !== undefined && { signedAt: signedAt ? new Date(signedAt) : null }),
        ...(status === "SIGNED" && !signedAt && { signedAt: new Date() }),
      },
      include: { client: { select: { id: true, name: true, email: true } } },
    });

    if (parsed.data.status && parsed.data.status !== existing.status) {
      await logActivity(
        auth.user.id,
        "STATUS_CHANGE",
        `Contract status changed to ${parsed.data.status}`,
        "Contract",
        id
      );
    } else {
      await logActivity(auth.user.id, "UPDATE", "Updated contract", "Contract", id);
    }

    return NextResponse.json({ contract });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("contracts:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const existing = await prisma.contract.findUnique({ where: { id } });
    if (!existing) return jsonError("Contract not found", 404);

    await prisma.contract.delete({ where: { id } });
    await logActivity(auth.user.id, "DELETE", "Deleted contract", "Contract", id);

    return NextResponse.json({ message: "Contract deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
