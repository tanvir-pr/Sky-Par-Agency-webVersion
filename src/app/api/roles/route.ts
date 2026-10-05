import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-utils";
import { PERMISSIONS, ROLE_PERMISSIONS, STAFF_ROLES } from "@/lib/rbac/role-permissions";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    return NextResponse.json({
      permissions: PERMISSIONS,
      rolePermissions: ROLE_PERMISSIONS,
      roles: STAFF_ROLES,
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
