"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AdminHeader } from "@/components/admin/header";
import { ToolsNav } from "@/components/admin/tools/tools-nav";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AiCost {
  id: string;
  provider: string;
  model: string | null;
  tokens: number;
  cost: number;
  createdAt: string;
  client: { name: string } | null;
}

interface Proposal {
  id: string;
  title: string;
  status: string;
  value: number | null;
  client: { name: string };
  createdAt: string;
}

const aiColumns: Column<AiCost>[] = [
  { key: "provider", header: "Provider", cell: (l) => <Badge variant="outline">{l.provider}</Badge> },
  { key: "model", header: "Model", cell: (l) => l.model ?? "—" },
  { key: "client", header: "Client", cell: (l) => l.client?.name ?? "Internal" },
  { key: "tokens", header: "Tokens", cell: (l) => l.tokens.toLocaleString() },
  { key: "cost", header: "Cost", cell: (l) => `$${l.cost.toFixed(4)}` },
  { key: "createdAt", header: "Date", cell: (l) => formatDate(l.createdAt) },
];

const proposalColumns: Column<Proposal>[] = [
  { key: "title", header: "Proposal", cell: (p) => <span className="font-medium">{p.title}</span> },
  { key: "client", header: "Client", cell: (p) => p.client.name },
  { key: "status", header: "Status", cell: (p) => <Badge variant="outline">{p.status}</Badge> },
  { key: "value", header: "Value", cell: (p) => (p.value ? `$${p.value.toLocaleString()}` : "—") },
];

export default function AiToolsPage() {
  const [aiCosts, setAiCosts] = useState<AiCost[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [openaiConfigured, setOpenaiConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/admin/ai-tools").then((res) => {
      setAiCosts(res.data.aiCosts ?? []);
      setProposals(res.data.proposals ?? []);
      setTotalCost(res.data.totalCost ?? 0);
      setOpenaiConfigured(res.data.openaiConfigured ?? false);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader title="AI Tools" description="AI usage, proposals, and content generation" />
      <div className="flex-1 overflow-y-auto p-6">
        <ToolsNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="rose" title="Total AI Cost" value={loading ? "—" : `$${totalCost.toFixed(2)}`} icon={DollarSign} />
          <StatCard accent="violet" title="Proposals" value={loading ? "—" : proposals.length} icon={FileText} />
          <StatCard accent={openaiConfigured ? "emerald" : "amber"} title="OpenAI" value={openaiConfigured ? "Configured" : "Not Set"} icon={Sparkles} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50"><CardTitle>Recent AI Usage</CardTitle></CardHeader>
            <CardContent className="p-0">
              <DataTable columns={aiColumns} data={aiCosts} loading={loading} getRowKey={(l) => l.id} className="border-0" emptyMessage="No AI usage logged" />
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50"><CardTitle>Recent Proposals</CardTitle></CardHeader>
            <CardContent className="p-0">
              <DataTable columns={proposalColumns} data={proposals} loading={loading} getRowKey={(p) => p.id} className="border-0" emptyMessage="No proposals yet" />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
