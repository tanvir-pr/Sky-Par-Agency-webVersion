"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { CheckSquare, FolderKanban, Bell } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { TeamNav } from "@/components/admin/team/team-nav";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  project: { id: string; title: string; status: string } | null;
}

interface Project {
  id: string;
  title: string;
  status: string;
  progress: number;
  deadline: string | null;
}

const statusColors: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  IN_REVIEW: "bg-purple-100 text-purple-700",
  BLOCKED: "bg-red-100 text-red-700",
};

const priorityColors: Record<string, string> = {
  URGENT: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  LOW: "bg-slate-100 text-slate-600",
};

const taskColumns: Column<Task>[] = [
  { key: "title", header: "Task", cell: (t) => t.title },
  {
    key: "project",
    header: "Project",
    cell: (t) => t.project?.title ?? "—",
  },
  {
    key: "status",
    header: "Status",
    cell: (t) => (
      <Badge variant="outline" className={statusColors[t.status] || ""}>
        {t.status.replace(/_/g, " ")}
      </Badge>
    ),
  },
  {
    key: "priority",
    header: "Priority",
    cell: (t) => (
      <Badge variant="outline" className={priorityColors[t.priority] || ""}>
        {t.priority}
      </Badge>
    ),
  },
  {
    key: "dueDate",
    header: "Due",
    cell: (t) => (t.dueDate ? formatDate(t.dueDate) : "—"),
  },
];

export default function MyWorkPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskStats, setTaskStats] = useState({ todo: 0, inProgress: 0, inReview: 0, blocked: 0 });
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; body: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/my-work")
      .then((res) => {
        setTasks(res.data.tasks);
        setProjects(res.data.projects);
        setTaskStats(res.data.taskStats);
        setNotifications(res.data.notifications);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader title="My Work" description="Your tasks, projects, and notifications" />
      <div className="flex-1 overflow-y-auto p-6">
        <TeamNav />

        <div className="grid gap-6 md:grid-cols-4">
          <StatCard accent="sky" title="To Do" value={loading ? "—" : taskStats.todo} icon={CheckSquare} />
          <StatCard accent="indigo" title="In Progress" value={loading ? "—" : taskStats.inProgress} icon={CheckSquare} />
          <StatCard accent="violet" title="In Review" value={loading ? "—" : taskStats.inReview} icon={CheckSquare} />
          <StatCard accent="emerald" title="My Projects" value={loading ? "—" : projects.length} icon={FolderKanban} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={taskColumns}
                data={tasks}
                loading={loading}
                getRowKey={(t) => t.id}
                className="border-0"
                emptyMessage="No tasks assigned"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length ? (
                <ul className="space-y-3">
                  {notifications.map((n) => (
                    <li key={n.id} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No unread notifications</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
