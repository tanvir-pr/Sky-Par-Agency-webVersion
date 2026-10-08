"use client";

import { Mail } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import {
  LEAD_PIPELINE_COLUMNS,
  LEAD_STATUS_CONFIG,
  leadScoreColor,
  type LeadStatus,
} from "@/lib/crm-status";

export interface PipelineLead {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: string;
  leadScore: number;
  source: string | null;
  service: string | null;
  followUpAt: string | null;
  createdAt: string;
  assignedTo: { name: string } | null;
}

interface LeadPipelineProps {
  leads: PipelineLead[];
  onStatusChange?: (id: string, status: LeadStatus) => void;
  onSelect?: (lead: PipelineLead) => void;
  updatingId?: string | null;
}

export function LeadPipeline({ leads, onStatusChange, onSelect, updatingId }: LeadPipelineProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {LEAD_PIPELINE_COLUMNS.map((status) => {
        const cfg = LEAD_STATUS_CONFIG[status];
        const columnLeads = leads.filter((l) => l.status === status);

        return (
          <div
            key={status}
            className="flex w-72 shrink-0 flex-col rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950/80"
          >
            <div className={cn("flex items-center justify-between border-b px-4 py-3", cfg.border)}>
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", cfg.dot)} />
                <span className={cn("text-sm font-semibold", cfg.color)}>{cfg.label}</span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted-foreground dark:bg-slate-800">
                {columnLeads.length}
              </span>
            </div>

            <div className="flex min-h-[200px] flex-1 flex-col gap-3 p-3">
              {columnLeads.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No leads</p>
              ) : (
                columnLeads.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => onSelect?.(lead)}
                    className={cn(
                      "rounded-xl border bg-white p-3 text-left shadow-sm transition-all hover:shadow-md dark:bg-slate-900",
                      cfg.border,
                      updatingId === lead.id && "opacity-60"
                    )}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold leading-tight">{lead.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {lead.company || lead.email}
                        </p>
                      </div>
                      <span className={cn("text-xs font-bold", leadScoreColor(lead.leadScore))}>
                        {lead.leadScore}
                      </span>
                    </div>
                    {lead.service && (
                      <p className="mb-2 text-[10px] text-muted-foreground line-clamp-1">{lead.service}</p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {lead.source || "Direct"}
                      </span>
                      <span>{formatDate(lead.createdAt)}</span>
                    </div>
                    {lead.assignedTo && (
                      <p className="mt-2 text-[10px] text-indigo-600">→ {lead.assignedTo.name}</p>
                    )}
                    {onStatusChange && (
                      <select
                        className="mt-2 w-full rounded-lg border bg-background px-2 py-1.5 text-[10px]"
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                      >
                        {Object.entries(LEAD_STATUS_CONFIG).map(([key, c]) => (
                          <option key={key} value={key}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
