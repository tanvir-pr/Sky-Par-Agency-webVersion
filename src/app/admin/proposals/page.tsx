"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, ScrollText, Send, Sparkles } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { FinanceNav } from "@/components/admin/finance/finance-nav";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface Client {
  id: string;
  name: string;
  company: string | null;
}

interface Proposal {
  id: string;
  title: string;
  status: string;
  value: number | null;
  sentAt: string | null;
  createdAt: string;
  client: Client;
}

const STATUSES = ["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED"] as const;

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  VIEWED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  ACCEPTED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

const emptyForm = {
  title: "",
  clientId: "",
  content: "",
  value: "",
};

export default function AdminProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await axios.get("/api/proposals", { params });
      setProposals(res.data.proposals ?? []);
    } catch {
      toast.error("Failed to load proposals");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  useEffect(() => {
    axios
      .get("/api/clients", { params: { limit: "100" } })
      .then((res) => setClients(res.data.clients ?? []))
      .catch(() => setClients([]));
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.clientId || !form.content) {
      toast.error("Title, client, and content are required");
      return;
    }
    setSaving(true);
    try {
      await axios.post("/api/proposals", {
        title: form.title,
        clientId: form.clientId,
        content: form.content,
        value: form.value ? parseFloat(form.value) : undefined,
      });
      toast.success("Proposal created");
      setDialogOpen(false);
      setForm(emptyForm);
      fetchProposals();
    } catch {
      toast.error("Failed to create proposal");
    } finally {
      setSaving(false);
    }
  };

  const sendProposal = async (id: string) => {
    try {
      await axios.patch(`/api/proposals/${id}`, { status: "SENT" });
      toast.success("Proposal marked as sent");
      fetchProposals();
    } catch {
      toast.error("Failed to send proposal");
    }
  };

  const columns: Column<Proposal>[] = [
    {
      key: "title",
      header: "Proposal",
      cell: (p) => (
        <div>
          <p className="font-medium">{p.title}</p>
          <p className="text-xs text-muted-foreground">
            {p.client.company || p.client.name}
          </p>
        </div>
      ),
    },
    {
      key: "value",
      header: "Value",
      cell: (p) => (p.value != null ? formatCurrency(p.value) : "—"),
    },
    {
      key: "status",
      header: "Status",
      cell: (p) => (
        <Badge variant="outline" className={statusColors[p.status] || ""}>
          {p.status}
        </Badge>
      ),
    },
    {
      key: "sentAt",
      header: "Sent",
      cell: (p) => (p.sentAt ? formatDate(p.sentAt) : "—"),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (p) => formatDate(p.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (p) =>
        p.status === "DRAFT" ? (
          <Button variant="ghost" size="sm" onClick={() => sendProposal(p.id)}>
            <Send className="mr-1 h-3 w-3" />
            Send
          </Button>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <>
      <AdminHeader title="Proposals" description="Create and track client proposals" />
      <div className="flex-1 overflow-y-auto p-6">
        <FinanceNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="emerald" title="Total Proposals" value={loading ? "—" : proposals.length} icon={ScrollText} />
          <StatCard accent="sky" title="Sent" value={loading ? "—" : proposals.filter((p) => p.status === "SENT" || p.status === "VIEWED").length} icon={Send} />
          <StatCard accent="amber" title="Accepted" value={loading ? "—" : proposals.filter((p) => p.status === "ACCEPTED").length} icon={Sparkles} />
        </div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Card className="flex-1">
            <CardContent className="flex flex-wrap items-center gap-4 p-4">
              <span className="text-sm font-medium">Filter by status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="ml-auto text-sm text-muted-foreground">
                {proposals.length} proposal{proposals.length !== 1 ? "s" : ""}
              </span>
            </CardContent>
          </Card>
          <Button onClick={() => setDialogOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            New Proposal
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={proposals}
          loading={loading}
          getRowKey={(p) => p.id}
          emptyMessage="No proposals found"
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Proposal</DialogTitle>
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
                  <Label>Client *</Label>
                  <Select
                    value={form.clientId}
                    onValueChange={(v) => setForm({ ...form, clientId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.company || c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content *</Label>
                <Textarea
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Proposal content..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? "Creating..." : "Create Proposal"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
