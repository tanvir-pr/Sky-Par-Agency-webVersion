"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { toast } from "sonner";
import { CalendarDays, Calendar, FolderKanban } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { ProjectNav } from "@/components/admin/projects/project-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectCalendarEvent } from "@/components/admin/project-calendar";

const ProjectCalendar = dynamic(
  () =>
    import("@/components/admin/project-calendar").then((mod) => mod.ProjectCalendar),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center text-muted-foreground">
        Loading calendar...
      </div>
    ),
  }
);

interface Task {
  id: string;
  title: string;
  dueDate: string;
  project: { id: string; title: string };
}

interface Project {
  id: string;
  title: string;
}

export default function AdminProjectCalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "200", hasDueDate: "true" };
      if (projectFilter !== "all") params.projectId = projectFilter;
      const [tasksRes, projectsRes] = await Promise.all([
        axios.get("/api/tasks", { params }),
        axios.get("/api/projects", { params: { limit: "100" } }),
      ]);
      setTasks(tasksRes.data.tasks ?? []);
      setProjects(projectsRes.data.projects ?? []);
    } catch {
      toast.error("Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, [projectFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const events: ProjectCalendarEvent[] = useMemo(
    () =>
      tasks
        .filter((t) => t.dueDate)
        .map((task) => {
          const start = new Date(task.dueDate);
          const end = new Date(task.dueDate);
          end.setHours(end.getHours() + 1);
          return {
            id: task.id,
            title: `${task.title} (${task.project.title})`,
            start,
            end,
          };
        }),
    [tasks]
  );

  return (
    <>
      <AdminHeader
        title="Project Calendar"
        description="Task due dates across all projects"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <ProjectNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="violet" title="Scheduled Events" value={loading ? "—" : events.length} icon={CalendarDays} />
          <StatCard accent="sky" title="Tasks with Due Dates" value={loading ? "—" : tasks.length} icon={Calendar} />
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
              {events.length} event{events.length !== 1 ? "s" : ""}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {loading ? (
              <div className="flex h-96 items-center justify-center text-muted-foreground">
                Loading...
              </div>
            ) : (
              <div className="h-[600px]">
                <ProjectCalendar events={events} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
