import { getSession, getUserFromSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-utils";
import { hasPermission, PermissionKey } from "@/lib/rbac/permissions";
import type { JWTPayload } from "@/lib/auth";

export async function requireAdminSession(): Promise<
  { session: JWTPayload; user: NonNullable<Awaited<ReturnType<typeof getUserFromSession>>> } | { error: ReturnType<typeof jsonError> }
> {
  const session = await getSession();
  if (!session) {
    return { error: jsonError("Unauthorized", 401) };
  }
  const user = await getUserFromSession();
  if (!user || user.status === "SUSPENDED") {
    return { error: jsonError("Unauthorized", 401) };
  }
  return { session, user };
}

export async function requirePermission(permission: PermissionKey) {
  const result = await requireAdminSession();
  if ("error" in result) return result;
  if (!hasPermission(result.user.role, permission)) {
    return { error: jsonError("Forbidden", 403) };
  }
  return result;
}

export async function requireClientSession() {
  const session = await getSession();
  if (!session || session.role !== "CLIENT") {
    return { error: jsonError("Unauthorized", 401) };
  }
  const user = await getUserFromSession();
  if (!user || !user.clientId) {
    return { error: jsonError("Unauthorized", 401) };
  }
  return { session, user, clientId: user.clientId };
}
