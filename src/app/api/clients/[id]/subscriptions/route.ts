import { NextResponse } from "next/server";
import { z } from "zod";
import { SubscriptionStatus } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";

const subscriptionStatusSchema = z.enum([
  "PENDING",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
]);

const createSubscriptionSchema = z.object({
  packageId: z.string(),
  status: subscriptionStatusSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  monthlyFee: z.number().optional(),
  notes: z.string().optional(),
  assignedToId: z.string().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("clients:read");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) return jsonError("Client not found", 404);

    const subscriptions = await prisma.clientSubscription.findMany({
      where: { clientId: id },
      include: {
        package: { include: { category: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ subscriptions });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("clients:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createSubscriptionSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) return jsonError("Client not found", 404);

    const pkg = await prisma.servicePackage.findUnique({ where: { id: parsed.data.packageId } });
    if (!pkg) return jsonError("Package not found", 404);

    const { startDate, endDate, status, ...rest } = parsed.data;

    const subscription = await prisma.clientSubscription.create({
      data: {
        clientId: id,
        status: (status as SubscriptionStatus) ?? "PENDING",
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        ...rest,
      },
      include: {
        package: { include: { category: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ subscription }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
