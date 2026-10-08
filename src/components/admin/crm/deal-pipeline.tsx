"use client";

import { DollarSign } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import {
  DEAL_PIPELINE_COLUMNS,
  DEAL_STAGE_CONFIG,
  DEAL_STAGES,
  formatCurrency,
  formatDealStage,
  type DealStage,
} from "@/lib/crm-status";

export interface PipelineDeal {
  id: string;
  title: string;
  value: number | null;
  stage: string;
  updatedAt: string;
  client: { name: string; company: string | null } | null;
  lead: { name: string } | null;
}

interface DealPipelineProps {
  deals: PipelineDeal[];
  onStageChange?: (id: string, stage: DealStage) => void;
  updatingId?: string | null;
}

export function DealPipeline({ deals, onStageChange, updatingId }: DealPipelineProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {DEAL_PIPELINE_COLUMNS.map((stage) => {
        const cfg = DEAL_STAGE_CONFIG[stage];
        const columnDeals = deals.filter((d) => d.stage === stage);
        const columnValue = columnDeals.reduce((s, d) => s + (d.value ?? 0), 0);

        return (
          <div
            key={stage}
            className="flex w-72 shrink-0 flex-col rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950/80"
          >
            <div className={cn("flex items-center justify-between border-b px-4 py-3", cfg.border)}>
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", cfg.dot)} />
                <span className={cn("text-sm font-semibold", cfg.color)}>{cfg.label}</span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted-foreground dark:bg-slate-800">
                {columnDeals.length}
              </span>
            </div>
            {columnValue > 0 && (
              <p className="border-b px-4 py-2 text-xs font-medium text-emerald-600">
                {formatCurrency(columnValue)}
              </p>
            )}

            <div className="flex min-h-[200px] flex-1 flex-col gap-3 p-3">
              {columnDeals.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No deals</p>
              ) : (
                columnDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className={cn(
                      "rounded-xl border bg-white p-3 shadow-sm transition-all hover:shadow-md dark:bg-slate-900",
                      cfg.border,
                      updatingId === deal.id && "opacity-60"
                    )}
                  >
                    <p className="text-sm font-semibold leading-tight">{deal.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {deal.client?.company || deal.client?.name || deal.lead?.name || "No client"}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                        <DollarSign className="h-3.5 w-3.5" />
                        {deal.value != null ? formatCurrency(deal.value) : "—"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(deal.updatedAt)}</span>
                    </div>
                    {onStageChange && (
                      <select
                        className="mt-2 w-full rounded-lg border bg-background px-2 py-1.5 text-[10px]"
                        value={deal.stage}
                        disabled={updatingId === deal.id}
                        onChange={(e) => onStageChange(deal.id, e.target.value as DealStage)}
                      >
                        {DEAL_STAGES.map((s) => (
                          <option key={s} value={s}>
                            {formatDealStage(s)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
