import { UserRole } from "@prisma/client";
import { ROLE_PERMISSIONS, PermissionKey, isStaffRole } from "./role-permissions";

export function hasPermission(role: string, permission: PermissionKey): boolean {
  if (role === "SUPER_ADMIN") return true;
  const perms = ROLE_PERMISSIONS[role] ?? [];
  return perms.includes(permission);
}

export function hasAnyPermission(role: string, permissions: PermissionKey[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function canAccessAdmin(role: string): boolean {
  return isStaffRole(role);
}

export function canAccessPortal(role: string): boolean {
  return role === "CLIENT";
}

export function getRolePermissions(role: UserRole | string): PermissionKey[] {
  if (role === "SUPER_ADMIN") {
    return Object.values(ROLE_PERMISSIONS).flat();
  }
  return ROLE_PERMISSIONS[role] ?? [];
}
