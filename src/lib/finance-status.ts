export const INVOICE_STATUSES = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; color: string; bg: string; border: string; dot: string; step: number }
> = {
  DRAFT: {
    label: "Draft",
    color: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    dot: "bg-slate-500",
    step: 1,
  },
  SENT: {
    label: "Sent",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    dot: "bg-blue-500",
    step: 2,
  },
  PAID: {
    label: "Paid",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
    step: 3,
  },
  OVERDUE: {
    label: "Overdue",
    color: "text-red-700 dark:text-red-300",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    dot: "bg-red-500",
    step: 2,
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

export const PAYMENT_STATUSES = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  PENDING: { label: "Pending", color: "text-amber-700", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  COMPLETED: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  FAILED: { label: "Failed", color: "text-red-700", bg: "bg-red-500/10", border: "border-red-500/30" },
  REFUNDED: { label: "Refunded", color: "text-slate-600", bg: "bg-slate-500/10", border: "border-slate-500/30" },
};

export const EXPENSE_CATEGORIES = ["TEAM", "SOFTWARE", "API", "AI", "MARKETING", "OTHER"] as const;

export const EXPENSE_CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  TEAM: { label: "Team", color: "text-blue-700", bg: "bg-blue-100" },
  SOFTWARE: { label: "Software", color: "text-purple-700", bg: "bg-purple-100" },
  API: { label: "API", color: "text-indigo-700", bg: "bg-indigo-100" },
  AI: { label: "AI", color: "text-pink-700", bg: "bg-pink-100" },
  MARKETING: { label: "Marketing", color: "text-orange-700", bg: "bg-orange-100" },
  OTHER: { label: "Other", color: "text-slate-700", bg: "bg-slate-100" },
};

export const INVOICE_PIPELINE_COLUMNS: InvoiceStatus[] = ["DRAFT", "SENT", "OVERDUE", "PAID"];

export function formatInvoiceStatus(status: string) {
  return INVOICE_STATUS_CONFIG[status as InvoiceStatus]?.label ?? status;
}

export function formatPaymentStatus(status: string) {
  return PAYMENT_STATUS_CONFIG[status as PaymentStatus]?.label ?? status;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}
