"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AdminHeader } from "@/components/admin/header";
import { SuperAdminNav } from "@/components/admin/super-admin/super-admin-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Users, Building2, FolderKanban, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface ActivityLog {
  id: string;
  type: string;
  action: string;
  entityType: string | null;
  createdAt: string;
  user: { name: string } | null;
}

export default function SuperAdminPage() {
  const [stats, setStats] = useState({ userCount: 0, clientCount: 0, projectCount: 0, activeRules: 0 });
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/super-admin")
      .then((res) => {
        setStats(res.data.stats);
        setRecentActivity(res.data.recentActivity);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader title="Super Admin" description="System overview and administration" />
      <div className="flex-1 overflow-y-auto p-6">
        <SuperAdminNav />
        <div className="grid gap-6 md:grid-cols-4">
          <StatCard accent="rose" title="Active Users" value={loading ? "—" : stats.userCount} icon={Users} />
          <StatCard accent="sky" title="Clients" value={loading ? "—" : stats.clientCount} icon={Building2} />
          <StatCard accent="violet" title="Projects" value={loading ? "—" : stats.projectCount} icon={FolderKanban} />
          <StatCard accent="amber" title="Active Automations" value={loading ? "—" : stats.activeRules} icon={Zap} />
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length ? (
              <ul className="space-y-3">
                {recentActivity.map((log) => (
                  <li key={log.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-muted-foreground">
                        {log.user?.name ?? "System"} · {log.type}
                        {log.entityType && ` · ${log.entityType}`}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">{loading ? "Loading..." : "No recent activity"}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
