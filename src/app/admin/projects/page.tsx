"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FolderKanban,
  LayoutGrid,
  List,
  Search,
  Target,
  TrendingUp,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { ProjectNav } from "@/components/admin/projects/project-nav";
import { ProjectPipeline } from "@/components/admin/project-pipeline";
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
  PROJECT_STATUSES,
  PROJECT_STATUS_CONFIG,
  formatProjectStatus,
  type ProjectStatus,
} from "@/lib/project-status";
import { cn, formatDate } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  status: string;
  progress: number;
  deadline: string | null;
  client: { name: string; company: string | null };
  _count?: { tasks: number; milestones: number };
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"pipeline" | "table">("pipeline");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await axios.get("/api/projects", { params });
      setProjects(res.data.projects ?? []);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.client.name.toLowerCase().includes(q) ||
        p.client.company?.toLowerCase().includes(q)
    );
  }, [projects, search]);

  const stats = useMemo(() => {
    const active = projects.filter(
      (p) => !["COMPLETED", "CANCELLED"].includes(p.status)
    ).length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;
    const inProgress = projects.filter((p) =>
      ["IN_PROGRESS", "CLIENT_REVIEW"].includes(p.status)
    ).length;
    const avgProgress =
      projects.length > 0
        ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)
        : 0;
    return { total: projects.length, active, completed, inProgress, avgProgress };
  }, [projects]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await axios.patch(`/api/projects/${id}`, { status });
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      toast.success(`Moved to ${formatProjectStatus(status)}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <AdminHeader
        title="Projects"
        description="Manage client projects from planning through delivery"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <ProjectNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="violet" title="Total Projects" value={loading ? "—" : stats.total} icon={FolderKanban} />
          <StatCard accent="sky" title="Active" value={loading ? "—" : stats.active} description="In flight" icon={Clock} />
          <StatCard accent="indigo" title="In Delivery" value={loading ? "—" : stats.inProgress} description="Progress / review" icon={Target} />
          <StatCard accent="emerald" title="Avg Progress" value={loading ? "—" : `${stats.avgProgress}%`} description={`${stats.completed} completed`} icon={TrendingUp} />
        </div>

        <Card className="mb-6 overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects, clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {formatProjectStatus(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex rounded-lg border p-1">
              <Button variant={view === "pipeline" ? "default" : "ghost"} size="sm" className="gap-1.5" onClick={() => setView("pipeline")}>
                <LayoutGrid className="h-4 w-4" />
                Pipeline
              </Button>
              <Button variant={view === "table" ? "default" : "ghost"} size="sm" className="gap-1.5" onClick={() => setView("table")}>
                <List className="h-4 w-4" />
                Table
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              {filtered.length} project{filtered.length !== 1 ? "s" : ""}
            </span>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Loading projects...</div>
        ) : view === "pipeline" ? (
          <ProjectPipeline projects={filtered} onStatusChange={updateStatus} updatingId={updatingId} />
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">No projects found</CardContent>
              </Card>
            ) : (
              filtered.map((project) => {
                const cfg = PROJECT_STATUS_CONFIG[project.status as ProjectStatus];
                return (
                  <Card key={project.id} className="overflow-hidden border-slate-200/80 transition-all hover:shadow-md dark:border-slate-800">
                    <CardContent className="flex flex-wrap items-center gap-4 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/50">
                        <FolderKanban className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="min-w-[140px] flex-1">
                        <p className="font-semibold">{project.title}</p>
                        <p className="text-sm text-muted-foreground">{project.client.company || project.client.name}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-violet-600" style={{ width: `${project.progress}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{project.progress}%</span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{project._count?.tasks ?? 0} tasks</p>
                        <p>{project.deadline ? formatDate(project.deadline) : "No deadline"}</p>
                      </div>
                      <Badge variant="outline" className={cn("shrink-0", cfg?.bg, cfg?.color, cfg?.border)}>
                        {formatProjectStatus(project.status)}
                      </Badge>
                      <Select value={project.status} onValueChange={(v) => updateStatus(project.id, v)} disabled={updatingId === project.id}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROJECT_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {formatProjectStatus(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/projects/${project.id}`}>
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {!loading && stats.completed > 0 && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            {stats.completed} project{stats.completed !== 1 ? "s" : ""} delivered successfully
          </div>
        )}
      </div>
    </>
  );
}
