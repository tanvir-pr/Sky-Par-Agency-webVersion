"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Pencil, Plus, Search, UserCircle, UserPlus, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { TeamNav } from "@/components/admin/team/team-nav";
import { StatCard } from "@/components/admin/stat-card";
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
import { STAFF_ROLES } from "@/lib/rbac/role-permissions";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

const EMPLOYEE_ROLES = STAFF_ROLES.filter(
  (r) => r !== "SUPER_ADMIN" && r !== "ADMIN"
);

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "EDITOR" as string,
};

function formatRole(role: string) {
  return role.toLowerCase().replace(/_/g, " ");
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/users", { params: { type: "employees" } });
      setEmployees(res.data.users ?? []);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setEditing(employee);
    setForm({
      name: employee.name,
      email: employee.email,
      password: "",
      role: employee.role,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (!editing && !form.password) {
      toast.error("Password is required for new employees");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const payload: Record<string, string> = {
          name: form.name,
          email: form.email,
          role: form.role,
        };
        if (form.password) payload.password = form.password;
        await axios.patch(`/api/users/${editing.id}`, payload);
        toast.success("Employee updated");
      } else {
        await axios.post("/api/users", form);
        toast.success("Employee created");
      }
      setDialogOpen(false);
      fetchEmployees();
    } catch {
      toast.error(editing ? "Failed to update employee" : "Failed to create employee");
    } finally {
      setSaving(false);
    }
  };

  const filtered = search.trim()
    ? employees.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          e.email.toLowerCase().includes(search.toLowerCase())
      )
    : employees;

  const activeCount = employees.filter((e) => e.status === "ACTIVE").length;

  const columns: Column<Employee>[] = [
    {
      key: "name",
      header: "Employee",
      cell: (emp) => (
        <div>
          <p className="font-medium">{emp.name}</p>
          <p className="text-xs text-muted-foreground">{emp.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (emp) => (
        <Badge variant="outline" className="capitalize">
          {formatRole(emp.role)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (emp) => (
        <Badge
          variant={emp.status === "ACTIVE" ? "default" : "destructive"}
          className={emp.status === "ACTIVE" ? "bg-emerald-600" : ""}
        >
          {emp.status}
        </Badge>
      ),
    },
    {
      key: "lastLoginAt",
      header: "Last Login",
      cell: (emp) => (emp.lastLoginAt ? formatDate(emp.lastLoginAt) : "Never"),
    },
    {
      key: "actions",
      header: "",
      cell: (emp) => (
        <Button variant="ghost" size="sm" onClick={() => openEdit(emp)}>
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <AdminHeader
        title="Employees"
        description="Manage team members and their roles"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <TeamNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="sky" title="Total Employees" value={loading ? "—" : employees.length} icon={Users} />
          <StatCard accent="emerald" title="Active" value={loading ? "—" : activeCount} icon={UserCircle} />
          <StatCard accent="indigo" title="Inactive" value={loading ? "—" : employees.length - activeCount} icon={UserPlus} />
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="relative min-w-[220px] flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={openCreate} className="gap-2 bg-sky-600 hover:bg-sky-700">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          getRowKey={(emp) => emp.id}
          emptyMessage="No employees found"
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                {editing ? "Edit Employee" : "Add Employee"}
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
                <Label>{editing ? "New Password (optional)" : "Password *"}</Label>
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
                    {EMPLOYEE_ROLES.map((role) => (
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
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
