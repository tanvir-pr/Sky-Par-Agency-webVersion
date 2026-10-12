"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Wrench, FolderKanban, Receipt, MessageSquare } from "lucide-react";
import { PortalHeader } from "@/components/portal/portal-header";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface DashboardData {
  client: { name: string; company: string | null };
  stats: {
    activeSubscriptions: number;
    activeProjects: number;
    pendingInvoices: number;
    outstandingBalance: number;
    unreadMessages: number;
  };
  recentProjects: Array<{
    id: string;
    title: string;
    status: string;
    progress: number;
    deadline: string | null;
  }>;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    status: string;
    total: number;
    dueDate: string | null;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    price: number;
    package: { name: string };
  }>;
}

const statusColors: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  CLIENT_REVIEW: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  SENT: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
  NEW: "bg-blue-100 text-blue-700",
};

const projectColumns: Column<DashboardData["recentProjects"][0]>[] = [
  {
    key: "title",
    header: "Project",
    cell: (p) => (
      <Link href={`/portal/projects/${p.id}`} className="font-medium text-teal-600 hover:underline">
        {p.title}
      </Link>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (p) => (
      <Badge variant="outline" className={statusColors[p.status] || ""}>
        {p.status.replace(/_/g, " ")}
      </Badge>
    ),
  },
  {
    key: "progress",
    header: "Progress",
    cell: (p) => `${p.progress}%`,
  },
  {
    key: "deadline",
    header: "Deadline",
    cell: (p) => (p.deadline ? formatDate(p.deadline) : "—"),
  },
];

export default function PortalDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/portal/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PortalHeader
        title={`Welcome${data?.client ? `, ${data.client.name}` : ""}`}
        description={data?.client?.company ?? "Your project dashboard"}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Services"
            value={loading ? "—" : data?.stats.activeSubscriptions ?? 0}
            icon={Wrench}
          />
          <StatCard
            title="Active Projects"
            value={loading ? "—" : data?.stats.activeProjects ?? 0}
            icon={FolderKanban}
          />
          <StatCard
            title="Pending Invoices"
            value={loading ? "—" : data?.stats.pendingInvoices ?? 0}
            description={
              data?.stats.outstandingBalance
                ? `$${data.stats.outstandingBalance.toFixed(2)} outstanding`
                : undefined
            }
            icon={Receipt}
          />
          <StatCard
            title="Unread Messages"
            value={loading ? "—" : data?.stats.unreadMessages ?? 0}
            icon={MessageSquare}
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={projectColumns}
                data={data?.recentProjects ?? []}
                loading={loading}
                getRowKey={(p) => p.id}
                className="border-0"
                emptyMessage="No projects yet"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : data?.recentInvoices.length ? (
                <ul className="space-y-3">
                  {data.recentInvoices.map((inv) => (
                    <li key={inv.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{inv.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {inv.dueDate ? `Due ${formatDate(inv.dueDate)}` : "No due date"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${inv.total.toFixed(2)}</p>
                        <Badge variant="outline" className={statusColors[inv.status] || ""}>
                          {inv.status}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No invoices yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
