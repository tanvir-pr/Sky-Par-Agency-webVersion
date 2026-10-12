"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PortalHeader } from "@/components/portal/portal-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface Subscription {
  id: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  monthlyFee: number | null;
  package: {
    name: string;
    price: string;
    deliveryTime: string;
    features: string[];
    category: { name: string } | null;
  };
  assignedTo: { name: string } | null;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const columns: Column<Subscription>[] = [
  {
    key: "package",
    header: "Service",
    cell: (s) => (
      <div>
        <p className="font-medium">{s.package.name}</p>
        <p className="text-xs text-muted-foreground">{s.package.category?.name}</p>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    cell: (s) => (
      <Badge variant="outline" className={statusColors[s.status] || ""}>
        {s.status}
      </Badge>
    ),
  },
  {
    key: "startDate",
    header: "Started",
    cell: (s) => (s.startDate ? formatDate(s.startDate) : "—"),
  },
  {
    key: "assignedTo",
    header: "Account Manager",
    cell: (s) => s.assignedTo?.name ?? "—",
  },
];

export default function PortalServicesPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/portal/services")
      .then((res) => setSubscriptions(res.data.subscriptions))
      .catch(() => setSubscriptions([]))
      .finally(() => setLoading(false));
  }, []);

  const active = subscriptions.filter((s) => s.status === "ACTIVE");

  return (
    <>
      <PortalHeader
        title="Services & Subscriptions"
        description="Your active services and subscription plans"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              <p className="text-2xl font-bold">{active.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Services</p>
              <p className="text-2xl font-bold">{subscriptions.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={subscriptions}
              loading={loading}
              getRowKey={(s) => s.id}
              className="border-0"
              emptyMessage="No subscriptions yet"
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
