"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, UserCircle } from "lucide-react";
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

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image: string | null;
  linkedin: string | null;
  twitter: string | null;
  order: number;
  published: boolean;
}

const emptyForm = {
  name: "",
  role: "",
  bio: "",
  image: "",
  linkedin: "",
  twitter: "",
  order: 0,
  published: true,
};

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/team");
      setMembers(res.data.team ?? []);
    } catch {
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (member: TeamMember) => {
    setEditing(member);
    setForm({
      name: member.name,
      role: member.role,
      bio: member.bio || "",
      image: member.image || "",
      linkedin: member.linkedin || "",
      twitter: member.twitter || "",
      order: member.order,
      published: member.published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`/api/team/${editing.id}`, form);
        toast.success("Team member updated");
      } else {
        await axios.post("/api/team", form);
        toast.success("Team member added");
      }

      setDialogOpen(false);
      fetchMembers();
    } catch {
      toast.error("Failed to save team member");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this team member?")) return;
    try {
      await axios.delete(`/api/team/${id}`);
      toast.success("Team member removed");
      fetchMembers();
    } catch {
      toast.error("Failed to delete team member");
    }
  };

  const columns: Column<TeamMember>[] = [
    {
      key: "name",
      header: "Member",
      cell: (member) => (
        <div>
          <p className="font-medium">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.role}</p>
        </div>
      ),
    },
    {
      key: "order",
      header: "Order",
      cell: (member) => member.order,
    },
    {
      key: "status",
      header: "Status",
      cell: (member) => (
        <Badge variant={member.published ? "default" : "secondary"}>
          {member.published ? "Published" : "Hidden"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (member) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEdit(member)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => handleDelete(member.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminHeader title="Team" description="Manage team members" />
      <div className="flex-1 overflow-y-auto p-6">
        <CmsNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="sky" title="Team Members" value={loading ? "—" : members.length} icon={UserCircle} />
          <StatCard accent="emerald" title="Published" value={loading ? "—" : members.filter((m) => m.published).length} icon={UserCircle} />
          <StatCard accent="amber" title="Drafts" value={loading ? "—" : members.filter((m) => !m.published).length} icon={UserCircle} />
        </div>
        <div className="mb-6 flex justify-end">
          <Button onClick={openCreate} className="gap-2 bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4" />
            Add Member
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={members}
          loading={loading}
          getRowKey={(member) => member.id}
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Member" : "Add Member"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Input
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>LinkedIn</Label>
                  <Input
                    value={form.linkedin}
                    onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter</Label>
                  <Input
                    value={form.twitter}
                    onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                  />
                </div>
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
