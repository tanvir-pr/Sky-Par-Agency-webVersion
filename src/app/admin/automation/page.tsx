"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AdminHeader } from "@/components/admin/header";
import { ToolsNav } from "@/components/admin/tools/tools-nav";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ZapOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  createdAt: string;
}

const columns: Column<AutomationRule>[] = [
  { key: "name", header: "Rule", cell: (r) => <span className="font-medium">{r.name}</span> },
  { key: "trigger", header: "Trigger", cell: (r) => <Badge variant="outline">{r.trigger.replace(/_/g, " ")}</Badge> },
  { key: "action", header: "Action", cell: (r) => <Badge variant="secondary">{r.action.replace(/_/g, " ")}</Badge> },
  {
    key: "active",
    header: "Status",
    cell: (r) => (
      <Badge variant="outline" className={cn(r.active ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : "bg-slate-100 text-slate-600")}>
        {r.active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/admin/automation").then((res) => {
      setRules(res.data.rules ?? []);
      setActiveCount(res.data.activeCount ?? 0);
      setTotalCount(res.data.totalCount ?? 0);
    }).catch(() => setRules([])).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader title="Automation" description="Manage automation rules and workflows" />
      <div className="flex-1 overflow-y-auto p-6">
        <ToolsNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="amber" title="Active Rules" value={loading ? "—" : activeCount} icon={Zap} />
          <StatCard accent="indigo" title="Total Rules" value={loading ? "—" : totalCount} icon={Zap} />
          <StatCard accent="rose" title="Inactive" value={loading ? "—" : totalCount - activeCount} icon={ZapOff} />
        </div>
        <Card className="overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle>Automation Rules</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable columns={columns} data={rules} loading={loading} getRowKey={(r) => r.id} className="border-0" emptyMessage="No automation rules configured" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
