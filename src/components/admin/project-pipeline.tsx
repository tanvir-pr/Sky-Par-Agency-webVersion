"use client";

import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import {
  PROJECT_PIPELINE_COLUMNS,
  PROJECT_STATUS_CONFIG,
  formatProjectStatus,
  type ProjectStatus,
} from "@/lib/project-status";

export interface PipelineProject {
  id: string;
  title: string;
  status: string;
  progress: number;
  deadline: string | null;
  client: { name: string; company: string | null };
  _count?: { tasks: number };
}

interface ProjectPipelineProps {
  projects: PipelineProject[];
  onStatusChange?: (id: string, status: ProjectStatus) => void;
  updatingId?: string | null;
}

export function ProjectPipeline({ projects, onStatusChange, updatingId }: ProjectPipelineProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PROJECT_PIPELINE_COLUMNS.map((status) => {
        const cfg = PROJECT_STATUS_CONFIG[status];
        const columnProjects = projects.filter((p) => {
          if (status === "IN_PROGRESS") {
            return p.status === "IN_PROGRESS" || p.status === "ON_HOLD";
          }
          return p.status === status;
        });

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
                {columnProjects.length}
              </span>
            </div>

            <div className="flex min-h-[200px] flex-1 flex-col gap-3 p-3">
              {columnProjects.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No projects</p>
              ) : (
                columnProjects.map((project) => (
                  <div
                    key={project.id}
                    className={cn(
                      "group rounded-xl border bg-white p-3 shadow-sm transition-all hover:shadow-md dark:bg-slate-900",
                      cfg.border,
                      updatingId === project.id && "opacity-60"
                    )}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold leading-tight">{project.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {project.client.company || project.client.name}
                        </p>
                      </div>
                      <FolderKanban className="h-4 w-4 shrink-0 text-violet-500" />
                    </div>

                    <div className="mb-2">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{project._count?.tasks ?? 0} tasks</span>
                      <span>{project.deadline ? formatDate(project.deadline) : "No deadline"}</span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-100 py-1.5 text-xs font-medium transition-colors hover:bg-violet-100 hover:text-violet-700 dark:bg-slate-800 dark:hover:bg-violet-950"
                      >
                        View <ArrowRight className="h-3 w-3" />
                      </Link>
                      {onStatusChange && (
                        <select
                          className="rounded-lg border bg-background px-2 py-1.5 text-[10px]"
                          value={project.status}
                          disabled={updatingId === project.id}
                          onChange={(e) => onStatusChange(project.id, e.target.value as ProjectStatus)}
                        >
                          {Object.entries(PROJECT_STATUS_CONFIG).map(([key, c]) => (
                            <option key={key} value={key}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    {project.status === "ON_HOLD" && (
                      <p className="mt-2 text-center text-[10px] font-medium text-amber-600">
                        {formatProjectStatus("ON_HOLD")}
                      </p>
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
