"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AdminHeader } from "@/components/admin/header";
import { SuperAdminNav } from "@/components/admin/super-admin/super-admin-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SecurityChecks {
  stripeConfigured: boolean;
  openaiConfigured: boolean;
  smtpConfigured: boolean;
  pusherConfigured: boolean;
  s3Configured: boolean;
  jwtSecretFromEnv: boolean;
}

interface LoginRecord {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { name: string; email: string; role: string };
}

export default function SecurityPage() {
  const [checks, setChecks] = useState<SecurityChecks | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);
  const [suspendedUsers, setSuspendedUsers] = useState<Array<{ name: string; email: string; role: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/super-admin/security")
      .then((res) => {
        setChecks(res.data.securityChecks);
        setLoginHistory(res.data.loginHistory);
        setSuspendedUsers(res.data.suspendedUsers);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const checkItems = checks
    ? [
        { label: "JWT Secret", ok: checks.jwtSecretFromEnv },
        { label: "Stripe", ok: checks.stripeConfigured },
        { label: "OpenAI", ok: checks.openaiConfigured },
        { label: "SMTP", ok: checks.smtpConfigured },
        { label: "Pusher", ok: checks.pusherConfigured },
        { label: "S3 Storage", ok: checks.s3Configured },
      ]
    : [];

  return (
    <>
      <AdminHeader title="Security" description="Security configuration and login monitoring" />
      <div className="flex-1 overflow-y-auto p-6">
        <SuperAdminNav />
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="rose" title="Security Checks" value={loading ? "—" : `${checkItems.filter((c) => c.ok).length}/${checkItems.length}`} icon={Shield} />
          <StatCard accent="sky" title="Recent Logins" value={loading ? "—" : loginHistory.length} icon={Shield} />
          <StatCard accent="amber" title="Suspended Accounts" value={loading ? "—" : suspendedUsers.length} icon={Shield} />
        </div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                {checkItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-lg border p-3">
                    {item.ok ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.ok ? "Configured" : "Not configured"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Logins</CardTitle>
            </CardHeader>
            <CardContent>
              {loginHistory.length ? (
                <ul className="space-y-3">
                  {loginHistory.slice(0, 20).map((log) => (
                    <li key={log.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{log.user.name}</p>
                        <Badge variant="outline">{log.user.role}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {log.user.email} · {formatDate(log.createdAt)}
                      </p>
                      {log.ip && <p className="text-xs text-muted-foreground">IP: {log.ip}</p>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">{loading ? "Loading..." : "No login history"}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suspended Accounts ({suspendedUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {suspendedUsers.length ? (
                <ul className="space-y-3">
                  {suspendedUsers.map((user) => (
                    <li key={user.email} className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-900 dark:bg-red-950/20">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email} · {user.role}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No suspended accounts</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
