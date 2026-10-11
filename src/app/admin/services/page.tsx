"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Layers, Pencil, Plus, Trash2 } from "lucide-react";
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
import { truncate } from "@/lib/utils";

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  icon: string | null;
  features: string[];
  order: number;
  published: boolean;
}

const emptyForm = {
  title: "",
  description: "",
  shortDesc: "",
  icon: "",
  features: "",
  order: 0,
  published: true,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/services");
      setServices(res.data.services ?? []);
    } catch {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditing(service);
    setForm({
      title: service.title,
      description: service.description,
      shortDesc: service.shortDesc || "",
      icon: service.icon || "",
      features: service.features.join(", "),
      order: service.order,
      published: service.published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        features: form.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
      };

      if (editing) {
        await axios.put(`/api/services/${editing.id}`, payload);
        toast.success("Service updated");
      } else {
        await axios.post("/api/services", payload);
        toast.success("Service created");
      }

      setDialogOpen(false);
      fetchServices();
    } catch {
      toast.error("Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      await axios.delete(`/api/services/${id}`);
      toast.success("Service deleted");
      fetchServices();
    } catch {
      toast.error("Failed to delete service");
    }
  };

  const columns: Column<Service>[] = [
    {
      key: "title",
      header: "Service",
      cell: (service) => (
        <div>
          <p className="font-medium">{service.title}</p>
          <p className="text-xs text-muted-foreground">
            {truncate(service.shortDesc || service.description, 50)}
          </p>
        </div>
      ),
    },
    {
      key: "order",
      header: "Order",
      cell: (service) => service.order,
    },
    {
      key: "status",
      header: "Status",
      cell: (service) => (
        <Badge variant={service.published ? "default" : "secondary"}>
          {service.published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (service) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(service)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => handleDelete(service.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminHeader title="Services" description="Manage agency services" />
      <div className="flex-1 overflow-y-auto p-6">
        <CmsNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="violet" title="Services" value={loading ? "—" : services.length} icon={Layers} />
          <StatCard accent="emerald" title="Published" value={loading ? "—" : services.filter((s) => s.published).length} icon={Layers} />
          <StatCard accent="amber" title="Drafts" value={loading ? "—" : services.filter((s) => !s.published).length} icon={Layers} />
        </div>
        <div className="mb-6 flex justify-end">
          <Button onClick={openCreate} className="gap-2 bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={services}
          loading={loading}
          getRowKey={(service) => service.id}
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
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
                <Label>Short Description</Label>
                <Input
                  value={form.shortDesc}
                  onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon (Lucide name)</Label>
                  <Input
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Features (comma-separated)</Label>
                <Input
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
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
      </div>
    </>
  );
}
