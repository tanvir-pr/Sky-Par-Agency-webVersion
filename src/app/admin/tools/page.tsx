"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  ArrowRight,
  Bot,
  Calendar,
  FileText,
  MessageSquare,
  Wrench,
  Zap,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { ToolsNav } from "@/components/admin/tools/tools-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TOOL_CARDS = [
  { href: "/admin/files", title: "Files", description: "Client and project file library", icon: FileText, gradient: "from-orange-500/10 to-amber-500/5" },
  { href: "/admin/messages", title: "Messages", description: "Team chat and conversations", icon: MessageSquare, gradient: "from-blue-500/10 to-sky-500/5" },
  { href: "/admin/calendar", title: "Calendar", description: "Meetings and scheduled events", icon: Calendar, gradient: "from-violet-500/10 to-purple-500/5" },
  { href: "/admin/automation", title: "Automation", description: "Workflow rules and triggers", icon: Zap, gradient: "from-amber-500/10 to-yellow-500/5" },
  { href: "/admin/ai-tools", title: "AI Tools", description: "AI usage, proposals and costs", icon: Bot, gradient: "from-pink-500/10 to-rose-500/5" },
];

export default function ToolsHubPage() {
  const [stats, setStats] = useState({ files: 0, messages: 0, meetings: 0, rules: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/admin/files"),
      axios.get("/api/admin/messages"),
      axios.get("/api/admin/calendar"),
      axios.get("/api/admin/automation"),
    ])
      .then(([files, messages, calendar, automation]) => {
        setStats({
          files: (files.data.clientFiles?.length ?? 0) + (files.data.projectFiles?.length ?? 0),
          messages: messages.data.threads?.length ?? 0,
          meetings: calendar.data.meetings?.length ?? 0,
          rules: automation.data.totalCount ?? 0,
        });
      })
      .catch(() => setStats({ files: 0, messages: 0, meetings: 0, rules: 0 }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader title="Tools" description="Files, messages, calendar, automation and AI" />
      <div className="flex-1 overflow-y-auto p-6">
        <ToolsNav />
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="amber" title="Total Files" value={loading ? "—" : stats.files} icon={FileText} />
          <StatCard accent="sky" title="Conversations" value={loading ? "—" : stats.messages} icon={MessageSquare} />
          <StatCard accent="violet" title="Meetings" value={loading ? "—" : stats.meetings} icon={Calendar} />
          <StatCard accent="indigo" title="Automation Rules" value={loading ? "—" : stats.rules} icon={Zap} />
        </div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tool Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOL_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className={cn("group h-full overflow-hidden border-slate-200/80 transition-all hover:border-orange-300 hover:shadow-lg dark:border-slate-800", `bg-gradient-to-br ${card.gradient}`)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
                        <Icon className="h-5 w-5 text-orange-600" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-orange-600" />
                    </div>
                    <CardTitle className="mt-3 text-lg">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{card.description}</p></CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
