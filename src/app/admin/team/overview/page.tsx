"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  ArrowRight,
  Briefcase,
  Clock,
  Shield,
  UserCircle,
  Users,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { TeamNav } from "@/components/admin/team/team-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TEAM_CARDS = [
  {
    href: "/admin/users/employees",
    title: "Employees",
    description: "Manage team members and roles",
    icon: UserCircle,
    gradient: "from-sky-500/10 to-blue-500/5",
  },
  {
    href: "/admin/users/roles",
    title: "Roles & Permissions",
    description: "Access control and RBAC",
    icon: Shield,
    gradient: "from-indigo-500/10 to-violet-500/5",
  },
  {
    href: "/admin/team/attendance",
    title: "Attendance",
    description: "Daily presence and check-ins",
    icon: Users,
    gradient: "from-emerald-500/10 to-teal-500/5",
  },
  {
    href: "/admin/team/time-tracking",
    title: "Time Tracking",
    description: "Hours logged on tasks",
    icon: Clock,
    gradient: "from-violet-500/10 to-purple-500/5",
  },
  {
    href: "/admin/my-work",
    title: "My Work",
    description: "Your tasks and notifications",
    icon: Briefcase,
    gradient: "from-amber-500/10 to-orange-500/5",
  },
];

interface TeamOverview {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  currentlyWorking: number;
  totalHours: number;
}

export default function TeamOverviewPage() {
  const [overview, setOverview] = useState<TeamOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/users", { params: { type: "employees" } }),
      axios.get("/api/admin/attendance"),
      axios.get("/api/admin/time-tracking"),
    ])
      .then(([users, attendance, time]) => {
        const employees = users.data.users ?? [];
        const att = attendance.data.attendance ?? [];
        const entries = time.data.entries ?? [];
        const totalSeconds = entries.reduce(
          (s: number, e: { duration: number | null }) => s + (e.duration ?? 0),
          0
        );
        setOverview({
          totalEmployees: employees.length,
          activeEmployees: employees.filter((e: { status: string }) => e.status === "ACTIVE").length,
          presentToday: att.filter((a: { checkedIn: boolean }) => a.checkedIn).length,
          currentlyWorking: att.filter((a: { isWorking: boolean }) => a.isWorking).length,
          totalHours: Math.round(totalSeconds / 3600),
        });
      })
      .catch(() => setOverview(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader
        title="Team"
        description="People, attendance, time tracking and productivity"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <TeamNav />

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            accent="sky"
            title="Team Members"
            value={loading ? "—" : overview?.totalEmployees ?? 0}
            description={`${overview?.activeEmployees ?? 0} active`}
            icon={Users}
          />
          <StatCard
            accent="emerald"
            title="Present Today"
            value={loading ? "—" : `${overview?.presentToday ?? 0}/${overview?.totalEmployees ?? 0}`}
            description="Checked in"
            icon={UserCircle}
          />
          <StatCard
            accent="violet"
            title="Working Now"
            value={loading ? "—" : overview?.currentlyWorking ?? 0}
            description="Active sessions"
            icon={Clock}
          />
          <StatCard
            accent="indigo"
            title="Hours Logged"
            value={loading ? "—" : `${overview?.totalHours ?? 0}h`}
            description="Recent entries"
            icon={Briefcase}
          />
        </div>

        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Team Modules
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card
                  className={cn(
                    "group h-full overflow-hidden border-slate-200/80 transition-all hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/10 dark:border-slate-800 dark:hover:border-sky-700",
                    `bg-gradient-to-br ${card.gradient}`
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
                        <Icon className="h-5 w-5 text-sky-600" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-sky-600" />
                    </div>
                    <CardTitle className="mt-3 text-lg">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
