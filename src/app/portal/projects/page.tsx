"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { PortalHeader } from "@/components/portal/portal-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  status: string;
  progress: number;
  deadline: string | null;
  stagingUrl: string | null;
  liveUrl: string | null;
  package: { name: string; category: { name: string } | null } | null;
  _count: { tasks: number; files: number };
}

const statusColors: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  ON_HOLD: "bg-gray-100 text-gray-700",
  CLIENT_REVIEW: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const columns: Column<Project>[] = [
  {
    key: "title",
    header: "Project",
    cell: (p) => (
      <Link href={`/portal/projects/${p.id}`} className="font-medium text-teal-600 hover:underline">
        {p.title}
      </Link>
    ),
  },
  {
    key: "service",
    header: "Service",
    cell: (p) => p.package?.category?.name ?? "—",
  },
  {
    key: "status",
    header: "Status",
    cell: (p) => (
      <Badge variant="outline" className={statusColors[p.status] || ""}>
        {p.status.replace(/_/g, " ")}
      </Badge>
    ),
  },
  {
    key: "progress",
    header: "Progress",
    cell: (p) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-16 rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-teal-600"
            style={{ width: `${p.progress}%` }}
          />
        </div>
        <span className="text-sm">{p.progress}%</span>
      </div>
    ),
  },
  {
    key: "deadline",
    header: "Deadline",
    cell: (p) => (p.deadline ? formatDate(p.deadline) : "—"),
  },
];

export default function PortalProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/portal/projects")
      .then((res) => setProjects(res.data.projects))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PortalHeader title="Projects" description="Track your project progress" />
      <div className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>All Projects ({projects.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={projects}
              loading={loading}
              getRowKey={(p) => p.id}
              className="border-0"
              emptyMessage="No projects yet"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
