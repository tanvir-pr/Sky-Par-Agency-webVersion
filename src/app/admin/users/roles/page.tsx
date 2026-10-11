"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Check, Shield, X } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { TeamNav } from "@/components/admin/team/team-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STAFF_ROLES } from "@/lib/rbac/role-permissions";

interface Permission {
  resource: string;
  action: string;
  description: string | null;
}

export default function RolesPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [selectedRole, setSelectedRole] = useState<string>("ADMIN");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/roles")
      .then((res) => {
        setPermissions(res.data.permissions ?? []);
        setRolePermissions(res.data.rolePermissions ?? {});
      })
      .catch(() => toast.error("Failed to load role permissions"))
      .finally(() => setLoading(false));
  }, []);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    for (const perm of permissions) {
      if (!groups[perm.resource]) groups[perm.resource] = [];
      groups[perm.resource].push(perm);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const rolePerms = new Set(rolePermissions[selectedRole] ?? []);

  function formatRole(role: string) {
    return role.toLowerCase().replace(/_/g, " ");
  }

  return (
    <>
      <AdminHeader
        title="Roles & Permissions"
        description="View the permission matrix for each role"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <TeamNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="sky" title="Staff Roles" value={loading ? "—" : STAFF_ROLES.length} icon={Shield} />
          <StatCard accent="emerald" title="Permissions" value={loading ? "—" : permissions.length} icon={Shield} />
          <StatCard accent="amber" title="Active Role Grants" value={loading ? "—" : (rolePermissions[selectedRole]?.length ?? 0)} icon={Shield} />
        </div>
        <Card className="mb-6">
          <CardContent className="flex flex-wrap items-center gap-4 p-4">
            <Shield className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium">Select role:</span>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-56 capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAFF_ROLES.map((role) => (
                  <SelectItem key={role} value={role} className="capitalize">
                    {formatRole(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="secondary" className="ml-auto">
              {rolePerms.size} permissions
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="capitalize">
              {formatRole(selectedRole)} — Permission Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                Loading permissions...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resource</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24 text-center">Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedPermissions.map(([resource, perms]) =>
                    perms.map((perm, idx) => {
                      const key = `${perm.resource}:${perm.action}`;
                      const hasAccess = rolePerms.has(key);
                      return (
                        <TableRow key={key}>
                          {idx === 0 ? (
                            <TableCell
                              rowSpan={perms.length}
                              className="align-top font-medium capitalize"
                            >
                              {resource}
                            </TableCell>
                          ) : null}
                          <TableCell className="capitalize">{perm.action}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {perm.description || "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            {hasAccess ? (
                              <Check className="mx-auto h-4 w-4 text-emerald-600" />
                            ) : (
                              <X className="mx-auto h-4 w-4 text-muted-foreground/40" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
