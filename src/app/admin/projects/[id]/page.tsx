"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Download,
  ExternalLink,
  FolderKanban,
  Globe,
  Mail,
  Target,
  User,
  Users,
  Zap,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { ProjectNav } from "@/components/admin/projects/project-nav";
import { ProjectWorkflow } from "@/components/admin/project-workflow";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_CONFIG,
  PROJECT_WORKFLOW,
  TASK_STATUS_CONFIG,
  formatProjectStatus,
  formatTaskStatus,
  type ProjectStatus,
} from "@/lib/project-status";
import { cn, formatDate } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: { name: string } | null;
}

interface Milestone {
  id: string;
  title: string;
  dueDate: string | null;
  completed: boolean;
}

interface ProjectMember {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
}

interface ProjectFile {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
}

interface Project {
  id: string;
  title: string;
  status: string;
  progress: number;
  deadline: string | null;
  stagingUrl: string | null;
  liveUrl: string | null;
  description: string | null;
  client: { id: string; name: string; company: string | null; email: string };
  tasks: Task[];
  milestones: Milestone[];
  members: ProjectMember[];
  files: ProjectFile[];
}

const ACTION_STYLES: Record<string, string> = {
  CANCELLED: "bg-red-600 hover:bg-red-700 text-white",
  COMPLETED: "bg-emerald-600 hover:bg-emerald-700 text-white",
  default: "bg-violet-600 hover:bg-violet-700 text-white",
};

