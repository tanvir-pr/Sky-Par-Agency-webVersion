export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "MEETING_SCHEDULED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_CONFIG: Record<
  LeadStatus,
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
  CONTACTED: {
    label: "Contacted",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
    step: 2,
  },
  MEETING_SCHEDULED: {
    label: "Meeting",
    color: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    dot: "bg-cyan-500",
    step: 3,
  },
  PROPOSAL_SENT: {
    label: "Proposal",
    color: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    dot: "bg-violet-500",
    step: 4,
  },
  NEGOTIATION: {
    label: "Negotiation",
    color: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
    step: 5,
  },
  WON: {
    label: "Won",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
    step: 6,
  },
  LOST: {
    label: "Lost",
    color: "text-red-700 dark:text-red-300",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    dot: "bg-red-400",
    step: 0,
  },
};

export const LEAD_PIPELINE_COLUMNS: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "MEETING_SCHEDULED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
];

export const DEAL_STAGES = [
  "QUALIFICATION",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export const DEAL_STAGE_CONFIG: Record<
  DealStage,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  QUALIFICATION: {
    label: "Qualification",
    color: "text-blue-700",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    dot: "bg-blue-500",
  },
  PROPOSAL: {
    label: "Proposal",
    color: "text-violet-700",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    dot: "bg-violet-500",
  },
  NEGOTIATION: {
    label: "Negotiation",
    color: "text-orange-700",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    dot: "bg-orange-500",
  },
  CLOSED_WON: {
    label: "Closed Won",
    color: "text-emerald-700",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  CLOSED_LOST: {
    label: "Closed Lost",
    color: "text-red-700",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    dot: "bg-red-400",
  },
};

export const DEAL_PIPELINE_COLUMNS: DealStage[] = [
  "QUALIFICATION",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
];

export function formatLeadStatus(status: string) {
  return LEAD_STATUS_CONFIG[status as LeadStatus]?.label ?? status.replace(/_/g, " ");
}

export function formatDealStage(stage: string) {
  return DEAL_STAGE_CONFIG[stage as DealStage]?.label ?? stage.replace(/_/g, " ");
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function leadScoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-muted-foreground";
}
