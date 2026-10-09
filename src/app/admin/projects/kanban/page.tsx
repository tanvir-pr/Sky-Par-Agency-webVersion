"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { FolderKanban, LayoutGrid, ListTodo } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { ProjectNav } from "@/components/admin/projects/project-nav";
import { StatCard } from "@/components/admin/stat-card";
import {
  KanbanBoard,
  type KanbanItem,
} from "@/components/admin/kanban/kanban-board";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  project: { id: string; title: string };
  assignee: { name: string } | null;
}

interface Project {
  id: string;
  title: string;
}

const COLUMNS = [
  { id: "TODO", title: "To Do", color: "bg-slate-500" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-500" },
  { id: "IN_REVIEW", title: "In Review", color: "bg-purple-500" },
  { id: "DONE", title: "Done", color: "bg-emerald-500" },
  { id: "BLOCKED", title: "Blocked", color: "bg-red-500" },
];

const priorityColors: Record<string, string> = {
  LOW: "text-slate-600",
  MEDIUM: "text-blue-600",
  HIGH: "text-orange-600",
  URGENT: "text-red-600",
};

export default function AdminKanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "200" };
      if (projectFilter !== "all") params.projectId = projectFilter;
      const [tasksRes, projectsRes] = await Promise.all([
        axios.get("/api/tasks", { params }),
        axios.get("/api/projects", { params: { limit: "100" } }),
      ]);
      setTasks(tasksRes.data.tasks ?? []);
      setProjects(projectsRes.data.projects ?? []);
    } catch {
      toast.error("Failed to load kanban board");
    } finally {
      setLoading(false);
    }
  }, [projectFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kanbanItems: KanbanItem[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    subtitle: `${task.project.title}${task.assignee ? ` · ${task.assignee.name}` : ""}`,
    status: task.status,
    badge: task.priority,
    badgeColor: priorityColors[task.priority],
  }));

  const handleMove = async (itemId: string, newStatus: string) => {
    const previous = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === itemId ? { ...t, status: newStatus } : t))
    );
    try {
      await axios.patch(`/api/tasks/${itemId}`, { status: newStatus });
      toast.success("Task moved");
    } catch {
      setTasks(previous);
      toast.error("Failed to update task");
    }
  };

  return (
    <>
      <AdminHeader title="Kanban Board" description="Drag tasks between columns" />
      <div className="flex-1 overflow-y-auto p-6">
        <ProjectNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="violet" title="Total Tasks" value={loading ? "—" : tasks.length} icon={ListTodo} />
          <StatCard accent="sky" title="In Progress" value={loading ? "—" : tasks.filter((t) => t.status === "IN_PROGRESS").length} icon={LayoutGrid} />
          <StatCard accent="emerald" title="Projects" value={loading ? "—" : projects.length} icon={FolderKanban} />
        </div>
        <Card className="mb-6">
          <CardContent className="flex flex-wrap items-center gap-4 p-4">
            <span className="text-sm font-medium">Project:</span>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="ml-auto text-sm text-muted-foreground">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </span>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Loading board...
          </div>
        ) : (
          <KanbanBoard
            columns={COLUMNS}
            items={kanbanItems}
            onMove={handleMove}
          />
        )}
      </div>
    </>
  );
}
