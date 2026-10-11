"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
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
import { formatDate, truncate } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  thumbnail: string | null;
  category: string | null;
  tags: string[];
  published: boolean;
  createdAt: string;
  author: { name: string };
}

const emptyForm = {
  title: "",
  content: "",
  excerpt: "",
  thumbnail: "",
  category: "",
  tags: "",
  published: true,
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/blog");
      setPosts(res.data.posts ?? []);
    } catch {
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      thumbnail: post.thumbnail || "",
      category: post.category || "",
      tags: post.tags.join(", "),
      published: post.published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editing) {
        await axios.put(`/api/blog/${editing.id}`, payload);
        toast.success("Blog post updated");
      } else {
        await axios.post("/api/blog", payload);
        toast.success("Blog post created");
      }

      setDialogOpen(false);
      fetchPosts();
    } catch {
      toast.error("Failed to save blog post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await axios.delete(`/api/blog/${id}`);
      toast.success("Blog post deleted");
      fetchPosts();
    } catch {
      toast.error("Failed to delete blog post");
    }
  };

  const columns: Column<BlogPost>[] = [
    {
      key: "title",
      header: "Post",
      cell: (post) => (
        <div>
          <p className="font-medium">{post.title}</p>
          <p className="text-xs text-muted-foreground">
            {truncate(post.excerpt || post.content, 60)}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (post) => post.category || "—",
    },
    {
      key: "author",
      header: "Author",
      cell: (post) => post.author.name,
    },
    {
      key: "status",
      header: "Status",
      cell: (post) => (
        <Badge variant={post.published ? "default" : "secondary"}>
          {post.published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (post) => formatDate(post.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (post) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(post)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => handleDelete(post.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminHeader title="Blog" description="Manage blog posts and articles" />
      <div className="flex-1 overflow-y-auto p-6">
        <CmsNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="sky" title="Total Posts" value={loading ? "—" : posts.length} icon={FileText} />
          <StatCard accent="emerald" title="Published" value={loading ? "—" : posts.filter((p) => p.published).length} icon={FileText} />
          <StatCard accent="amber" title="Drafts" value={loading ? "—" : posts.filter((p) => !p.published).length} icon={FileText} />
        </div>
        <div className="mb-6 flex justify-end">
          <Button onClick={openCreate} className="gap-2 bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={posts}
          loading={loading}
          getRowKey={(post) => post.id}
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Post" : "New Post"}</DialogTitle>
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
                <Label>Content *</Label>
                <Textarea
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Thumbnail URL</Label>
                <Input
                  value={form.thumbnail}
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
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
