import { NextResponse } from "next/server";
import { z } from "zod";
import { UserRole, UserStatus } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const userRoleSchema = z.enum([
  "SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "SALES_MANAGER",
  "SEO_SPECIALIST", "SMM_MANAGER", "CONTENT_WRITER", "VIDEO_EDITOR",
  "PHOTO_EDITOR", "AUTOMATION_SPECIALIST", "AI_ENGINEER", "FINANCE",
  "CLIENT", "EDITOR",
]);

const userStatusSchema = z.enum(["ACTIVE", "SUSPENDED"]);

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  avatar: z.string().optional(),
  clientId: z.string().optional(),
});

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  avatar: z.string().nullable().optional(),
  clientId: z.string().nullable().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("users:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get("role");
    const role = userRoleSchema.safeParse(roleParam).success
      ? (roleParam as UserRole)
      : undefined;

    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        clientId: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ users });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("users:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) return jsonError("Email already in use", 409);

    const hashed = await hashPassword(parsed.data.password);
    const { password: _, ...userData } = parsed.data;

    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashed,
        role: (userData.role as UserRole) ?? "EDITOR",
        status: (userData.status as UserStatus) ?? "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        clientId: true,
        createdAt: true,
      },
    });

    await logActivity(auth.user.id, "CREATE", "Created user", "User", user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requirePermission("users:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { id, password, ...rest } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return jsonError("User not found", 404);

    if (rest.email && rest.email !== existing.email) {
      const dup = await prisma.user.findUnique({ where: { email: rest.email } });
      if (dup) return jsonError("Email already in use", 409);
    }

    const data: Record<string, unknown> = { ...rest };
    if (password) {
      data.password = await hashPassword(password);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        clientId: true,
        updatedAt: true,
      },
    });

    await logActivity(auth.user.id, "UPDATE", "Updated user", "User", id);

    return NextResponse.json({ user });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
