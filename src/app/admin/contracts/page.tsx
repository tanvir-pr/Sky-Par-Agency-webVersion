"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Download, FileCheck, Plus, ScrollText } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { FinanceNav } from "@/components/admin/finance/finance-nav";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

interface Client {
  id: string;
  name: string;
  company: string | null;
}

interface Contract {
  id: string;
  title: string;
  status: string;
  fileUrl: string | null;
  renewalDate: string | null;
  signedAt: string | null;
  createdAt: string;
  client: Client;
}

const STATUSES = ["DRAFT", "SENT", "SIGNED", "EXPIRED", "RENEWED"] as const;

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
  SENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  SIGNED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  EXPIRED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  RENEWED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const emptyForm = {
  title: "",
  clientId: "",
  fileUrl: "",
  renewalDate: "",
};

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await axios.get("/api/contracts", { params });
      setContracts(res.data.contracts ?? []);
    } catch {
      toast.error("Failed to load contracts");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    axios
      .get("/api/clients", { params: { limit: "100" } })
      .then((res) => setClients(res.data.clients ?? []))
      .catch(() => setClients([]));
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.clientId) {
      toast.error("Title and client are required");
      return;
    }
    setSaving(true);
    try {
      await axios.post("/api/contracts", {
        title: form.title,
        clientId: form.clientId,
        fileUrl: form.fileUrl || undefined,
        renewalDate: form.renewalDate || undefined,
      });
      toast.success("Contract created");
      setDialogOpen(false);
      setForm(emptyForm);
      fetchContracts();
    } catch {
      toast.error("Failed to create contract");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`/api/contracts/${id}`, { status });
      toast.success("Contract status updated");
      fetchContracts();
    } catch {
      toast.error("Failed to update contract");
    }
  };

  const columns: Column<Contract>[] = [
    {
      key: "title",
      header: "Contract",
      cell: (c) => (
        <div>
          <p className="font-medium">{c.title}</p>
          <p className="text-xs text-muted-foreground">
            {c.client.company || c.client.name}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => (
        <Select value={c.status} onValueChange={(v) => updateStatus(c.id, v)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                <span className={statusColors[s]}>{s}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "renewalDate",
      header: "Renewal",
      cell: (c) => (c.renewalDate ? formatDate(c.renewalDate) : "—"),
    },
    {
      key: "signedAt",
      header: "Signed",
      cell: (c) => (c.signedAt ? formatDate(c.signedAt) : "—"),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (c) => formatDate(c.createdAt),
    },
    {
      key: "file",
      header: "File",
      cell: (c) =>
        c.fileUrl ? (
          <Button variant="ghost" size="sm" asChild>
            <a href={c.fileUrl} target="_blank" rel="noopener noreferrer">
              <Download className="mr-1 h-3 w-3" />
              Download
            </a>
          </Button>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <>
      <AdminHeader title="Contracts" description="Manage client contracts and renewals" />
      <div className="flex-1 overflow-y-auto p-6">
        <FinanceNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="emerald" title="Total Contracts" value={loading ? "—" : contracts.length} icon={ScrollText} />
          <StatCard accent="sky" title="Signed" value={loading ? "—" : contracts.filter((c) => c.status === "SIGNED").length} icon={FileCheck} />
          <StatCard accent="amber" title="Pending" value={loading ? "—" : contracts.filter((c) => c.status === "DRAFT" || c.status === "SENT").length} icon={ScrollText} />
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
                {contracts.length} contract{contracts.length !== 1 ? "s" : ""}
              </span>
            </CardContent>
          </Card>
          <Button onClick={() => setDialogOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            New Contract
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={contracts}
          loading={loading}
          getRowKey={(c) => c.id}
          emptyMessage="No contracts found"
        />

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Contract</DialogTitle>
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
                <Label>File URL</Label>
                <Input
                  value={form.fileUrl}
                  onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Renewal Date</Label>
                <Input
                  type="date"
                  value={form.renewalDate}
                  onChange={(e) => setForm({ ...form, renewalDate: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={saving}>
                  {saving ? "Creating..." : "Create Contract"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
