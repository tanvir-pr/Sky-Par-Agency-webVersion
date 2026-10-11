"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Ban, Plus, Shield, UserCheck } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "ADMIN" as string,
};

function formatRole(role: string) {
  return role.toLowerCase().replace(/_/g, " ");
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/users", { params: { type: "admins" } });
      setAdmins(res.data.users ?? []);
    } catch {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error("All fields are required");
      return;
    }
    setSaving(true);
    try {
      await axios.post("/api/users", form);
      toast.success("Admin user created");
      setDialogOpen(false);
      setForm(emptyForm);
      fetchAdmins();
    } catch {
      toast.error("Failed to create admin");
    } finally {
      setSaving(false);
    }
  };

  const toggleSuspend = async (admin: AdminUser) => {
    const newStatus = admin.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const action = newStatus === "SUSPENDED" ? "suspend" : "reactivate";
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${admin.name}?`)) {
      return;
    }
    setActionId(admin.id);
    try {
      await axios.patch(`/api/users/${admin.id}`, { status: newStatus });
      setAdmins((prev) =>
        prev.map((a) => (a.id === admin.id ? { ...a, status: newStatus } : a))
      );
      toast.success(`Admin ${action}ed`);
    } catch {
      toast.error(`Failed to ${action} admin`);
    } finally {
      setActionId(null);
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Admin",
      cell: (admin) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-indigo-600" />
          <div>
            <p className="font-medium">{admin.name}</p>
            <p className="text-xs text-muted-foreground">{admin.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (admin) => (
        <Badge
          variant="outline"
          className={
            admin.role === "SUPER_ADMIN"
              ? "border-purple-300 bg-purple-50 text-purple-700"
              : ""
          }
        >
          {formatRole(admin.role)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (admin) => (
        <Badge
          variant={admin.status === "ACTIVE" ? "default" : "destructive"}
          className={admin.status === "ACTIVE" ? "bg-emerald-600" : ""}
        >
          {admin.status}
        </Badge>
      ),
    },
    {
      key: "lastLoginAt",
      header: "Last Login",
      cell: (admin) =>
        admin.lastLoginAt ? formatDate(admin.lastLoginAt) : "Never",
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (admin) => formatDate(admin.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (admin) => (
        <Button
          variant={admin.status === "ACTIVE" ? "destructive" : "outline"}
          size="sm"
          className="gap-1.5"
          disabled={actionId === admin.id}
          onClick={() => toggleSuspend(admin)}
        >
          {admin.status === "ACTIVE" ? (
            <>
              <Ban className="h-3.5 w-3.5" />
              Suspend
            </>
          ) : (
            <>
              <UserCheck className="h-3.5 w-3.5" />
              Reactivate
            </>
          )}
        </Button>
      ),
    },
  ];

  return (
    <>
      <AdminHeader
        title="Admin Users"
        description="Create and manage administrator accounts"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex justify-end">
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Admin
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={admins}
          loading={loading}
          getRowKey={(admin) => admin.id}
          emptyMessage="No admin users found"
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Create Admin User
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(value) => setForm({ ...form, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_ROLES.map((role) => (
                      <SelectItem key={role} value={role} className="capitalize">
                        {formatRole(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? "Creating..." : "Create Admin"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
