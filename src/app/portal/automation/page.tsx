"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PortalHeader } from "@/components/portal/portal-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AutomationProject {
  id: string;
  title: string;
  status: string;
  progress: number;
  tasks: Array<{ id: string; title: string; status: string; type: string }>;
}

interface Subscription {
  id: string;
  status: string;
  package: { name: string };
}

const statusColors: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  IN_REVIEW: "bg-purple-100 text-purple-700",
  DONE: "bg-emerald-100 text-emerald-700",
  BLOCKED: "bg-red-100 text-red-700",
};

export default function PortalAutomationPage() {
  const [projects, setProjects] = useState<AutomationProject[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/portal/automation")
      .then((res) => {
        setProjects(res.data.automationProjects);
        setSubscriptions(res.data.subscriptions);
      })
      .catch(() => {
        setProjects([]);
        setSubscriptions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PortalHeader title="Automation Status" description="Track your automation workflows" />
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : projects.length || subscriptions.length ? (
          <div className="space-y-6">
            {subscriptions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Automation Subscriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {subscriptions.map((s) => (
                      <li key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                        <span className="font-medium">{s.package.name}</span>
                        <Badge variant="outline">{s.status}</Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{project.title}</CardTitle>
                    <Badge variant="outline">{project.status.replace(/_/g, " ")}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-teal-600"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-sm">{project.progress}%</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {project.tasks.length ? (
                    <ul className="space-y-2">
                      {project.tasks.map((task) => (
                        <li key={task.id} className="flex items-center justify-between text-sm">
                          <span>{task.title}</span>
                          <Badge variant="outline" className={statusColors[task.status] || ""}>
                            {task.status.replace(/_/g, " ")}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No automation tasks yet</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No automation services active. Contact us to set up workflow automation.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
