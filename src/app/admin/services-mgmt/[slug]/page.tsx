"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, Package, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { ServicesNav } from "@/components/admin/services/services-nav";
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

interface ServicePackage {
  id: string;
  name: string;
  slug: string;
  price: string;
  deliveryTime: string;
  description: string | null;
  features: string[];
  popular: boolean;
  order: number;
}

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  packages: ServicePackage[];
}

const emptyForm = {
  name: "",
  price: "",
  deliveryTime: "",
  description: "",
  features: "",
  popular: false,
  order: 0,
};

export default function AdminServiceCategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ServicePackage | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchCategory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/service-categories/${slug}`);
      setCategory(res.data.category ?? null);
    } catch {
      toast.error("Failed to load category");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (pkg: ServicePackage) => {
    setEditing(pkg);
    setForm({
      name: pkg.name,
      price: pkg.price,
      deliveryTime: pkg.deliveryTime,
      description: pkg.description || "",
      features: pkg.features.join(", "),
      popular: pkg.popular,
      order: pkg.order,
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
        await axios.put(`/api/service-categories/${slug}/packages/${editing.id}`, payload);
        toast.success("Package updated");
      } else {
        await axios.post(`/api/service-categories/${slug}/packages`, payload);
        toast.success("Package created");
      }

      setDialogOpen(false);
      fetchCategory();
    } catch {
      toast.error("Failed to save package");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this package?")) return;
    try {
      await axios.delete(`/api/service-categories/${slug}/packages/${id}`);
      toast.success("Package deleted");
      fetchCategory();
    } catch {
      toast.error("Failed to delete package");
    }
  };

  const columns: Column<ServicePackage>[] = [
    {
      key: "name",
      header: "Package",
      cell: (pkg) => (
        <div>
          <p className="font-medium">{pkg.name}</p>
          {pkg.description && (
            <p className="text-xs text-muted-foreground">{pkg.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (pkg) => pkg.price,
    },
    {
      key: "deliveryTime",
      header: "Delivery",
      cell: (pkg) => pkg.deliveryTime,
    },
    {
      key: "popular",
      header: "Popular",
      cell: (pkg) =>
        pkg.popular ? <Badge>Popular</Badge> : <span className="text-muted-foreground">—</span>,
    },
    {
      key: "order",
      header: "Order",
      cell: (pkg) => pkg.order,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (pkg) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(pkg)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => handleDelete(pkg.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminHeader
        title={category?.name ?? "Service Category"}
        description={category?.description ?? "Manage pricing packages"}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <ServicesNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="rose" title="Packages" value={loading ? "—" : (category?.packages?.length ?? 0)} icon={Package} />
          <StatCard accent="amber" title="Popular" value={loading ? "—" : (category?.packages?.filter((p) => p.popular).length ?? 0)} icon={Star} />
          <StatCard accent="emerald" title="Category" value={loading ? "—" : category?.name ?? "—"} icon={Package} />
        </div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/services-mgmt">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Categories
            </Link>
          </Button>
          <Button onClick={openCreate} className="gap-2 bg-rose-600 hover:bg-rose-700">
            <Plus className="h-4 w-4" />
            Add Package
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={category?.packages ?? []}
          loading={loading}
          getRowKey={(pkg) => pkg.id}
          emptyMessage="No packages yet"
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Package" : "Add Package"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="$999"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Time *</Label>
                  <Input
                    value={form.deliveryTime}
                    onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })}
                    placeholder="2 weeks"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Features (comma-separated)</Label>
                <Input
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <label className="flex items-end gap-2 pb-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.popular}
                    onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                  />
                  Mark as popular
                </label>
              </div>
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
