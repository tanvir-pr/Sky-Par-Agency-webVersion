"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Bot, Cpu, Zap } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { FinanceNav } from "@/components/admin/finance/finance-nav";
import { DataTable, type Column } from "@/components/admin/data-table";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

interface AiCostLog {
  id: string;
  provider: string;
  model: string | null;
  tokens: number;
  cost: number;
  createdAt: string;
  client: { name: string; company: string | null } | null;
}

interface AiCostSummary {
  totalCost: number;
  totalTokens: number;
  requestCount: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default function AdminAiCostsPage() {
  const [logs, setLogs] = useState<AiCostLog[]>([]);
  const [summary, setSummary] = useState<AiCostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [providerFilter, setProviderFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (providerFilter !== "all") params.provider = providerFilter;
      const res = await axios.get("/api/ai-costs", { params });
      setLogs(res.data.logs ?? []);
      setSummary(res.data.summary ?? null);
    } catch {
      toast.error("Failed to load AI cost data");
    } finally {
      setLoading(false);
    }
  }, [providerFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const providers = [...new Set(logs.map((l) => l.provider))];

  const columns: Column<AiCostLog>[] = [
    {
      key: "provider",
      header: "Provider",
      cell: (log) => (
        <Badge variant="outline">{log.provider}</Badge>
      ),
    },
    {
      key: "model",
      header: "Model",
      cell: (log) => log.model || "—",
    },
    {
      key: "client",
      header: "Client",
      cell: (log) =>
        log.client ? log.client.company || log.client.name : "Internal",
    },
    {
      key: "tokens",
      header: "Tokens",
      cell: (log) => log.tokens.toLocaleString(),
    },
    {
      key: "cost",
      header: "Cost",
      cell: (log) => formatCurrency(log.cost),
    },
    {
      key: "createdAt",
      header: "Date",
      cell: (log) => formatDate(log.createdAt),
    },
  ];

  return (
    <>
      <AdminHeader title="AI Costs" description="Track AI API usage and costs" />
      <div className="flex-1 overflow-y-auto p-6">
        <FinanceNav />
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            accent="emerald"
            title="Total AI Cost"
            value={loading ? "—" : formatCurrency(summary?.totalCost ?? 0)}
            description="All time"
            icon={Bot}
          />
          <StatCard
            accent="sky"
            title="Total Tokens"
            value={loading ? "—" : (summary?.totalTokens ?? 0).toLocaleString()}
            description="Tokens consumed"
            icon={Cpu}
          />
          <StatCard
            accent="amber"
            title="API Requests"
            value={loading ? "—" : summary?.requestCount ?? 0}
            description="Total requests"
            icon={Zap}
          />
        </div>

        <Card className="mt-8 mb-6">
          <CardContent className="flex flex-wrap items-center gap-4 p-4">
            <span className="text-sm font-medium">Provider:</span>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All providers</SelectItem>
                {providers.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="ml-auto text-sm text-muted-foreground">
              {logs.length} log{logs.length !== 1 ? "s" : ""}
            </span>
          </CardContent>
        </Card>

        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          getRowKey={(log) => log.id}
          emptyMessage="No AI cost logs found"
        />
      </div>
    </>
  );
}
