"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { toast } from "sonner";
import { DollarSign, TrendingUp, Receipt } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { FinanceNav } from "@/components/admin/finance/finance-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RevenueChart = dynamic(
  () => import("@/components/admin/revenue-chart").then((mod) => mod.RevenueChart),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading chart...
      </div>
    ),
  }
);

interface RevenueData {
  totalRevenue: number;
  totalInvoiced: number;
  outstanding: number;
  monthly: { month: string; revenue: number; invoiced: number }[];
  byService: { name: string; revenue: number }[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/revenue")
      .then((res) => setData(res.data))
      .catch(() => {
        toast.error("Failed to load revenue data");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader title="Revenue" description="Financial performance overview" />
      <div className="flex-1 overflow-y-auto p-6">
        <FinanceNav />

        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title="Total Revenue"
            value={loading ? "—" : formatCurrency(data?.totalRevenue ?? 0)}
            description="Completed payments"
            icon={DollarSign}
            accent="emerald"
          />
          <StatCard
            title="Total Invoiced"
            value={loading ? "—" : formatCurrency(data?.totalInvoiced ?? 0)}
            description="All sent invoices"
            icon={Receipt}
            accent="indigo"
          />
          <StatCard
            title="Outstanding"
            value={loading ? "—" : formatCurrency(data?.outstanding ?? 0)}
            description="Unpaid invoices"
            icon={TrendingUp}
            accent="amber"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {data?.monthly && data.monthly.length > 0 ? (
                  <RevenueChart data={data.monthly} />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {loading ? "Loading..." : "No revenue data yet"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Service</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-72 items-center justify-center text-muted-foreground">
                  Loading...
                </div>
              ) : data?.byService && data.byService.length > 0 ? (
                <div className="space-y-4">
                  {data.byService.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-72 items-center justify-center text-muted-foreground">
                  No service breakdown yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
