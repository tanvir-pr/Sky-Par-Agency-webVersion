"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { DollarSign, Handshake, LayoutGrid, List, Search, TrendingUp, Trophy } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { CrmNav } from "@/components/admin/crm/crm-nav";
import { DealPipeline } from "@/components/admin/crm/deal-pipeline";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEAL_STAGES,
  DEAL_STAGE_CONFIG,
  formatCurrency,
  formatDealStage,
  type DealStage,
} from "@/lib/crm-status";
import { cn, formatDate } from "@/lib/utils";

interface Deal {
  id: string;
  title: string;
  value: number | null;
  stage: string;
  notes: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string; company: string | null } | null;
  lead: { id: string; name: string; email: string } | null;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"pipeline" | "table">("pipeline");
  const [stageFilter, setStageFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (stageFilter !== "all") params.stage = stageFilter;
      const res = await axios.get("/api/deals", { params });
      setDeals(res.data.deals ?? []);
    } catch {
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  }, [stageFilter]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const filtered = useMemo(() => {
    if (!search.trim()) return deals;
    const q = search.toLowerCase();
    return deals.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.client?.name.toLowerCase().includes(q) ||
        d.client?.company?.toLowerCase().includes(q) ||
        d.lead?.name.toLowerCase().includes(q)
    );
  }, [deals, search]);

  const stats = useMemo(() => {
    const open = deals.filter((d) => !d.stage.startsWith("CLOSED"));
    const won = deals.filter((d) => d.stage === "CLOSED_WON");
    const pipelineValue = open.reduce((s, d) => s + (d.value ?? 0), 0);
    const wonValue = won.reduce((s, d) => s + (d.value ?? 0), 0);
    return { total: deals.length, open: open.length, pipelineValue, won: won.length, wonValue };
  }, [deals]);

  const updateStage = async (id: string, stage: string) => {
    setUpdatingId(id);
    try {
      const res = await axios.patch(`/api/deals/${id}`, { stage });
      setDeals((prev) => prev.map((deal) => (deal.id === id ? res.data.deal : deal)));
      toast.success("Deal stage updated");
    } catch {
      toast.error("Failed to update deal");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <AdminHeader title="Deals" description="Track sales opportunities and deal progress" />
      <div className="flex-1 overflow-y-auto p-6">
        <CrmNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="emerald" title="Pipeline Value" value={loading ? "—" : formatCurrency(stats.pipelineValue)} icon={DollarSign} />
          <StatCard accent="indigo" title="Open Deals" value={loading ? "—" : stats.open} description={`${stats.total} total`} icon={Handshake} />
          <StatCard accent="violet" title="Won Value" value={loading ? "—" : formatCurrency(stats.wonValue)} icon={Trophy} />
          <StatCard accent="sky" title="Deals Won" value={loading ? "—" : stats.won} icon={TrendingUp} />
        </div>

        <Card className="mb-6 overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search deals..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {view === "table" && (
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stages</SelectItem>
                  {DEAL_STAGES.map((s) => (
                    <SelectItem key={s} value={s}>{formatDealStage(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="flex rounded-lg border p-1">
              <Button variant={view === "pipeline" ? "default" : "ghost"} size="sm" className="gap-1.5" onClick={() => setView("pipeline")}>
                <LayoutGrid className="h-4 w-4" /> Pipeline
              </Button>
              <Button variant={view === "table" ? "default" : "ghost"} size="sm" className="gap-1.5" onClick={() => setView("table")}>
                <List className="h-4 w-4" /> Table
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">{filtered.length} deal{filtered.length !== 1 ? "s" : ""}</span>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Loading deals...</div>
        ) : view === "pipeline" ? (
          <DealPipeline deals={filtered} onStageChange={updateStage} updatingId={updatingId} />
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">No deals found</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((deal) => {
              const cfg = DEAL_STAGE_CONFIG[deal.stage as DealStage];
              return (
                <Card key={deal.id} className="overflow-hidden border-slate-200/80 transition-all hover:shadow-md dark:border-slate-800">
                  <CardContent className="flex flex-wrap items-center gap-4 p-4">
                    <div className="min-w-[160px] flex-1">
                      <p className="font-semibold">{deal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {deal.client?.company || deal.client?.name || deal.lead?.name || "No client"}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-emerald-600">
                      {deal.value != null ? formatCurrency(deal.value) : "—"}
                    </p>
                    <Badge variant="outline" className={cn(cfg?.bg, cfg?.color, cfg?.border)}>
                      {formatDealStage(deal.stage)}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{formatDate(deal.updatedAt)}</p>
                    <Select value={deal.stage} onValueChange={(v) => updateStage(deal.id, v)} disabled={updatingId === deal.id}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DEAL_STAGES.map((s) => (
                          <SelectItem key={s} value={s}>{formatDealStage(s)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
