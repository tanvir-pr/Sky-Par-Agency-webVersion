"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Briefcase, Eye, Pencil, Plus, Trash2, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { CmsNav } from "@/components/admin/cms/cms-nav";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface Career {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  salary: string | null;
  description: string;
  requirements: string[];
  published: boolean;
  createdAt: string;
  _count?: { applications: number };
}

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  resume: string | null;
  cover: string | null;
  createdAt: string;
}

const emptyForm = {
  title: "",
  department: "",
  location: "",
  type: "Full-time",
  salary: "",
  description: "",
  requirements: "",
  published: true,
};

export default function AdminCareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [applicationsOpen, setApplicationsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Career | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

  const fetchCareers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/careers");
      setCareers(res.data.careers ?? []);
    } catch {
      toast.error("Failed to load careers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCareers();
  }, [fetchCareers]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (career: Career) => {
    setEditing(career);
    setForm({
      title: career.title,
      department: career.department,
      location: career.location,
      type: career.type,
      salary: career.salary || "",
      description: career.description,
      requirements: career.requirements.join("\n"),
      published: career.published,
    });
    setDialogOpen(true);
  };

  const viewApplications = async (career: Career) => {
    setSelectedCareer(career);
    setApplicationsOpen(true);
    setApplicationsLoading(true);
    try {
      const res = await axios.get(`/api/applications?careerId=${career.id}`);
      setApplications(res.data.applications);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        requirements: form.requirements
          .split("\n")
          .map((r) => r.trim())
          .filter(Boolean),
      };

      if (editing) {
        await axios.put(`/api/careers/${editing.id}`, payload);
        toast.success("Career listing updated");
      } else {
        await axios.post("/api/careers", payload);
        toast.success("Career listing created");
      }

      setDialogOpen(false);
      fetchCareers();
    } catch {
      toast.error("Failed to save career listing");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this career listing and all applications?")) return;
    try {
      await axios.delete(`/api/careers/${id}`);
      toast.success("Career listing deleted");
      fetchCareers();
    } catch {
      toast.error("Failed to delete career listing");
    }
  };

  const columns: Column<Career>[] = [
    {
      key: "title",
      header: "Position",
      cell: (career) => (
        <div>
          <p className="font-medium">{career.title}</p>
          <p className="text-xs text-muted-foreground">
            {career.department} · {career.location}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (career) => career.type,
    },
    {
      key: "applications",
      header: "Applications",
      cell: (career) => (
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => viewApplications(career)}
        >
          <Eye className="h-3 w-3" />
          {career._count?.applications ?? 0}
        </Button>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (career) => (
        <Badge variant={career.published ? "default" : "secondary"}>
          {career.published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (career) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(career)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => handleDelete(career.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const applicationColumns: Column<Application>[] = [
    {
      key: "name",
      header: "Applicant",
      cell: (app) => (
        <div>
          <p className="font-medium">{app.name}</p>
          <p className="text-xs text-muted-foreground">{app.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      cell: (app) => app.phone || "—",
    },
    {
      key: "resume",
      header: "Resume",
      cell: (app) =>
        app.resume ? (
          <a
            href={app.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            View
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "createdAt",
      header: "Applied",
      cell: (app) => formatDate(app.createdAt),
    },
  ];

  return (
    <>
      <AdminHeader title="Careers" description="Manage job listings and applications" />
      <div className="flex-1 overflow-y-auto p-6">
        <CmsNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="sky" title="Open Positions" value={loading ? "—" : careers.length} icon={Briefcase} />
          <StatCard accent="emerald" title="Published" value={loading ? "—" : careers.filter((c) => c.published).length} icon={Briefcase} />
          <StatCard accent="amber" title="Applications" value={loading ? "—" : careers.reduce((sum, c) => sum + (c._count?.applications ?? 0), 0)} icon={Users} />
        </div>
        <div className="mb-6 flex justify-end">
          <Button onClick={openCreate} className="gap-2 bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4" />
            Add Position
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={careers}
          loading={loading}
          getRowKey={(career) => career.id}
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Position" : "Add Position"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Input
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salary</Label>
                  <Input
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Requirements (one per line)</Label>
                <Textarea
                  rows={4}
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                Published
              </label>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={applicationsOpen} onOpenChange={setApplicationsOpen}>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Applications — {selectedCareer?.title}
              </DialogTitle>
            </DialogHeader>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {applications.length} application{applications.length !== 1 ? "s" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable
                  columns={applicationColumns}
                  data={applications}
                  loading={applicationsLoading}
                  getRowKey={(app) => app.id}
                  emptyMessage="No applications yet"
                />
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
