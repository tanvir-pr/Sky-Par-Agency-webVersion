"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { toast } from "sonner";
import { AdminHeader } from "@/components/admin/header";
import { CrmNav } from "@/components/admin/crm/crm-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Target, TrendingUp, Users } from "lucide-react";
import { formatCurrency } from "@/lib/crm-status";

const PipelineChart = dynamic(
  () => import("@/components/admin/pipeline-chart").then((m) => m.PipelineChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-muted-foreground">Loading chart...</div>
    ),
  }
);

interface Lead {
  id: string;
  status: string;
  leadScore: number;
}

interface Deal {
  id: string;
  stage: string;
  value: number | null;
}

const LEAD_FUNNEL_ORDER = [
  "NEW",
  "CONTACTED",
  "MEETING_SCHEDULED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
];

const LEAD_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  MEETING_SCHEDULED: "Meeting",
  PROPOSAL_SENT: "Proposal",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

const DEAL_FUNNEL_ORDER = [
  "QUALIFICATION",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
];

const DEAL_LABELS: Record<string, string> = {
  QUALIFICATION: "Qualification",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/leads", { params: { limit: "100" } }),
      axios.get("/api/deals", { params: { limit: "100" } }),
      axios.get("/api/clients", { params: { limit: "100" } }),
    ])
      .then(([leadsRes, dealsRes, clientsRes]) => {
        setLeads(leadsRes.data.leads ?? []);
        setDeals(dealsRes.data.deals ?? []);
        setClients(clientsRes.data.clients?.length ?? 0);
      })
      .catch(() => toast.error("Failed to load pipeline data"))
      .finally(() => setLoading(false));
  }, []);

  const leadFunnelData = useMemo(
    () =>
      LEAD_FUNNEL_ORDER.map((status) => ({
        stage: LEAD_LABELS[status] || status,
        count: leads.filter((l) => l.status === status).length,
      })),
    [leads]
  );

  const dealFunnelData = useMemo(
    () =>
      DEAL_FUNNEL_ORDER.map((stage) => ({
        stage: DEAL_LABELS[stage] || stage,
        count: deals.filter((d) => d.stage === stage).length,
        value: deals.filter((d) => d.stage === stage).reduce((sum, d) => sum + (d.value ?? 0), 0),
      })),
    [deals]
  );

  const wonLeads = leads.filter((l) => l.status === "WON").length;
  const totalPipelineValue = deals
    .filter((d) => !d.stage.startsWith("CLOSED_LOST"))
    .reduce((sum, d) => sum + (d.value ?? 0), 0);
  const avgLeadScore =
    leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.leadScore, 0) / leads.length) : 0;
  const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0;

  return (
    <>
      <AdminHeader title="Pipeline" description="Visualize your sales funnel and conversion metrics" />
      <div className="flex-1 overflow-y-auto p-6">
        <CrmNav />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="indigo" title="Total Clients" value={loading ? "—" : clients} icon={Users} />
          <StatCard accent="sky" title="Total Leads" value={loading ? "—" : leads.length} icon={Users} />
          <StatCard accent="emerald" title="Pipeline Value" value={loading ? "—" : formatCurrency(totalPipelineValue)} icon={DollarSign} />
          <StatCard accent="violet" title="Conversion Rate" value={loading ? "—" : `${conversionRate}%`} description={`Avg score ${avgLeadScore}`} icon={TrendingUp} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-indigo-600" />
                Lead Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">Loading...</div>
                ) : (
                  <PipelineChart data={leadFunnelData} dataKey="count" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Deal Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">Loading...</div>
                ) : (
                  <PipelineChart data={dealFunnelData} dataKey="count" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 overflow-hidden border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base">Deal Value by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {dealFunnelData.map((item) => (
                <div key={item.stage} className="rounded-xl border bg-gradient-to-br from-emerald-50/50 to-white p-4 dark:from-emerald-950/20 dark:to-slate-900">
                  <p className="text-xs font-medium text-muted-foreground">{item.stage}</p>
                  <p className="mt-1 text-2xl font-bold">{item.count}</p>
                  <p className="text-sm text-emerald-600">{formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
