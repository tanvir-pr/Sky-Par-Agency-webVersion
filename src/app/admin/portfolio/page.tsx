"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Image, Pencil, Plus, Star, Trash2 } from "lucide-react";
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
import { formatDate } from "@/lib/utils";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc: string | null;
  thumbnail: string;
  category: string;
  liveUrl: string | null;
  technologies: string[];
  featured: boolean;
  published: boolean;
  createdAt: string;
}

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  shortDesc: "",
  thumbnail: "",
  category: "",
  liveUrl: "",
  technologies: "",
  featured: false,
  published: true,
};

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/portfolio");
      setItems(res.data.portfolio ?? []);
    } catch {
      toast.error("Failed to load portfolio items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: PortfolioItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      slug: item.slug,
      description: item.description,
      shortDesc: item.shortDesc || "",
      thumbnail: item.thumbnail,
      category: item.category,
      liveUrl: item.liveUrl || "",
      technologies: item.technologies.join(", "),
      featured: item.featured,
      published: item.published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        technologies: form.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editing) {
        await axios.put(`/api/portfolio/${editing.id}`, payload);
        toast.success("Portfolio item updated");
      } else {
        await axios.post("/api/portfolio", payload);
        toast.success("Portfolio item created");
      }

      setDialogOpen(false);
      fetchItems();
    } catch {
      toast.error("Failed to save portfolio item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this portfolio item?")) return;
    try {
      await axios.delete(`/api/portfolio/${id}`);
      toast.success("Portfolio item deleted");
      fetchItems();
    } catch {
      toast.error("Failed to delete portfolio item");
    }
  };

  const columns: Column<PortfolioItem>[] = [
    {
      key: "title",
      header: "Project",
      cell: (item) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.category}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => (
        <div className="flex gap-1">
          {item.featured && <Badge>Featured</Badge>}
          <Badge variant={item.published ? "default" : "secondary"}>
            {item.published ? "Published" : "Draft"}
          </Badge>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (item) => formatDate(item.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (item) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => handleDelete(item.id)}
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
        title="Portfolio"
        description="Manage your project showcase"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <CmsNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="emerald" title="Total Items" value={loading ? "—" : items.length} icon={Image} />
          <StatCard accent="amber" title="Featured" value={loading ? "—" : items.filter((i) => i.featured).length} icon={Star} />
          <StatCard accent="sky" title="Published" value={loading ? "—" : items.filter((i) => i.published).length} icon={Image} />
        </div>
        <div className="mb-6 flex justify-end">
          <Button onClick={openCreate} className="gap-2 bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          getRowKey={(item) => item.id}
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Project" : "Add Project"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
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
                <Label>Short Description</Label>
                <Input
                  value={form.shortDesc}
                  onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thumbnail URL *</Label>
                  <Input
                    value={form.thumbnail}
                    onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Live URL</Label>
                  <Input
                    value={form.liveUrl}
                    onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Technologies (comma-separated)</Label>
                <Input
                  value={form.technologies}
                  onChange={(e) => setForm({ ...form, technologies: e.target.value })}
                />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  />
                  Published
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
