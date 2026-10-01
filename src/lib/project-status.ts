export const PROJECT_STATUSES = [
  "PLANNING",
  "IN_PROGRESS",
  "ON_HOLD",
  "CLIENT_REVIEW",
  "COMPLETED",
  "CANCELLED",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; bg: string; border: string; dot: string; step: number }
> = {
  PLANNING: {
    label: "Planning",
    color: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    dot: "bg-slate-500",
    step: 1,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    dot: "bg-blue-500",
    step: 2,
  },
  ON_HOLD: {
    label: "On Hold",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    dot: "bg-amber-500",
    step: 2,
  },
  CLIENT_REVIEW: {
    label: "Client Review",
    color: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    dot: "bg-violet-500",
    step: 3,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    dot: "bg-emerald-500",
    step: 4,
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

export const PROJECT_WORKFLOW: Record<ProjectStatus, ProjectStatus[]> = {
  PLANNING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["ON_HOLD", "CLIENT_REVIEW", "COMPLETED", "CANCELLED"],
  ON_HOLD: ["IN_PROGRESS", "CANCELLED"],
  CLIENT_REVIEW: ["COMPLETED", "IN_PROGRESS"],
  COMPLETED: [],
  CANCELLED: [],
};

export const PROJECT_PIPELINE_COLUMNS: ProjectStatus[] = [
  "PLANNING",
  "IN_PROGRESS",
  "CLIENT_REVIEW",
  "COMPLETED",
];

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  TODO: { label: "To Do", color: "text-slate-700", bg: "bg-slate-500/10", border: "border-slate-500/30" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-700", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  IN_REVIEW: { label: "In Review", color: "text-violet-700", bg: "bg-violet-500/10", border: "border-violet-500/30" },
  DONE: { label: "Done", color: "text-emerald-700", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  BLOCKED: { label: "Blocked", color: "text-red-700", bg: "bg-red-500/10", border: "border-red-500/30" },
};

export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  LOW: { label: "Low", color: "text-slate-600", bg: "bg-slate-100" },
  MEDIUM: { label: "Medium", color: "text-blue-600", bg: "bg-blue-100" },
  HIGH: { label: "High", color: "text-orange-600", bg: "bg-orange-100" },
  URGENT: { label: "Urgent", color: "text-red-600", bg: "bg-red-100" },
};

export function formatProjectStatus(status: string) {
  return PROJECT_STATUS_CONFIG[status as ProjectStatus]?.label ?? status.replace(/_/g, " ");
}

export function formatTaskStatus(status: string) {
  return TASK_STATUS_CONFIG[status as TaskStatus]?.label ?? status.replace(/_/g, " ");
}
