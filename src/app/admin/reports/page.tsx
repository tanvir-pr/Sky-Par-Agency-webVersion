"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  ArrowRight,
  BarChart3,
  DollarSign,
  Megaphone,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { ReportNav } from "@/components/admin/reports/report-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const REPORT_CARDS = [
  {
    href: "/admin/reports/revenue",
    title: "Revenue Reports",
    description: "Financial performance, profit & expenses",
    icon: DollarSign,
    accent: "emerald" as const,
    gradient: "from-emerald-500/10 to-teal-500/5",
  },
  {
    href: "/admin/reports/clients",
    title: "Client Reports",
    description: "Client activity, revenue & retention",
    icon: Users,
    accent: "indigo" as const,
    gradient: "from-indigo-500/10 to-violet-500/5",
  },
  {
    href: "/admin/reports/services",
    title: "Service Reports",
    description: "Subscriptions & package performance",
    icon: Wrench,
    accent: "sky" as const,
    gradient: "from-sky-500/10 to-blue-500/5",
  },
  {
    href: "/admin/reports/team",
    title: "Team Reports",
    description: "Productivity, tasks & hours logged",
    icon: Users,
    accent: "violet" as const,
    gradient: "from-violet-500/10 to-purple-500/5",
  },
  {
    href: "/admin/reports/marketing",
    title: "Marketing Reports",
    description: "SEO, ads & social media analytics",
    icon: Megaphone,
    accent: "amber" as const,
    gradient: "from-amber-500/10 to-orange-500/5",
  },
];

interface OverviewData {
  totalRevenue: number;
  totalClients: number;
  activeSubscriptions: number;
  teamMembers: number;
}

export default function ReportsHubPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/admin/reports/revenue"),
      axios.get("/api/admin/reports/clients"),
      axios.get("/api/admin/reports/services"),
      axios.get("/api/admin/reports/team"),
    ])
      .then(([rev, clients, services, team]) => {
        setOverview({
          totalRevenue: rev.data.totalRevenue ?? 0,
          totalClients: clients.data.totalClients ?? 0,
          activeSubscriptions: services.data.activeSubscriptions ?? 0,
          teamMembers: team.data.team?.length ?? 0,
        });
      })
      .catch(() => setOverview(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader
        title="Reports & Analytics"
        description="Business intelligence across revenue, clients, services and team"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <ReportNav />

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            accent="emerald"
            title="Total Revenue"
            value={loading ? "—" : `$${(overview?.totalRevenue ?? 0).toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            accent="indigo"
            title="Total Clients"
            value={loading ? "—" : overview?.totalClients ?? 0}
            icon={Users}
          />
          <StatCard
            accent="sky"
            title="Active Subscriptions"
            value={loading ? "—" : overview?.activeSubscriptions ?? 0}
            icon={TrendingUp}
          />
          <StatCard
            accent="violet"
            title="Team Members"
            value={loading ? "—" : overview?.teamMembers ?? 0}
            icon={BarChart3}
          />
        </div>

        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Report Modules
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card
                  className={cn(
                    "group h-full overflow-hidden border-slate-200/80 transition-all hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-slate-800 dark:hover:border-indigo-700",
                    `bg-gradient-to-br ${card.gradient}`
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
                        <Icon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-indigo-600" />
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
