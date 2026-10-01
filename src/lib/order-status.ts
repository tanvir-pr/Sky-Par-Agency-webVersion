export const ORDER_STATUSES = [
  "NEW",
  "REVIEW",
  "ACCEPTED",
  "IN_PROGRESS",
  "CLIENT_REVIEW",
  "REVISION",
  "COMPLETED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; dot: string; step: number }
> = {
  NEW: {
    label: "New",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    dot: "bg-blue-500",
    step: 1,
  },
  REVIEW: {
    label: "Review",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
    step: 2,
  },
  ACCEPTED: {
    label: "Accepted",
    color: "text-indigo-700 dark:text-indigo-300",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    dot: "bg-indigo-500",
    step: 3,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    dot: "bg-violet-500",
    step: 4,
  },
  CLIENT_REVIEW: {
    label: "Client Review",
    color: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
    step: 5,
  },
  REVISION: {
    label: "Revision",
    color: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    dot: "bg-rose-500",
    step: 5,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
    step: 6,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    dot: "bg-slate-400",
    step: 0,
  },
};

export const ORDER_WORKFLOW: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["REVIEW", "CANCELLED"],
  REVIEW: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["CLIENT_REVIEW", "REVISION", "CANCELLED"],
  CLIENT_REVIEW: ["COMPLETED", "REVISION"],
  REVISION: ["IN_PROGRESS", "CLIENT_REVIEW"],
  COMPLETED: [],
  CANCELLED: [],
};

export const PIPELINE_COLUMNS: OrderStatus[] = [
  "NEW",
  "REVIEW",
  "ACCEPTED",
  "IN_PROGRESS",
  "CLIENT_REVIEW",
  "COMPLETED",
];

export function formatOrderStatus(status: string) {
  return ORDER_STATUS_CONFIG[status as OrderStatus]?.label ?? status.replace(/_/g, " ");
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}
