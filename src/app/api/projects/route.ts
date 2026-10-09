import { NextResponse } from "next/server";
import { z } from "zod";
import { ProjectStatus } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const projectStatusSchema = z.enum([
  "PLANNING",
  "IN_PROGRESS",
  "ON_HOLD",
  "CLIENT_REVIEW",
  "COMPLETED",
  "CANCELLED",
]);

const createProjectSchema = z.object({
  title: z.string().min(2),
  clientId: z.string(),
  packageId: z.string().optional(),
  status: projectStatusSchema.optional(),
  progress: z.number().int().min(0).max(100).optional(),
  deadline: z.string().datetime().optional(),
  stagingUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  description: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("projects:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const status = projectStatusSchema.safeParse(statusParam).success
      ? (statusParam as ProjectStatus)
      : undefined;
    const clientId = searchParams.get("clientId") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(clientId && { clientId }),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true } },
          package: { include: { category: true } },
          _count: { select: { tasks: true, members: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      projects,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("projects:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const client = await prisma.client.findUnique({ where: { id: parsed.data.clientId } });
    if (!client) return jsonError("Client not found", 404);

    const { memberIds, deadline, status, ...rest } = parsed.data;

    const project = await prisma.project.create({
      data: {
        ...rest,
        status: (status as ProjectStatus) ?? "PLANNING",
        deadline: deadline ? new Date(deadline) : undefined,
        members: memberIds?.length
          ? { create: memberIds.map((userId) => ({ userId })) }
          : undefined,
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        package: { include: { category: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    await logActivity(auth.user.id, "CREATE", "Created project", "Project", project.id);

    return NextResponse.json({ project }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
