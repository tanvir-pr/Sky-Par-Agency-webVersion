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

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
  avatar: z.string().nullable().optional(),
  clientId: z.string().nullable().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("users:read");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        clientId: true,
        client: { select: { id: true, name: true, email: true } },
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return jsonError("User not found", 404);
    return NextResponse.json({ user });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("users:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return jsonError("User not found", 404);

    if (parsed.data.email && parsed.data.email !== existing.email) {
      const dup = await prisma.user.findUnique({ where: { email: parsed.data.email } });
      if (dup) return jsonError("Email already in use", 409);
    }

    const { password, role, status, ...rest } = parsed.data;
    const data: {
      name?: string;
      email?: string;
      password?: string;
      role?: UserRole;
      status?: UserStatus;
      avatar?: string | null;
      clientId?: string | null;
    } = { ...rest };

    if (password) data.password = await hashPassword(password);
    if (role) data.role = role as UserRole;
    if (status) data.status = status as UserStatus;

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

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const auth = await requirePermission("users:write");
    if ("error" in auth) return auth.error;

    const { id } = await params;

    if (id === auth.user.id) {
      return jsonError("Cannot delete your own account", 400);
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return jsonError("User not found", 404);

    await prisma.user.delete({ where: { id } });
    await logActivity(auth.user.id, "DELETE", "Deleted user", "User", id);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
