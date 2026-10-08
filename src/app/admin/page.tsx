"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import Link from "next/link";
import {
  Users, Briefcase, DollarSign, FileText, TrendingUp, Target,
  FolderKanban, Receipt, UserPlus, Activity, Calendar,
  ArrowRight, ShoppingCart, BarChart3, Globe, Wrench, Settings, Shield,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MODULE_LINKS = [
  { href: "/admin/crm", title: "CRM", description: "Clients, leads, deals and pipeline", icon: Users, gradient: "from-indigo-500/10 to-violet-500/5" },
  { href: "/admin/orders", title: "Orders", description: "Client orders and delivery workflow", icon: ShoppingCart, gradient: "from-blue-500/10 to-sky-500/5" },
  { href: "/admin/projects", title: "Projects", description: "Tasks, kanban and milestones", icon: FolderKanban, gradient: "from-violet-500/10 to-purple-500/5" },
  { href: "/admin/finance", title: "Finance", description: "Invoices, payments and revenue", icon: DollarSign, gradient: "from-emerald-500/10 to-teal-500/5" },
  { href: "/admin/team/overview", title: "Team", description: "Employees, attendance and time tracking", icon: Briefcase, gradient: "from-sky-500/10 to-blue-500/5" },
  { href: "/admin/reports", title: "Reports", description: "Revenue, clients and marketing analytics", icon: BarChart3, gradient: "from-indigo-500/10 to-blue-500/5" },
  { href: "/admin/tools", title: "Tools", description: "Files, messages, calendar and automation", icon: Wrench, gradient: "from-orange-500/10 to-amber-500/5" },
  { href: "/admin/cms", title: "Website CMS", description: "Portfolio, blog and public content", icon: Globe, gradient: "from-teal-500/10 to-emerald-500/5" },
  { href: "/admin/services-mgmt", title: "Services", description: "Service packages and pricing", icon: FileText, gradient: "from-rose-500/10 to-pink-500/5" },
  { href: "/admin/settings", title: "Settings", description: "Agency configuration", icon: Settings, gradient: "from-slate-500/10 to-indigo-500/5" },
  { href: "/admin/super-admin", title: "Super Admin", description: "System logs, audit and security", icon: Shield, gradient: "from-red-500/10 to-rose-500/5" },
];

const LeadsChart = dynamic(
  () => import("@/components/admin/leads-chart").then((mod) => mod.LeadsChart),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-muted-foreground">Loading...</div> }
);

const RevenueChart = dynamic(
  () => import("@/components/admin/revenue-chart").then((mod) => mod.RevenueChart),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-muted-foreground">Loading...</div> }
);

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingInvoices: number;
  activeProjects: number;
  completedProjects: number;
  totalLeads: number;
  newLeadsThisMonth: number;
  conversionRate: number;
  leadsByMonth: { month: string; count: number }[];
  revenueByMonth: { month: string; amount: number }[];
  clientGrowth: { month: string; count: number }[];
  leadSources: { source: string; count: number }[];
  pipeline: { status: string; count: number }[];
  teamPerformance: { name: string; completedTasks: number }[];
  recentLeads: Lead[];
  recentActivities: ActivityItem[];
  upcomingMeetings: MeetingItem[];
}

interface Lead {
  id: string;
  name: string;
  email: string;
  service: string | null;
  status: string;
  source: string | null;
  leadScore: number;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  action: string;
  entityType: string | null;
  createdAt: string;
  user: { name: string } | null;
}

interface MeetingItem {
  id: string;
  title: string;
  startTime: string;
  creator: { name: string };
}

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-yellow-100 text-yellow-700",
  MEETING_SCHEDULED: "bg-orange-100 text-orange-700",
  PROPOSAL_SENT: "bg-purple-100 text-purple-700",
  NEGOTIATION: "bg-indigo-100 text-indigo-700",
  WON: "bg-emerald-100 text-emerald-700",
  LOST: "bg-red-100 text-red-700",
};

