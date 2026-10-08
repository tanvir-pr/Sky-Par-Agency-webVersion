"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  Building2,
  ExternalLink,
  FileText,
  FolderKanban,
  Plus,
  Search,
  ShoppingCart,
  Users,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { CrmNav } from "@/components/admin/crm/crm-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  industry: string | null;
  createdAt: string;
  _count: {
    projects: number;
    invoices: number;
    subscriptions: number;
    orders: number;
    deals: number;
  };
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  website: "",
  industry: "",
  notes: "",
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await axios.get("/api/clients", { params });
      setClients(res.data.clients ?? []);
    } catch {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const stats = useMemo(() => ({
    total: clients.length,
    withProjects: clients.filter((c) => c._count.projects > 0).length,
    totalOrders: clients.reduce((s, c) => s + c._count.orders, 0),
    totalDeals: clients.reduce((s, c) => s + c._count.deals, 0),
  }), [clients]);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post("/api/clients", {
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        company: form.company || undefined,
        website: form.website || undefined,
        industry: form.industry || undefined,
        notes: form.notes || undefined,
      });
      toast.success("Client created");
      setDialogOpen(false);
      setForm(emptyForm);
      fetchClients();
      router.push(`/admin/crm/clients/${res.data.client.id}`);
    } catch {
      toast.error("Failed to create client");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminHeader title="Clients" description="Manage your client relationships" />
      <div className="flex-1 overflow-y-auto p-6">
        <CrmNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="indigo" title="Total Clients" value={loading ? "—" : stats.total} icon={Users} />
          <StatCard accent="violet" title="With Projects" value={loading ? "—" : stats.withProjects} icon={FolderKanban} />
          <StatCard accent="sky" title="Total Orders" value={loading ? "—" : stats.totalOrders} icon={ShoppingCart} />
          <StatCard accent="emerald" title="Active Deals" value={loading ? "—" : stats.totalDeals} icon={Building2} />
        </div>

        <Card className="mb-6 overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex flex-wrap items-center gap-4 p-4">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={() => setDialogOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
            <span className="text-sm text-muted-foreground">
              {clients.length} client{clients.length !== 1 ? "s" : ""}
            </span>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Loading clients...</div>
        ) : clients.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">No clients found</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <Card
                key={client.id}
                className="overflow-hidden border-slate-200/80 transition-all hover:shadow-md dark:border-slate-800"
              >
                <CardContent className="flex flex-wrap items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50">
                    <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-[160px] flex-1">
                    <Link href={`/admin/crm/clients/${client.id}`} className="font-semibold text-indigo-600 hover:underline">
                      {client.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                    {client.company && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        {client.company}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1">
                      <FolderKanban className="h-3 w-3" />
                      {client._count.projects} projects
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <ShoppingCart className="h-3 w-3" />
                      {client._count.orders} orders
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <FileText className="h-3 w-3" />
                      {client._count.invoices} invoices
                    </Badge>
                    {client._count.deals > 0 && (
                      <Badge variant="secondary">{client._count.deals} deals</Badge>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {client.industry && <p>{client.industry}</p>}
                    <p>Added {formatDate(client.createdAt)}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/crm/clients/${client.id}`}>
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
                  {saving ? "Creating..." : "Create Client"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
