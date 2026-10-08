import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity, notifyAdmins } from "@/lib/notifications/create";
import { runAutomation } from "@/lib/automation/triggers";
import { emitClientCreated } from "@/lib/n8n";

const createClientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
  portalUser: z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
    })
    .optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("clients:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;
    const search = searchParams.get("search")?.trim();

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { company: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          _count: {
            select: {
              orders: true,
              projects: true,
              invoices: true,
              deals: true,
              subscriptions: true,
              users: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json({
      clients,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("clients:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createClientSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { portalUser, ...clientData } = parsed.data;

    const existing = await prisma.client.findUnique({ where: { email: clientData.email } });
    if (existing) return jsonError("Client with this email already exists", 409);

    if (portalUser) {
      const existingUser = await prisma.user.findUnique({ where: { email: portalUser.email } });
      if (existingUser) return jsonError("Portal user email already in use", 409);
    }

    const client = await prisma.$transaction(async (tx) => {
      const created = await tx.client.create({ data: clientData });

      if (portalUser) {
        const hashed = await hashPassword(portalUser.password);
        await tx.user.create({
          data: {
            name: portalUser.name,
            email: portalUser.email,
            password: hashed,
            role: "CLIENT",
            clientId: created.id,
          },
        });
      }

      return created;
    });

    await logActivity(auth.user.id, "CREATE", "Created client", "Client", client.id);
    await notifyAdmins("SYSTEM", "New client", `${client.name} was added to the CRM`, {
      clientId: client.id,
    });
    await runAutomation("CLIENT_CREATED", {
      clientId: client.id,
      clientEmail: client.email,
      clientName: client.name,
    });
    await emitClientCreated(client, Boolean(portalUser));

    return NextResponse.json({ client }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
