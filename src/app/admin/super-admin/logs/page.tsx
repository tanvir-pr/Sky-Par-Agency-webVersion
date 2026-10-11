"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ScrollText } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { SuperAdminNav } from "@/components/admin/super-admin/super-admin-nav";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface SystemLog {
  id: string;
  type: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
}

const columns: Column<SystemLog>[] = [
  {
    key: "action",
    header: "Action",
    cell: (l) => l.action,
  },
  {
    key: "type",
    header: "Type",
    cell: (l) => l.type,
  },
  {
    key: "user",
    header: "User",
    cell: (l) => l.user?.name ?? "System",
  },
  {
    key: "entity",
    header: "Entity",
    cell: (l) => (l.entityType ? `${l.entityType}${l.entityId ? ` #${l.entityId.slice(0, 8)}` : ""}` : "—"),
  },
  {
    key: "createdAt",
    header: "Time",
    cell: (l) => formatDate(l.createdAt),
  },
];

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/super-admin/logs")
      .then((res) => setLogs(res.data.systemLogs))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader title="System Logs" description="System-level activity and events" />
      <div className="flex-1 overflow-y-auto p-6">
        <SuperAdminNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <StatCard accent="rose" title="System Logs" value={loading ? "—" : logs.length} icon={ScrollText} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>System Logs ({logs.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={logs}
              loading={loading}
              getRowKey={(l) => l.id}
              className="border-0"
              emptyMessage="No system logs"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
