"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  ArrowRight,
  DollarSign,
  Handshake,
  Target,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { CrmNav } from "@/components/admin/crm/crm-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/crm-status";
import { cn, formatDate } from "@/lib/utils";

const CRM_CARDS = [
  {
    href: "/admin/crm/clients",
    title: "Clients",
    description: "Manage relationships, projects and revenue",
    icon: Users,
    gradient: "from-indigo-500/10 to-violet-500/5",
  },
  {
    href: "/admin/crm/leads",
    title: "Leads",
    description: "Track and convert incoming prospects",
    icon: UserPlus,
    gradient: "from-blue-500/10 to-cyan-500/5",
  },
  {
    href: "/admin/crm/deals",
    title: "Deals",
    description: "Sales opportunities and pipeline value",
    icon: Handshake,
    gradient: "from-emerald-500/10 to-teal-500/5",
  },
  {
    href: "/admin/crm/pipeline",
    title: "Pipeline Analytics",
    description: "Funnel charts and conversion metrics",
    icon: Target,
    gradient: "from-violet-500/10 to-purple-500/5",
  },
];

interface CrmOverview {
  totalClients: number;
  totalLeads: number;
  activeLeads: number;
  totalDeals: number;
  pipelineValue: number;
  wonDeals: number;
  recentLeads: { id: string; name: string; status: string; createdAt: string }[];
  recentClients: { id: string; name: string; company: string | null; createdAt: string }[];
}

export default function CrmHubPage() {
  const [overview, setOverview] = useState<CrmOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/clients", { params: { limit: "100" } }),
      axios.get("/api/leads", { params: { limit: "100" } }),
      axios.get("/api/deals", { params: { limit: "100" } }),
    ])
      .then(([clientsRes, leadsRes, dealsRes]) => {
        const clients = clientsRes.data.clients ?? [];
        const leads = leadsRes.data.leads ?? [];
        const deals = dealsRes.data.deals ?? [];
        const activeLeads = leads.filter(
          (l: { status: string }) => !["WON", "LOST"].includes(l.status)
        ).length;
        const pipelineValue = deals
          .filter((d: { stage: string }) => !d.stage.startsWith("CLOSED_LOST"))
          .reduce((s: number, d: { value: number | null }) => s + (d.value ?? 0), 0);

        setOverview({
          totalClients: clients.length,
          totalLeads: leads.length,
          activeLeads,
          totalDeals: deals.length,
          pipelineValue,
          wonDeals: deals.filter((d: { stage: string }) => d.stage === "CLOSED_WON").length,
          recentLeads: leads.slice(0, 5).map((l: { id: string; name: string; status: string; createdAt: string }) => ({
            id: l.id,
            name: l.name,
            status: l.status,
            createdAt: l.createdAt,
          })),
          recentClients: clients.slice(0, 5).map(
            (c: { id: string; name: string; company: string | null; createdAt: string }) => ({
              id: c.id,
              name: c.name,
              company: c.company,
              createdAt: c.createdAt,
            })
          ),
        });
      })
      .catch(() => setOverview(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader
        title="CRM"
        description="Clients, leads, deals and sales pipeline at a glance"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <CrmNav />

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="indigo" title="Total Clients" value={loading ? "—" : overview?.totalClients ?? 0} icon={Users} />
          <StatCard accent="sky" title="Active Leads" value={loading ? "—" : overview?.activeLeads ?? 0} description={`${overview?.totalLeads ?? 0} total`} icon={UserPlus} />
          <StatCard accent="emerald" title="Pipeline Value" value={loading ? "—" : formatCurrency(overview?.pipelineValue ?? 0)} icon={DollarSign} />
          <StatCard accent="violet" title="Deals Won" value={loading ? "—" : overview?.wonDeals ?? 0} description={`${overview?.totalDeals ?? 0} deals`} icon={TrendingUp} />
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CRM_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card
                  className={cn(
                    "group h-full overflow-hidden border-slate-200/80 transition-all hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-slate-800",
                    `bg-gradient-to-br ${card.gradient}`
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
                        <Icon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-indigo-600" />
                    </div>
                    <CardTitle className="mt-3 text-lg">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden border-slate-200/80 dark:border-slate-800">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base">Recent Leads</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="p-6 text-sm text-muted-foreground">Loading...</p>
              ) : overview?.recentLeads.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">No leads yet</p>
              ) : (
                <ul className="divide-y">
                  {overview?.recentLeads.map((lead) => (
                    <li key={lead.id} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="font-medium">{lead.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {lead.status.replace(/_/g, " ")} · {formatDate(lead.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200/80 dark:border-slate-800">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-base">Recent Clients</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="p-6 text-sm text-muted-foreground">Loading...</p>
              ) : overview?.recentClients.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">No clients yet</p>
              ) : (
                <ul className="divide-y">
                  {overview?.recentClients.map((client) => (
                    <li key={client.id}>
                      <Link
                        href={`/admin/crm/clients/${client.id}`}
                        className="flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        <div>
                          <p className="font-medium">{client.name}</p>
                          {client.company && (
                            <p className="text-xs text-muted-foreground">{client.company}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(client.createdAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
