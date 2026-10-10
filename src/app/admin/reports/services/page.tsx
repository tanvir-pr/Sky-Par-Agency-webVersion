"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminHeader } from "@/components/admin/header";
import { ReportNav } from "@/components/admin/reports/report-nav";
import { StatCard } from "@/components/admin/stat-card";
import { ShoppingCart, Wrench, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PackageStat {
  id: string;
  name: string;
  category: string;
  subscriptions: number;
  orders: number;
}

export default function ServiceReportsPage() {
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [packageStats, setPackageStats] = useState<PackageStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/reports/services")
      .then((res) => {
        setActiveSubscriptions(res.data.activeSubscriptions);
        setPackageStats(res.data.packageStats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalOrders = packageStats.reduce((s, p) => s + p.orders, 0);
  const totalSubs = packageStats.reduce((s, p) => s + p.subscriptions, 0);
  const topPackages = [...packageStats]
    .sort((a, b) => b.orders + b.subscriptions - (a.orders + a.subscriptions))
    .slice(0, 8)
    .map((p) => ({
      name: p.name.slice(0, 14),
      orders: p.orders,
      subscriptions: p.subscriptions,
    }));

  const categoryStats = packageStats.reduce<Record<string, { orders: number; subs: number }>>(
    (acc, p) => {
      if (!acc[p.category]) acc[p.category] = { orders: 0, subs: 0 };
      acc[p.category].orders += p.orders;
      acc[p.category].subs += p.subscriptions;
      return acc;
    },
    {}
  );

  const categoryChart = Object.entries(categoryStats).map(([name, v]) => ({
    name: name.slice(0, 12),
    orders: v.orders,
    subscriptions: v.subs,
  }));

  return (
    <>
      <AdminHeader title="Service Reports" description="Subscription and order analytics by service" />
      <div className="flex-1 overflow-y-auto p-6">
        <ReportNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            accent="sky"
            title="Active Subscriptions"
            value={loading ? "—" : activeSubscriptions}
            icon={Wrench}
          />
          <StatCard
            accent="indigo"
            title="Total Packages"
            value={loading ? "—" : packageStats.length}
            icon={Zap}
          />
          <StatCard
            accent="violet"
            title="Total Orders"
            value={loading ? "—" : totalOrders}
            description={`${totalSubs} subscriptions`}
            icon={ShoppingCart}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle>Top Packages</CardTitle>
            </CardHeader>
            <CardContent className="h-72 p-4">
              {topPackages.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topPackages}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="orders" name="Orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="subscriptions" name="Subscriptions" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  {loading ? "Loading..." : "No package data"}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle>By Category</CardTitle>
            </CardHeader>
            <CardContent className="h-72 p-4">
              {categoryChart.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChart} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                    <XAxis type="number" className="text-xs" />
                    <YAxis type="category" dataKey="name" width={90} className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" name="Orders" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="subscriptions" name="Subs" fill="#c4b5fd" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  {loading ? "Loading..." : "No category data"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {packageStats.map((pkg) => {
            const total = pkg.orders + pkg.subscriptions;
            const maxTotal = Math.max(...packageStats.map((p) => p.orders + p.subscriptions), 1);
            const pct = Math.round((total / maxTotal) * 100);
            return (
              <Card key={pkg.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium leading-tight">{pkg.name}</p>
                      <p className="text-xs text-muted-foreground">{pkg.category}</p>
                    </div>
                    <span className="text-lg font-bold text-indigo-600">{total}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>{pkg.orders} orders</span>
                    <span>{pkg.subscriptions} subs</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
