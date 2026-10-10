"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminHeader } from "@/components/admin/header";
import { ReportNav } from "@/components/admin/reports/report-nav";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DollarSign, FolderKanban, ShoppingCart, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface ClientStat {
  id: string;
  name: string;
  company: string | null;
  email: string;
  industry: string | null;
  projects: number;
  orders: number;
  activeSubscriptions: number;
  totalRevenue: number;
  createdAt: string;
}

const columns: Column<ClientStat>[] = [
  {
    key: "name",
    header: "Client",
    cell: (c) => (
      <div>
        <p className="font-medium">{c.name}</p>
        <p className="text-xs text-muted-foreground">{c.company ?? c.email}</p>
      </div>
    ),
  },
  {
    key: "projects",
    header: "Projects",
    cell: (c) => (
      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
        {c.projects}
      </span>
    ),
  },
  {
    key: "orders",
    header: "Orders",
    cell: (c) => (
      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300">
        {c.orders}
      </span>
    ),
  },
  {
    key: "activeSubscriptions",
    header: "Subscriptions",
    cell: (c) => c.activeSubscriptions,
  },
  {
    key: "totalRevenue",
    header: "Revenue",
    cell: (c) => (
      <span className="font-semibold text-emerald-600">${c.totalRevenue.toLocaleString()}</span>
    ),
  },
  {
    key: "createdAt",
    header: "Since",
    cell: (c) => formatDate(c.createdAt),
  },
];

export default function ClientReportsPage() {
  const [clients, setClients] = useState<ClientStat[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/reports/clients")
      .then((res) => {
        setClients(res.data.clients);
        setTotalClients(res.data.totalClients);
      })
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0);
  const totalOrders = clients.reduce((sum, c) => sum + c.orders, 0);
  const totalProjects = clients.reduce((sum, c) => sum + c.projects, 0);

  const chartData = [...clients]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 8)
    .map((c) => ({
      name: (c.company || c.name).slice(0, 12),
      revenue: c.totalRevenue,
    }));

  return (
    <>
      <AdminHeader title="Client Reports" description="Client activity and revenue breakdown" />
      <div className="flex-1 overflow-y-auto p-6">
        <ReportNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="indigo" title="Total Clients" value={loading ? "—" : totalClients} icon={Users} />
          <StatCard
            accent="emerald"
            title="Client Revenue"
            value={loading ? "—" : `$${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard accent="sky" title="Total Orders" value={loading ? "—" : totalOrders} icon={ShoppingCart} />
          <StatCard accent="violet" title="Active Projects" value={loading ? "—" : totalProjects} icon={FolderKanban} />
        </div>

        {chartData.length > 0 && (
          <Card className="mb-6 overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle>Top Clients by Revenue</CardTitle>
            </CardHeader>
            <CardContent className="h-64 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis tickFormatter={(v) => `$${v}`} className="text-xs" />
                  <Tooltip
                    formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle>Client Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={clients}
              loading={loading}
              getRowKey={(c) => c.id}
              className="border-0"
              emptyMessage="No clients found"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
