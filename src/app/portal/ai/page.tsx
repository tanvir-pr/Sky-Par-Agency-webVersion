"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PortalHeader } from "@/components/portal/portal-header";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Sparkles, DollarSign, Hash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface AiLog {
  id: string;
  provider: string;
  model: string | null;
  tokens: number;
  cost: number;
  createdAt: string;
}

interface AiSummary {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  byProvider: Record<string, { cost: number; tokens: number; count: number }>;
}

const columns: Column<AiLog>[] = [
  { key: "provider", header: "Provider", cell: (l) => l.provider },
  { key: "model", header: "Model", cell: (l) => l.model ?? "—" },
  { key: "tokens", header: "Tokens", cell: (l) => l.tokens.toLocaleString() },
  { key: "cost", header: "Cost", cell: (l) => `$${l.cost.toFixed(4)}` },
  { key: "createdAt", header: "Date", cell: (l) => formatDate(l.createdAt) },
];

export default function PortalAiPage() {
  const [logs, setLogs] = useState<AiLog[]>([]);
  const [summary, setSummary] = useState<AiSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/portal/ai")
      .then((res) => {
        setLogs(res.data.logs);
        setSummary(res.data.summary);
      })
      .catch(() => {
        setLogs([]);
        setSummary(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PortalHeader title="AI Usage" description="Track AI service usage and costs" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 grid gap-6 md:grid-cols-3">
          <StatCard
            title="Total Cost"
            value={loading ? "—" : `$${(summary?.totalCost ?? 0).toFixed(2)}`}
            icon={DollarSign}
          />
          <StatCard
            title="Total Tokens"
            value={loading ? "—" : (summary?.totalTokens ?? 0).toLocaleString()}
            icon={Hash}
          />
          <StatCard
            title="API Requests"
            value={loading ? "—" : summary?.totalRequests ?? 0}
            icon={Sparkles}
          />
        </div>

        {summary && Object.keys(summary.byProvider).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Usage by Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(summary.byProvider).map(([provider, stats]) => (
                  <div key={provider} className="rounded-lg border p-4">
                    <p className="font-medium capitalize">{provider}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.count} requests · {stats.tokens.toLocaleString()} tokens
                    </p>
                    <p className="text-lg font-semibold">${stats.cost.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recent Usage Log</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={logs}
              loading={loading}
              getRowKey={(l) => l.id}
              className="border-0"
              emptyMessage="No AI usage recorded yet"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
