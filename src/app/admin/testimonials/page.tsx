"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { MessageSquareQuote, Pencil, Plus, Star, Trash2 } from "lucide-react";
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

interface Testimonial {
  id: string;
  clientName: string;
  company: string | null;
  role: string | null;
  image: string | null;
  rating: number;
  review: string;
  featured: boolean;
  published: boolean;
}

const emptyForm = {
  clientName: "",
  company: "",
  role: "",
  image: "",
  rating: 5,
  review: "",
  featured: false,
  published: true,
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/testimonials");
      setTestimonials(res.data.testimonials ?? []);
    } catch {
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditing(item);
    setForm({
      clientName: item.clientName,
      company: item.company || "",
      role: item.role || "",
      image: item.image || "",
      rating: item.rating,
      review: item.review,
      featured: item.featured,
      published: item.published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`/api/testimonials/${editing.id}`, form);
        toast.success("Testimonial updated");
      } else {
        await axios.post("/api/testimonials", form);
        toast.success("Testimonial created");
      }

      setDialogOpen(false);
      fetchTestimonials();
    } catch {
      toast.error("Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await axios.delete(`/api/testimonials/${id}`);
      toast.success("Testimonial deleted");
      fetchTestimonials();
    } catch {
      toast.error("Failed to delete testimonial");
    }
  };

  const columns: Column<Testimonial>[] = [
    {
      key: "client",
      header: "Client",
      cell: (item) => (
        <div>
          <p className="font-medium">{item.clientName}</p>
          <p className="text-xs text-muted-foreground">
            {[item.role, item.company].filter(Boolean).join(" at ")}
          </p>
        </div>
      ),
    },
    {
      key: "review",
      header: "Review",
      cell: (item) => truncate(item.review, 80),
    },
    {
      key: "rating",
      header: "Rating",
      cell: (item) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          {item.rating}
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
            {item.published ? "Published" : "Hidden"}
          </Badge>
        </div>
      ),
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
      <AdminHeader title="Testimonials" description="Manage client testimonials" />
      <div className="flex-1 overflow-y-auto p-6">
        <CmsNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="amber" title="Testimonials" value={loading ? "—" : testimonials.length} icon={MessageSquareQuote} />
          <StatCard accent="emerald" title="Featured" value={loading ? "—" : testimonials.filter((i) => i.featured).length} icon={Star} />
          <StatCard accent="sky" title="Published" value={loading ? "—" : testimonials.filter((i) => i.published).length} icon={MessageSquareQuote} />
        </div>
        <div className="mb-6 flex justify-end">
          <Button onClick={openCreate} className="gap-2 bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4" />
            Add Testimonial
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={testimonials}
          loading={loading}
          getRowKey={(item) => item.id}
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Testimonial" : "Add Testimonial"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rating (1-5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(e) =>
                      setForm({ ...form, rating: parseInt(e.target.value) || 5 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Review *</Label>
                <Textarea
                  rows={4}
                  value={form.review}
                  onChange={(e) => setForm({ ...form, review: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
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
