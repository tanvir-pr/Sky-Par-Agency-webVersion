"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FileSearch } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { SuperAdminNav } from "@/components/admin/super-admin/super-admin-nav";
import { StatCard } from "@/components/admin/stat-card";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface AuditLog {
  id: string;
  type: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  ip: string | null;
  createdAt: string;
  user: { name: string; email: string; role: string } | null;
}

const typeColors: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-purple-100 text-purple-700",
  LOGOUT: "bg-slate-100 text-slate-700",
  STATUS_CHANGE: "bg-amber-100 text-amber-700",
  PAYMENT: "bg-green-100 text-green-700",
};

const columns: Column<AuditLog>[] = [
  {
    key: "type",
    header: "Type",
    cell: (l) => (
      <Badge variant="outline" className={typeColors[l.type] || ""}>
        {l.type.replace(/_/g, " ")}
      </Badge>
    ),
  },
  { key: "action", header: "Action", cell: (l) => l.action },
  {
    key: "user",
    header: "User",
    cell: (l) => (
      l.user ? (
        <div>
          <p className="font-medium">{l.user.name}</p>
          <p className="text-xs text-muted-foreground">{l.user.role}</p>
        </div>
      ) : "—"
    ),
  },
  {
    key: "entity",
    header: "Entity",
    cell: (l) => l.entityType ?? "—",
  },
  { key: "ip", header: "IP", cell: (l) => l.ip ?? "—" },
  { key: "createdAt", header: "Time", cell: (l) => formatDate(l.createdAt) },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [byType, setByType] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/super-admin/audit")
      .then((res) => {
        setLogs(res.data.logs);
        setByType(res.data.byType);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader title="Audit Logs" description="Complete audit trail of all system actions" />
      <div className="flex-1 overflow-y-auto p-6">
        <SuperAdminNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <StatCard accent="rose" title="Audit Entries" value={loading ? "—" : logs.length} icon={FileSearch} />
          <StatCard accent="amber" title="Event Types" value={loading ? "—" : Object.keys(byType).length} icon={FileSearch} />
        </div>
        {Object.keys(byType).length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            {Object.entries(byType).map(([type, count]) => (
              <Badge key={type} variant="outline" className={typeColors[type] || ""}>
                {type.replace(/_/g, " ")}: {count}
              </Badge>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Audit Trail ({logs.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={logs}
              loading={loading}
              getRowKey={(l) => l.id}
              className="border-0"
              emptyMessage="No audit logs"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
