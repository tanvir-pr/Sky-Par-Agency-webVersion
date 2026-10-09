"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { AlertTriangle, CheckSquare, Search } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { ProjectNav } from "@/components/admin/projects/project-nav";
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
  PRIORITY_CONFIG,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TASK_STATUS_CONFIG,
  formatTaskStatus,
} from "@/lib/project-status";
import { cn, formatDate } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  project: { id: string; title: string };
  assignee: { name: string } | null;
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (statusFilter !== "all") params.status = statusFilter;
      if (priorityFilter !== "all") params.priority = priorityFilter;
      const res = await axios.get("/api/tasks", { params });
      setTasks(res.data.tasks ?? []);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filtered = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.project.title.toLowerCase().includes(q) ||
        t.assignee?.name.toLowerCase().includes(q)
    );
  }, [tasks, search]);

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    blocked: tasks.filter((t) => t.status === "BLOCKED").length,
    done: tasks.filter((t) => t.status === "DONE").length,
  }), [tasks]);

  return (
    <>
      <AdminHeader title="Tasks" description="Global task list across all projects" />
      <div className="flex-1 overflow-y-auto p-6">
        <ProjectNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="violet" title="Total Tasks" value={loading ? "—" : stats.total} icon={CheckSquare} />
          <StatCard accent="sky" title="To Do" value={loading ? "—" : stats.todo} icon={CheckSquare} />
          <StatCard accent="indigo" title="In Progress" value={loading ? "—" : stats.inProgress} icon={CheckSquare} />
          <StatCard accent="rose" title="Blocked" value={loading ? "—" : stats.blocked} description={`${stats.done} done`} icon={AlertTriangle} />
        </div>

        <Card className="mb-6 overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex flex-wrap items-center gap-4 p-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search tasks, projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {TASK_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{formatTaskStatus(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {TASK_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>{PRIORITY_CONFIG[p]?.label ?? p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{filtered.length} task{filtered.length !== 1 ? "s" : ""}</span>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">No tasks match your filters</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((task) => {
              const statusCfg = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG];
              const priorityCfg = PRIORITY_CONFIG[task.priority];
              return (
                <Card key={task.id} className="overflow-hidden border-slate-200/80 transition-all hover:shadow-md dark:border-slate-800">
                  <CardContent className="flex flex-wrap items-center gap-4 p-4">
                    <div className="min-w-[180px] flex-1">
                      <p className="font-semibold">{task.title}</p>
                      <Button variant="link" className="h-auto p-0 text-sm text-violet-600" asChild>
                        <Link href={`/admin/projects/${task.project.id}`}>{task.project.title}</Link>
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.assignee?.name || "Unassigned"}</p>
                    <p className="text-xs text-muted-foreground">{task.dueDate ? formatDate(task.dueDate) : "No due date"}</p>
                    <Badge variant="outline" className={cn(statusCfg?.bg, statusCfg?.color, statusCfg?.border)}>
                      {formatTaskStatus(task.status)}
                    </Badge>
                    <Badge variant="outline" className={cn(priorityCfg?.bg, priorityCfg?.color)}>
                      {priorityCfg?.label ?? task.priority}
                    </Badge>
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
