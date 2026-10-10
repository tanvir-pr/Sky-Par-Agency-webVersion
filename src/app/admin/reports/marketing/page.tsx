"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AdminHeader } from "@/components/admin/header";
import { ReportNav } from "@/components/admin/reports/report-nav";
import { StatCard } from "@/components/admin/stat-card";
import { BarChart3, FileText, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";

interface MarketingReport {
  id: string;
  type: string;
  period: string;
  data: Record<string, unknown>;
  createdAt: string;
  client: { name: string; company: string | null };
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  SEO: { label: "SEO", color: "text-emerald-700", bg: "bg-emerald-500/10 border-emerald-500/30" },
  SOCIAL_MEDIA: { label: "Social Media", color: "text-sky-700", bg: "bg-sky-500/10 border-sky-500/30" },
  GOOGLE_ADS: { label: "Google Ads", color: "text-amber-700", bg: "bg-amber-500/10 border-amber-500/30" },
  FACEBOOK_ADS: { label: "Facebook Ads", color: "text-indigo-700", bg: "bg-indigo-500/10 border-indigo-500/30" },
  ANALYTICS: { label: "Analytics", color: "text-violet-700", bg: "bg-violet-500/10 border-violet-500/30" },
};

export default function MarketingReportsPage() {
  const [reports, setReports] = useState<MarketingReport[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [byType, setByType] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/reports/marketing")
      .then((res) => {
        setReports(res.data.reports);
        setTotalReports(res.data.totalReports);
        setByType(res.data.byType);
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  const typeCount = Object.keys(byType).length;

  return (
    <>
      <AdminHeader title="Marketing Reports" description="Client marketing performance reports" />
      <div className="flex-1 overflow-y-auto p-6">
        <ReportNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard accent="amber" title="Total Reports" value={loading ? "—" : totalReports} icon={BarChart3} />
          <StatCard accent="indigo" title="Report Types" value={loading ? "—" : typeCount} icon={FileText} />
          <StatCard
            accent="sky"
            title="Clients Covered"
            value={loading ? "—" : new Set(reports.map((r) => r.client.name)).size}
            icon={Megaphone}
          />
        </div>

        {Object.keys(byType).length > 0 && (
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(byType).map(([type, count]) => {
              const cfg = TYPE_CONFIG[type] ?? {
                label: type.replace(/_/g, " "),
                color: "text-slate-700",
                bg: "bg-slate-500/10 border-slate-500/30",
              };
              return (
                <Card key={type} className={cn("border", cfg.bg)}>
                  <CardContent className="p-4">
                    <p className={cn("text-xs font-medium capitalize", cfg.color)}>
                      {cfg.label}
                    </p>
                    <p className="mt-1 text-3xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">reports</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">Loading...</div>
        ) : reports.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((report) => {
              const cfg = TYPE_CONFIG[report.type] ?? {
                label: report.type.replace(/_/g, " "),
                color: "text-slate-700",
                bg: "bg-slate-500/10 border-slate-500/30",
              };
              return (
                <Card key={report.id} className="overflow-hidden transition-all hover:shadow-md">
                  <div className={cn("h-1 bg-gradient-to-r", cfg.bg.replace("/10", ""))} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base capitalize">{cfg.label}</CardTitle>
                        <p className="text-sm font-medium text-indigo-600">
                          {report.client.company || report.client.name}
                        </p>
                      </div>
                      <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", cfg.bg, cfg.color)}>
                        {report.period}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(report.createdAt)}</p>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-2 gap-2">
                      {Object.entries(report.data).map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-lg bg-slate-50 p-2 dark:bg-slate-900"
                        >
                          <dt className="text-[10px] capitalize text-muted-foreground">
                            {key.replace(/_/g, " ")}
                          </dt>
                          <dd className="text-sm font-semibold">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Megaphone className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="font-medium text-muted-foreground">No marketing reports yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Reports will appear here once clients have marketing data
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
