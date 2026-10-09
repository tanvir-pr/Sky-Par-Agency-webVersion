"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_CONFIG, type OrderStatus } from "@/lib/order-status";

const WORKFLOW_STEPS: OrderStatus[] = [
  "NEW",
  "REVIEW",
  "ACCEPTED",
  "IN_PROGRESS",
  "CLIENT_REVIEW",
  "COMPLETED",
];

interface OrderWorkflowProps {
  currentStatus: string;
}

export function OrderWorkflow({ currentStatus }: OrderWorkflowProps) {
  const current = ORDER_STATUS_CONFIG[currentStatus as OrderStatus];
  const currentStep = current?.step ?? 0;
  const isCancelled = currentStatus === "CANCELLED";
  const isRevision = currentStatus === "REVISION";

  if (isCancelled) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">This order was cancelled</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white via-slate-50/50 to-white p-6 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/50 dark:to-slate-900">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-200 dark:bg-slate-700" />
        <div
          className="absolute left-0 top-5 h-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
          style={{
            width: `${Math.max(0, ((isRevision ? 4 : currentStep) - 1) / (WORKFLOW_STEPS.length - 1)) * 100}%`,
          }}
        />
        {WORKFLOW_STEPS.map((step, i) => {
          const cfg = ORDER_STATUS_CONFIG[step];
          const stepNum = cfg.step;
          const done = stepNum < currentStep || (step === "COMPLETED" && currentStatus === "COMPLETED");
          const active = step === currentStatus || (isRevision && step === "CLIENT_REVIEW");

          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  done && "border-emerald-500 bg-emerald-500 text-white",
                  active && !done && "border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/30",
                  !done && !active && "border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-900"
                )}
              >
                {done ? <Check className="h-5 w-5" /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <span
                className={cn(
                  "hidden text-center text-[10px] font-medium sm:block",
                  active ? cfg.color : "text-muted-foreground"
                )}
              >
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
      {isRevision && (
        <p className="mt-4 text-center text-xs text-rose-600 dark:text-rose-400">
          Currently in revision — client requested changes
        </p>
      )}
    </div>
  );
}
