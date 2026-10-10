"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AdminHeader } from "@/components/admin/header";
import { ReportNav } from "@/components/admin/reports/report-nav";
import { StatCard } from "@/components/admin/stat-card";
import { CheckCircle2, Clock, FolderKanban, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  assignedTasks: number;
  completedTasks: number;
  projects: number;
  totalHours: number;
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "from-rose-500 to-pink-500",
  ADMIN: "from-indigo-500 to-violet-500",
  PROJECT_MANAGER: "from-sky-500 to-blue-500",
  SALES_MANAGER: "from-emerald-500 to-teal-500",
  default: "from-slate-400 to-slate-500",
};

export default function TeamReportsPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/reports/team")
      .then((res) => setTeam(res.data.team))
      .catch(() => setTeam([]))
      .finally(() => setLoading(false));
  }, []);

  const totalTasks = team.reduce((s, m) => s + m.assignedTasks, 0);
  const completedTasks = team.reduce((s, m) => s + m.completedTasks, 0);
  const totalHours = team.reduce((s, m) => s + m.totalHours, 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
      <AdminHeader title="Team Reports" description="Team productivity and workload analytics" />
      <div className="flex-1 overflow-y-auto p-6">
        <ReportNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="indigo" title="Team Members" value={loading ? "—" : team.length} icon={Users} />
          <StatCard
            accent="emerald"
            title="Tasks Completed"
            value={loading ? "—" : `${completedTasks} / ${totalTasks}`}
            description={`${completionRate}% completion rate`}
            trend={`${completionRate}%`}
            trendDirection="up"
            icon={CheckCircle2}
          />
          <StatCard accent="sky" title="Hours Logged" value={loading ? "—" : `${totalHours}h`} icon={Clock} />
          <StatCard
            accent="violet"
            title="Active Projects"
            value={loading ? "—" : team.reduce((s, m) => s + m.projects, 0)}
            icon={FolderKanban}
          />
        </div>

        {/* Overall completion bar */}
        <Card className="mb-6 overflow-hidden border-indigo-200/50 bg-gradient-to-r from-indigo-50/50 to-violet-50/30 dark:border-indigo-900/50 dark:from-indigo-950/20 dark:to-violet-950/10">
          <CardContent className="p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Team Completion Rate</span>
              <span className="text-2xl font-bold text-indigo-600">{completionRate}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {completedTasks} of {totalTasks} tasks completed across the team
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="col-span-full text-center text-muted-foreground py-8">Loading team data...</p>
          ) : team.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground py-8">No team data</p>
          ) : (
            team.map((member) => {
              const rate =
                member.assignedTasks > 0
                  ? Math.round((member.completedTasks / member.assignedTasks) * 100)
                  : 0;
              const gradient = ROLE_COLORS[member.role] ?? ROLE_COLORS.default;

              return (
                <Card key={member.id} className="overflow-hidden transition-all hover:shadow-md">
                  <div className={cn("h-1 bg-gradient-to-r", gradient)} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{member.name}</CardTitle>
                        <p className="text-xs capitalize text-muted-foreground">
                          {member.role.toLowerCase().replace(/_/g, " ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-indigo-600">{rate}%</p>
                        <p className="text-[10px] text-muted-foreground">completion</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={cn("h-full rounded-full bg-gradient-to-r transition-all", gradient)}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-900">
                        <p className="text-lg font-bold">{member.assignedTasks}</p>
                        <p className="text-[10px] text-muted-foreground">Assigned</p>
                      </div>
                      <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/30">
                        <p className="text-lg font-bold text-emerald-600">{member.completedTasks}</p>
                        <p className="text-[10px] text-muted-foreground">Done</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-900">
                        <p className="text-lg font-bold">{member.totalHours}h</p>
                        <p className="text-[10px] text-muted-foreground">Hours</p>
                      </div>
                    </div>
                    <p className="text-center text-xs text-muted-foreground">
                      {member.projects} active project{member.projects !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
