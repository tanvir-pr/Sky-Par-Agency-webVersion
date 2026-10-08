import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const updateClientSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("clients:read");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true, status: true } },
        clientNotes: { orderBy: { createdAt: "desc" }, take: 50 },
        clientFiles: { orderBy: { createdAt: "desc" }, take: 50 },
        subscriptions: {
          include: { package: { select: { name: true, price: true } } },
          orderBy: { createdAt: "desc" },
        },
        projects: {
          select: { id: true, title: true, status: true, progress: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            total: true,
            dueDate: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            price: true,
            createdAt: true,
            package: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        deals: {
          select: {
            id: true,
            title: true,
            stage: true,
            value: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
          take: 50,
        },
        _count: {
          select: {
            orders: true,
            projects: true,
            invoices: true,
            deals: true,
            subscriptions: true,
            clientNotes: true,
            clientFiles: true,
          },
        },
      },
    });

    if (!client) return jsonError("Client not found", 404);
    return NextResponse.json({ client });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("clients:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateClientSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return jsonError("Client not found", 404);

    if (parsed.data.email && parsed.data.email !== existing.email) {
      const dup = await prisma.client.findUnique({ where: { email: parsed.data.email } });
      if (dup) return jsonError("Email already in use", 409);
    }

    const client = await prisma.client.update({ where: { id }, data: parsed.data });
    await logActivity(auth.user.id, "UPDATE", "Updated client", "Client", id);

    return NextResponse.json({ client });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("clients:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) return jsonError("Client not found", 404);

    await prisma.client.delete({ where: { id } });
    await logActivity(auth.user.id, "DELETE", "Deleted client", "Client", id);

    return NextResponse.json({ message: "Client deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