const leadColumns: Column<Lead>[] = [
  {
    key: "name",
    header: "Name",
    cell: (lead) => (
      <div>
        <p className="font-medium">{lead.name}</p>
        <p className="text-xs text-muted-foreground">{lead.email}</p>
      </div>
    ),
  },
  { key: "service", header: "Service", cell: (l) => l.service || "—" },
  {
    key: "status",
    header: "Status",
    cell: (l) => (
      <Badge variant="outline" className={statusColors[l.status] || ""}>
        {l.status.replace(/_/g, " ")}
      </Badge>
    ),
  },
  { key: "leadScore", header: "Score", cell: (l) => l.leadScore ?? 0 },
  { key: "createdAt", header: "Date", cell: (l) => formatDate(l.createdAt) },
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/stats").then((res) => setStats(res.data)).catch(() => setStats(null)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader title="Dashboard" description="Agency performance overview" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          <StatCard accent="indigo" title="Total Clients" value={loading ? "—" : stats?.totalClients ?? 0} description={`${stats?.activeClients ?? 0} active subscriptions`} icon={Users} />
          <StatCard accent="emerald" title="Total Revenue" value={loading ? "—" : formatCurrency(stats?.totalRevenue ?? 0)} description="All time" icon={DollarSign} />
          <StatCard accent="sky" title="Monthly Revenue" value={loading ? "—" : formatCurrency(stats?.monthlyRevenue ?? 0)} description="This month" icon={TrendingUp} />
          <StatCard accent="amber" title="Pending Invoices" value={loading ? "—" : stats?.pendingInvoices ?? 0} description="Awaiting payment" icon={Receipt} />
          <StatCard accent="violet" title="Active Projects" value={loading ? "—" : stats?.activeProjects ?? 0} description={`${stats?.completedProjects ?? 0} completed`} icon={FolderKanban} />
          <StatCard accent="sky" title="New Leads" value={loading ? "—" : stats?.newLeadsThisMonth ?? 0} description="This month" icon={UserPlus} />
          <StatCard accent="emerald" title="Conversion Rate" value={loading ? "—" : `${stats?.conversionRate ?? 0}%`} description={`${stats?.totalLeads ?? 0} total leads`} icon={Target} />
          <StatCard accent="rose" title="Total Leads" value={loading ? "—" : stats?.totalLeads ?? 0} description="All time" icon={Activity} />
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Access</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {MODULE_LINKS.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href}>
                  <Card className={cn("group h-full overflow-hidden border-slate-200/80 transition-all hover:border-indigo-300 hover:shadow-lg dark:border-slate-800", `bg-gradient-to-br ${card.gradient}`)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
                          <Icon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-indigo-600" />
                      </div>
                      <CardTitle className="mt-2 text-base">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{card.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
            <CardContent className="h-72">
              {stats?.revenueByMonth?.length ? <RevenueChart data={stats.revenueByMonth} /> : (
                <div className="flex h-full items-center justify-center text-muted-foreground">{loading ? "Loading..." : "No revenue data yet"}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Leads Overview</CardTitle></CardHeader>
            <CardContent className="h-72">
              {stats?.leadsByMonth?.length ? <LeadsChart data={stats.leadsByMonth} /> : (
                <div className="flex h-full items-center justify-center text-muted-foreground">{loading ? "Loading..." : "No lead data yet"}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Lead Sources</CardTitle></CardHeader>
            <CardContent>
              {(stats?.leadSources ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No source data</p>
              ) : (
                <div className="space-y-2">
                  {stats?.leadSources.map((s) => (
                    <div key={s.source} className="flex items-center justify-between text-sm">
                      <span>{s.source}</span>
                      <Badge variant="secondary">{s.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Pipeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(stats?.pipeline ?? []).map((p) => (
                  <div key={p.status} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{p.status.toLowerCase()}</span>
                    <Badge variant="outline">{p.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Team Performance</CardTitle></CardHeader>
            <CardContent>
              {(stats?.teamPerformance ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No task data yet</p>
              ) : (
                <div className="space-y-2">
                  {stats?.teamPerformance.map((t) => (
                    <div key={t.name} className="flex items-center justify-between text-sm">
                      <span>{t.name}</span>
                      <span className="text-muted-foreground">{t.completedTasks} tasks done</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Leads</CardTitle>
              <Link href="/admin/crm/leads" className="text-sm text-indigo-600 hover:underline">View all</Link>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable columns={leadColumns} data={stats?.recentLeads ?? []} loading={loading} getRowKey={(l) => l.id} className="border-0" emptyMessage="No leads yet" />
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
              <CardContent>
                {(stats?.recentActivities ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats?.recentActivities.map((a) => (
                      <div key={a.id} className="text-sm">
                        <p className="font-medium">{a.action}</p>
                        <p className="text-xs text-muted-foreground">{a.user?.name} · {formatDate(a.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Calendar className="h-4 w-4" />
                <CardTitle>Upcoming Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                {(stats?.upcomingMeetings ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming meetings</p>
                ) : (
                  <div className="space-y-3">
                    {stats?.upcomingMeetings.map((m) => (
                      <div key={m.id} className="text-sm">
                        <p className="font-medium">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(m.startTime)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