export default function AdminProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/projects/${id}`);
      setProject(res.data.project ?? null);
    } catch {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await axios.patch(`/api/projects/${id}`, { status });
      setProject((prev) => (prev ? { ...prev, ...res.data.project } : null));
      toast.success(`Project moved to ${formatProjectStatus(status)}`);
    } catch {
      toast.error("Failed to update project");
    } finally {
      setUpdating(false);
    }
  };

  const taskColumns: Column<Task>[] = [
    { key: "title", header: "Task", cell: (t) => <span className="font-medium">{t.title}</span> },
    {
      key: "status",
      header: "Status",
      cell: (t) => {
        const cfg = TASK_STATUS_CONFIG[t.status as keyof typeof TASK_STATUS_CONFIG];
        return (
          <Badge variant="outline" className={cn(cfg?.bg, cfg?.color, cfg?.border)}>
            {formatTaskStatus(t.status)}
          </Badge>
        );
      },
    },
    { key: "priority", header: "Priority", cell: (t) => t.priority },
    { key: "assignee", header: "Assignee", cell: (t) => t.assignee?.name || "Unassigned" },
    { key: "dueDate", header: "Due", cell: (t) => (t.dueDate ? formatDate(t.dueDate) : "—") },
  ];

  const milestoneColumns: Column<Milestone>[] = [
    { key: "title", header: "Milestone", cell: (m) => m.title },
    { key: "dueDate", header: "Due Date", cell: (m) => (m.dueDate ? formatDate(m.dueDate) : "—") },
    {
      key: "completed",
      header: "Status",
      cell: (m) => (
        <Badge variant={m.completed ? "default" : "secondary"} className={m.completed ? "bg-emerald-600" : ""}>
          {m.completed ? "Completed" : "Pending"}
        </Badge>
      ),
    },
  ];

  const memberColumns: Column<ProjectMember>[] = [
    {
      key: "name",
      header: "Member",
      cell: (m) => (
        <div>
          <p className="font-medium">{m.user.name}</p>
          <p className="text-xs text-muted-foreground">{m.user.email}</p>
        </div>
      ),
    },
    { key: "role", header: "Role", cell: (m) => <Badge variant="outline">{m.role}</Badge> },
  ];

  const fileColumns: Column<ProjectFile>[] = [
    { key: "name", header: "File", cell: (f) => f.name },
    { key: "type", header: "Type", cell: (f) => f.type },
    { key: "createdAt", header: "Uploaded", cell: (f) => formatDate(f.createdAt) },
    {
      key: "actions",
      header: "",
      cell: (f) => (
        <Button variant="ghost" size="sm" asChild>
          <a href={f.url} target="_blank" rel="noopener noreferrer">
            <Download className="mr-1 h-3 w-3" />
            Download
          </a>
        </Button>
      ),
    },
  ];

  if (loading && !project) {
    return (
      <>
        <AdminHeader title="Project" description="Loading project details..." />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <AdminHeader title="Project Not Found" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <p className="text-muted-foreground">This project could not be found.</p>
          <Button variant="outline" asChild>
            <Link href="/admin/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </>
    );
  }

  const cfg = PROJECT_STATUS_CONFIG[project.status as ProjectStatus];
  const nextStatuses = PROJECT_WORKFLOW[project.status as ProjectStatus] ?? [];
  const doneTasks = project.tasks.filter((t) => t.status === "DONE").length;

  return (
    <>
      <AdminHeader
        title={project.title}
        description={`${project.client.company || project.client.name} · ${formatProjectStatus(project.status)}`}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <ProjectNav />

        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/admin/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Projects
          </Link>
        </Button>

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 p-6 text-white shadow-xl shadow-violet-600/20 dark:border-violet-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-violet-200">Project</p>
              <h2 className="text-3xl font-bold tracking-tight">{project.title}</h2>
              <p className="mt-1 text-violet-100">{project.client.company || project.client.name}</p>
            </div>
            <Badge variant="outline" className="border-white/30 bg-white/10 text-white backdrop-blur">
              {formatProjectStatus(project.status)}
            </Badge>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-violet-200">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-violet-200">Tasks Done</p>
              <p className="text-xl font-bold">{doneTasks}/{project.tasks.length}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-violet-200">Milestones</p>
              <p className="text-xl font-bold">{project.milestones.filter((m) => m.completed).length}/{project.milestones.length}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-violet-200">Deadline</p>
              <p className="text-sm font-semibold">{project.deadline ? formatDate(project.deadline) : "Not set"}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-violet-200">Team</p>
              <p className="text-xl font-bold">{project.members.length}</p>
            </div>
          </div>
          {(project.stagingUrl || project.liveUrl) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stagingUrl && (
                <Button size="sm" variant="secondary" className="gap-2 bg-white/20 text-white hover:bg-white/30" asChild>
                  <a href={project.stagingUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" />
                    Staging
                  </a>
                </Button>
              )}
              {project.liveUrl && (
                <Button size="sm" variant="secondary" className="gap-2 bg-white/20 text-white hover:bg-white/30" asChild>
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Live Site
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Project Lifecycle
          </h3>
          <ProjectWorkflow currentStatus={project.status} />
        </div>

        {nextStatuses.length > 0 && (
          <Card className="mb-6 border-violet-200/50 bg-violet-50/30 dark:border-violet-900/50 dark:bg-violet-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-violet-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {nextStatuses.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  disabled={updating}
                  className={ACTION_STYLES[status] ?? ACTION_STYLES.default}
                  onClick={() => updateStatus(status)}
                >
                  → {formatProjectStatus(status)}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-violet-600" />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {[
                { icon: User, label: "Name", value: project.client.name },
                { icon: Mail, label: "Email", value: project.client.email },
                project.client.company && { icon: Building2, label: "Company", value: project.client.company },
              ]
                .filter(Boolean)
                .map((item) => {
                  const row = item as { icon: typeof User; label: string; value: string };
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{row.label}</p>
                        <p className="text-sm font-medium">{row.value}</p>
                      </div>
                    </div>
                  );
                })}
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/admin/crm/clients/${project.client.id}`}>View Client Profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-violet-600" />
                Project Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {[
                { icon: FolderKanban, label: "Status", value: formatProjectStatus(project.status) },
                { icon: Calendar, label: "Deadline", value: project.deadline ? formatDate(project.deadline) : "Not set" },
                { icon: Users, label: "Team Members", value: `${project.members.length} assigned` },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{row.label}</p>
                      <p className="text-sm font-medium">{row.value}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {project.description && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-900">
                {project.description}
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="tasks">
          <TabsList className="mb-4">
            <TabsTrigger value="tasks">Tasks ({project.tasks.length})</TabsTrigger>
            <TabsTrigger value="milestones">Milestones ({project.milestones.length})</TabsTrigger>
            <TabsTrigger value="team">Team ({project.members.length})</TabsTrigger>
            <TabsTrigger value="files">Files ({project.files.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="tasks">
            <DataTable columns={taskColumns} data={project.tasks} getRowKey={(t) => t.id} emptyMessage="No tasks yet" />
          </TabsContent>
          <TabsContent value="milestones">
            <DataTable columns={milestoneColumns} data={project.milestones} getRowKey={(m) => m.id} emptyMessage="No milestones yet" />
          </TabsContent>
          <TabsContent value="team">
            <DataTable columns={memberColumns} data={project.members} getRowKey={(m) => m.id} emptyMessage="No team members assigned" />
          </TabsContent>
          <TabsContent value="files">
            <DataTable columns={fileColumns} data={project.files} getRowKey={(f) => f.id} emptyMessage="No files uploaded" />
          </TabsContent>
        </Tabs>

        <Card className="mt-6 border-dashed">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Manual Status Override</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={project.status} onValueChange={updateStatus} disabled={updating}>
              <SelectTrigger className="w-56">
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}
