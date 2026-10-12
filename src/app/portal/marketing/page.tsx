"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PortalHeader } from "@/components/portal/portal-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface MarketingReport {
  id: string;
  type: string;
  period: string;
  data: Record<string, unknown>;
  createdAt: string;
}

export default function PortalMarketingPage() {
  const [reports, setReports] = useState<MarketingReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/portal/marketing")
      .then((res) => setReports(res.data.reports))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PortalHeader title="Marketing Reports" description="Performance reports for your campaigns" />
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <p className="text-muted-foreground">Loading reports...</p>
        ) : reports.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle className="text-lg capitalize">
                    {report.type.replace(/_/g, " ")} Report
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {report.period} · Generated {formatDate(report.createdAt)}
                  </p>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {Object.entries(report.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <dt className="capitalize text-muted-foreground">
                          {key.replace(/_/g, " ")}
                        </dt>
                        <dd className="font-medium">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No marketing reports available yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
