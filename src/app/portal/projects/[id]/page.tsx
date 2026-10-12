"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { ExternalLink, CheckCircle2, Circle } from "lucide-react";
import { PortalHeader } from "@/components/portal/portal-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface ProjectDetail {
  id: string;
  title: string;
  description: string | null;
  status: string;
  progress: number;
  deadline: string | null;
  stagingUrl: string | null;
  liveUrl: string | null;
  package: { name: string; category: { name: string } | null } | null;
  milestones: Array<{
    id: string;
    title: string;
    description: string | null;
    dueDate: string | null;
    completed: boolean;
    completedAt: string | null;
  }>;
  files: Array<{ id: string; name: string; url: string; type: string }>;
}

const statusColors: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  CLIENT_REVIEW: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

export default function PortalProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/api/portal/projects/${id}`)
      .then((res) => setProject(res.data.project))
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <PortalHeader title="Project" description="Loading..." />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <PortalHeader title="Project Not Found" />
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-muted-foreground">This project could not be found.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PortalHeader
        title={project.title}
        description={project.package?.category?.name ?? "Project details"}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Badge variant="outline" className={statusColors[project.status] || ""}>
            {project.status.replace(/_/g, " ")}
          </Badge>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-teal-600"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <span className="text-sm font-medium">{project.progress}% complete</span>
          </div>
          {project.deadline && (
            <span className="text-sm text-muted-foreground">
              Deadline: {formatDate(project.deadline)}
            </span>
          )}
        </div>

        {(project.stagingUrl || project.liveUrl) && (
          <div className="mb-6 flex flex-wrap gap-3">
            {project.stagingUrl && (
              <a
                href={project.stagingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                <ExternalLink className="h-4 w-4" />
                Staging Site
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                <ExternalLink className="h-4 w-4" />
                Live Site
              </a>
            )}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              {project.milestones.length ? (
                <ul className="space-y-4">
                  {project.milestones.map((m) => (
                    <li key={m.id} className="flex gap-3">
                      {m.completed ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" />
                      )}
                      <div>
                        <p className={`font-medium ${m.completed ? "text-muted-foreground line-through" : ""}`}>
                          {m.title}
                        </p>
                        {m.description && (
                          <p className="text-sm text-muted-foreground">{m.description}</p>
                        )}
                        {m.dueDate && (
                          <p className="text-xs text-muted-foreground">
                            Due {formatDate(m.dueDate)}
                            {m.completedAt && ` · Completed ${formatDate(m.completedAt)}`}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No milestones defined yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Files</CardTitle>
            </CardHeader>
            <CardContent>
              {project.files.length ? (
                <ul className="space-y-2">
                  {project.files.map((f) => (
                    <li key={f.id}>
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-teal-600 hover:underline"
                      >
                        {f.name}
                      </a>
                      <span className="ml-2 text-xs text-muted-foreground">{f.type}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No files uploaded yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {project.description && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {project.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
