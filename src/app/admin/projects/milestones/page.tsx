"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { CheckCircle2, Milestone, Target } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { ProjectNav } from "@/components/admin/projects/project-nav";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  project: { id: string; title: string };
}

interface Project {
  id: string;
  title: string;
}

export default function AdminMilestonesPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState("all");
  const [completedFilter, setCompletedFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (projectFilter !== "all") params.projectId = projectFilter;
      if (completedFilter !== "all") params.completed = completedFilter;
      const [milestonesRes, projectsRes] = await Promise.all([
        axios.get("/api/milestones", { params }),
        axios.get("/api/projects", { params: { limit: "100" } }),
      ]);
      setMilestones(milestonesRes.data.milestones ?? []);
      setProjects(projectsRes.data.projects ?? []);
    } catch {
      toast.error("Failed to load milestones");
    } finally {
      setLoading(false);
    }
  }, [projectFilter, completedFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: Column<Milestone>[] = [
    {
      key: "title",
      header: "Milestone",
      cell: (m) => (
        <div>
          <p className="font-medium">{m.title}</p>
          {m.description && (
            <p className="text-xs text-muted-foreground">{m.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "project",
      header: "Project",
      cell: (m) => (
        <Button variant="link" className="h-auto p-0" asChild>
          <Link href={`/admin/projects/${m.project.id}`}>{m.project.title}</Link>
        </Button>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      cell: (m) => (m.dueDate ? formatDate(m.dueDate) : "—"),
    },
    {
      key: "status",
      header: "Status",
      cell: (m) => (
        <Badge variant={m.completed ? "default" : "secondary"}>
          {m.completed ? "Completed" : "Pending"}
        </Badge>
      ),
    },
    {
      key: "completedAt",
      header: "Completed",
      cell: (m) => (m.completedAt ? formatDate(m.completedAt) : "—"),
    },
  ];

  return (
    <>
      <AdminHeader title="Milestones" description="Track project milestones" />
      <div className="flex-1 overflow-y-auto p-6">
        <ProjectNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="violet" title="Total Milestones" value={loading ? "—" : milestones.length} icon={Milestone} />
          <StatCard accent="emerald" title="Completed" value={loading ? "—" : milestones.filter((m) => m.completed).length} icon={CheckCircle2} />
          <StatCard accent="amber" title="Pending" value={loading ? "—" : milestones.filter((m) => !m.completed).length} icon={Target} />
        </div>

        <Card className="mb-6 overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex flex-wrap items-center gap-4 p-4">
            <span className="text-sm font-medium">Project:</span>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
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
            <span className="text-sm font-medium">Status:</span>
            <Select value={completedFilter} onValueChange={setCompletedFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="false">Pending</SelectItem>
                <SelectItem value="true">Completed</SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-auto text-sm text-muted-foreground">
              {milestones.length} milestone{milestones.length !== 1 ? "s" : ""}
            </span>
          </CardContent>
        </Card>

        <DataTable
          columns={columns}
          data={milestones}
          loading={loading}
          getRowKey={(m) => m.id}
          emptyMessage="No milestones found"
        />
      </div>
    </>
  );
}
