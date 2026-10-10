"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { ExternalLink, FileText, Plus, Search, TrendingUp, Wallet } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { FinanceNav } from "@/components/admin/finance/finance-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INVOICE_STATUSES,
  INVOICE_STATUS_CONFIG,
  formatCurrency,
  formatInvoiceStatus,
  type InvoiceStatus,
} from "@/lib/finance-status";
import { cn, formatDate } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  company: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  dueDate: string | null;
  createdAt: string;
  client: Client;
}

const emptyForm = {
  clientId: "",
  description: "",
  amount: "",
  dueDate: "",
  notes: "",
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await axios.get("/api/invoices", { params });
      setInvoices(res.data.invoices ?? []);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    axios
      .get("/api/clients", { params: { limit: "100" } })
      .then((res) => setClients(res.data.clients ?? []))
      .catch(() => setClients([]));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return invoices;
    const q = search.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.client.name.toLowerCase().includes(q) ||
        inv.client.company?.toLowerCase().includes(q)
    );
  }, [invoices, search]);

  const stats = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "PAID");
    const outstanding = invoices.filter((i) => ["SENT", "OVERDUE"].includes(i.status));
    return {
      total: invoices.length,
      paidAmount: paid.reduce((s, i) => s + i.total, 0),
      outstandingAmount: outstanding.reduce((s, i) => s + i.total, 0),
      draft: invoices.filter((i) => i.status === "DRAFT").length,
    };
  }, [invoices]);

  const handleCreate = async () => {
    if (!form.clientId || !form.amount) {
      toast.error("Client and amount are required");
      return;
    }
    setSaving(true);
    try {
      const amount = parseFloat(form.amount);
      await axios.post("/api/invoices", {
        clientId: form.clientId,
        lineItems: [{ description: form.description || "Service", amount, qty: 1 }],
        subtotal: amount,
        tax: 0,
        total: amount,
        dueDate: form.dueDate || undefined,
        notes: form.notes || undefined,
      });
      toast.success("Invoice created");
      setDialogOpen(false);
      setForm(emptyForm);
      fetchInvoices();
    } catch {
      toast.error("Failed to create invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminHeader title="Invoices" description="Create, send and track client invoices" />
      <div className="flex-1 overflow-y-auto p-6">
        <FinanceNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="indigo" title="Total Invoices" value={loading ? "—" : stats.total} icon={FileText} />
          <StatCard accent="emerald" title="Collected" value={loading ? "—" : formatCurrency(stats.paidAmount)} icon={Wallet} />
          <StatCard accent="amber" title="Outstanding" value={loading ? "—" : formatCurrency(stats.outstandingAmount)} icon={TrendingUp} />
          <StatCard accent="sky" title="Drafts" value={loading ? "—" : stats.draft} description="Awaiting send" icon={FileText} />
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Card className="flex-1 overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardContent className="flex flex-wrap items-center gap-3 p-4">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search invoices, clients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {INVOICE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {formatInvoiceStatus(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
              </span>
            </CardContent>
          </Card>
          <Button onClick={() => setDialogOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Loading invoices...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">No invoices found</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((inv) => {
              const cfg = INVOICE_STATUS_CONFIG[inv.status as InvoiceStatus];
              return (
                <Card key={inv.id} className="overflow-hidden border-slate-200/80 transition-all hover:shadow-md dark:border-slate-800">
                  <CardContent className="flex flex-wrap items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50">
                      <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-[140px] flex-1">
                      <p className="font-bold text-emerald-600">{inv.invoiceNumber}</p>
                      <p className="text-sm font-medium">{inv.client.company || inv.client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {inv.dueDate ? formatDate(inv.dueDate) : "Not set"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(inv.total)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(inv.createdAt)}</p>
                    </div>
                    <Badge variant="outline" className={cn("shrink-0", cfg?.bg, cfg?.color, cfg?.border)}>
                      {formatInvoiceStatus(inv.status)}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/finance/invoices/${inv.id}`}>
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Client *</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
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
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Service description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                  {saving ? "Creating..." : "Create Invoice"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
