"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  FileText,
  Globe,
  Mail,
  Phone,
  StickyNote,
  User,
  Users,
  Wrench,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { CrmNav } from "@/components/admin/crm/crm-nav";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDealStage } from "@/lib/crm-status";
import { formatProjectStatus } from "@/lib/project-status";
import { formatInvoiceStatus } from "@/lib/finance-status";
import { formatDate } from "@/lib/utils";

interface ClientDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  website: string | null;
  address: string | null;
  industry: string | null;
  notes: string | null;
  createdAt: string;
  users: { id: string; name: string; email: string; role: string; status: string }[];
  clientNotes: { id: string; content: string; createdAt: string }[];
  clientFiles: { id: string; name: string; type: string; url: string; createdAt: string }[];
  subscriptions: {
    id: string;
    status: string;
    monthlyFee: number | null;
    package: { name: string; price: string };
  }[];
  projects: { id: string; title: string; status: string; progress: number; createdAt: string }[];
  invoices: {
    id: string;
    invoiceNumber: string;
    status: string;
    total: number;
    dueDate: string | null;
    createdAt: string;
  }[];
  orders: {
    id: string;
    orderNumber: string;
    status: string;
    price: number;
    createdAt: string;
    package: { name: string };
  }[];
  deals: {
    id: string;
    title: string;
    stage: string;
    value: number | null;
    updatedAt: string;
  }[];
  _count: {
    deals: number;
    orders: number;
    projects: number;
    invoices: number;
    subscriptions: number;
    clientNotes: number;
    clientFiles: number;
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

const invoiceStatusColors: Record<string, string> = {
  DRAFT: "bg-slate-500/10 text-slate-700",
  SENT: "bg-blue-500/10 text-blue-700",
  PAID: "bg-emerald-500/10 text-emerald-700",
  OVERDUE: "bg-red-500/10 text-red-700",
  CANCELLED: "bg-slate-500/10 text-slate-600",
};

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClient = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/clients/${id}`);
      setClient(res.data.client);
    } catch {
      toast.error("Failed to load client");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  if (loading && !client) {
    return (
      <>
        <AdminHeader title="Client Profile" description="Loading..." />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </>
    );
  }

  if (!client) {
    return (
      <>
        <AdminHeader title="Client Not Found" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <p className="text-muted-foreground">This client could not be found.</p>
          <Button asChild>
            <Link href="/admin/crm/clients">Back to Clients</Link>
          </Button>
        </div>
      </>
    );
  }

  const totalRevenue = client.invoices
    .filter((i) => i.status === "PAID")
    .reduce((s, i) => s + i.total, 0);
  const dealValue = client.deals.reduce((s, d) => s + (d.value ?? 0), 0);

  const projectColumns: Column<ClientDetail["projects"][0]>[] = [
    {
      key: "title",
      header: "Project",
      cell: (p) => (
        <Link href={`/admin/projects/${p.id}`} className="font-medium text-violet-600 hover:underline">
          {p.title}
        </Link>
      ),
    },
    { key: "status", header: "Status", cell: (p) => <Badge variant="outline">{formatProjectStatus(p.status)}</Badge> },
    { key: "progress", header: "Progress", cell: (p) => `${p.progress}%` },
    { key: "createdAt", header: "Started", cell: (p) => formatDate(p.createdAt) },
  ];

  const orderColumns: Column<ClientDetail["orders"][0]>[] = [
    {
      key: "orderNumber",
      header: "Order",
      cell: (o) => (
        <Link href={`/admin/orders/${o.id}`} className="font-medium text-indigo-600 hover:underline">
          {o.orderNumber}
        </Link>
      ),
    },
    { key: "package", header: "Package", cell: (o) => o.package.name },
    { key: "price", header: "Amount", cell: (o) => formatCurrency(o.price) },
    { key: "status", header: "Status", cell: (o) => <Badge variant="outline">{o.status.replace(/_/g, " ")}</Badge> },
    { key: "createdAt", header: "Date", cell: (o) => formatDate(o.createdAt) },
  ];

  const invoiceColumns: Column<ClientDetail["invoices"][0]>[] = [
    {
      key: "invoiceNumber",
      header: "Invoice",
      cell: (i) => (
        <Link href={`/admin/finance/invoices/${i.id}`} className="font-medium text-emerald-600 hover:underline">
          {i.invoiceNumber}
        </Link>
      ),
    },
    { key: "total", header: "Total", cell: (i) => formatCurrency(i.total) },
    {
      key: "status",
      header: "Status",
      cell: (i) => (
        <Badge variant="outline" className={invoiceStatusColors[i.status] || ""}>
          {formatInvoiceStatus(i.status)}
        </Badge>
      ),
    },
    { key: "dueDate", header: "Due", cell: (i) => (i.dueDate ? formatDate(i.dueDate) : "—") },
  ];

  const dealColumns: Column<ClientDetail["deals"][0]>[] = [
    { key: "title", header: "Deal", cell: (d) => d.title },
    { key: "value", header: "Value", cell: (d) => (d.value != null ? formatCurrency(d.value) : "—") },
    { key: "stage", header: "Stage", cell: (d) => <Badge variant="outline">{formatDealStage(d.stage)}</Badge> },
    { key: "updatedAt", header: "Updated", cell: (d) => formatDate(d.updatedAt) },
  ];

  return (
    <>
      <AdminHeader title={client.name} description={client.company || client.email} />
      <div className="flex-1 overflow-y-auto p-6">
        <CrmNav />

        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/admin/crm/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Clients
          </Link>
        </Button>

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white shadow-xl shadow-indigo-600/20 dark:border-indigo-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-indigo-200">Client</p>
              <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
              <p className="mt-1 text-indigo-100">{client.company || client.email}</p>
            </div>
            {client.industry && (
              <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                {client.industry}
              </Badge>
            )}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-indigo-200">Projects</p>
              <p className="text-xl font-bold">{client._count.projects}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-indigo-200">Orders</p>
              <p className="text-xl font-bold">{client._count.orders}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-indigo-200">Revenue</p>
              <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-indigo-200">Deals</p>
              <p className="text-xl font-bold">{formatCurrency(dealValue)}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-indigo-200">Client Since</p>
              <p className="text-sm font-semibold">{formatDate(client.createdAt)}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders ({client.orders.length})</TabsTrigger>
            <TabsTrigger value="projects">Projects ({client.projects.length})</TabsTrigger>
            <TabsTrigger value="invoices">Invoices ({client.invoices.length})</TabsTrigger>
            <TabsTrigger value="deals">Deals ({client.deals.length})</TabsTrigger>
            <TabsTrigger value="services">Services ({client.subscriptions.length})</TabsTrigger>
            <TabsTrigger value="notes">Notes ({client.clientNotes.length})</TabsTrigger>
            <TabsTrigger value="files">Files ({client.clientFiles.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="overflow-hidden">
                <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-4 w-4 text-indigo-600" />
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  {[
                    { icon: Mail, label: "Email", value: client.email },
                    client.phone && { icon: Phone, label: "Phone", value: client.phone },
                    client.company && { icon: Building2, label: "Company", value: client.company },
                    client.website && { icon: Globe, label: "Website", value: client.website, link: client.website },
                    client.address && { icon: Building2, label: "Address", value: client.address },
                  ]
                    .filter(Boolean)
                    .map((item) => {
                      const row = item as { icon: typeof Mail; label: string; value: string; link?: string };
                      const Icon = row.icon;
                      return (
                        <div key={row.label} className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{row.label}</p>
                            {row.link ? (
                              <a href={row.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:underline">
                                {row.value}
                              </a>
                            ) : (
                              <p className="text-sm font-medium">{row.value}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-indigo-600" />
                    Portal Users & Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  {client.users.length > 0 ? (
                    client.users.map((u) => (
                      <div key={u.id} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="text-sm font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <Badge variant="outline">{u.status}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No portal users linked</p>
                  )}
                  {client.notes && (
                    <div className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-900">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">General Notes</p>
                      <p className="whitespace-pre-wrap">{client.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <DataTable columns={orderColumns} data={client.orders} getRowKey={(o) => o.id} emptyMessage="No orders for this client" />
          </TabsContent>

          <TabsContent value="projects">
            <DataTable columns={projectColumns} data={client.projects} getRowKey={(p) => p.id} emptyMessage="No projects for this client" />
          </TabsContent>

          <TabsContent value="invoices">
            <DataTable columns={invoiceColumns} data={client.invoices} getRowKey={(i) => i.id} emptyMessage="No invoices for this client" />
          </TabsContent>

          <TabsContent value="deals">
            <DataTable columns={dealColumns} data={client.deals} getRowKey={(d) => d.id} emptyMessage="No deals for this client" />
          </TabsContent>

          <TabsContent value="services">
            {client.subscriptions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Wrench className="mb-2 h-8 w-8" />
                  No active services
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {client.subscriptions.map((sub) => (
                  <Card key={sub.id} className="overflow-hidden border-slate-200/80">
                    <CardContent className="p-4">
                      <p className="font-medium">{sub.package.name}</p>
                      <p className="text-sm text-muted-foreground">{sub.package.price}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline">{sub.status}</Badge>
                        {sub.monthlyFee != null && (
                          <span className="text-sm font-medium text-emerald-600">
                            {formatCurrency(sub.monthlyFee)}/mo
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes">
            {client.clientNotes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <StickyNote className="mb-2 h-8 w-8" />
                  No notes yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {client.clientNotes.map((note) => (
                  <Card key={note.id}>
                    <CardContent className="p-4">
                      <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="files">
            {client.clientFiles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileText className="mb-2 h-8 w-8" />
                  No files uploaded
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {client.clientFiles.map((file) => (
                  <Card key={file.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{file.name}</p>
                          <Badge variant="outline" className="mt-1 text-xs">{file.type}</Badge>
                          <p className="mt-1 text-xs text-muted-foreground">{formatDate(file.createdAt)}</p>
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-indigo-600 hover:underline">
                            View file
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
