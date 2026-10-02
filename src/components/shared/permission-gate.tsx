"use client";

import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { hasPermission, PermissionKey } from "@/lib/rbac/permissions";

interface PermissionGateProps {
  permission?: PermissionKey;
  roles?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ permission, roles, children, fallback = null }: PermissionGateProps) {
  const { user } = useAdminAuth();
  if (!user) return fallback;

  if (roles && !roles.includes(user.role)) return fallback;
  if (permission && !hasPermission(user.role, permission)) return fallback;

  return <>{children}</>;
}

export function usePermission(permission: PermissionKey): boolean {
  const { user } = useAdminAuth();
  if (!user) return false;
  return hasPermission(user.role, permission);
}
