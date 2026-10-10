"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminHeader } from "@/components/admin/header";
import { ReportNav } from "@/components/admin/reports/report-nav";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { StatCard } from "@/components/admin/stat-card";
import { DollarSign, Receipt, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  paidInvoices: number;
  invoiceCount: number;
  revenueByMonth: Array<{ month: string; amount: number }>;
  expensesByCategory: Record<string, number>;
}

const EXPENSE_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#f43f5e"];

export default function RevenueReportsPage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/admin/reports/revenue")
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const expenseChart = data
    ? Object.entries(data.expensesByCategory).map(([name, value]) => ({
        name: name.replace(/_/g, " "),
        value,
      }))
    : [];

  const profitMargin =
    data && data.totalRevenue > 0
      ? Math.round((data.netProfit / data.totalRevenue) * 100)
      : 0;

  return (
    <>
      <AdminHeader title="Revenue Reports" description="Financial performance and revenue trends" />
      <div className="flex-1 overflow-y-auto p-6">
        <ReportNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            accent="emerald"
            title="Total Revenue"
            value={loading ? "—" : `$${(data?.totalRevenue ?? 0).toLocaleString()}`}
            icon={DollarSign}
          />
          <StatCard
            accent="rose"
            title="Total Expenses"
            value={loading ? "—" : `$${(data?.totalExpenses ?? 0).toLocaleString()}`}
            icon={TrendingDown}
          />
          <StatCard
            accent="indigo"
            title="Net Profit"
            value={loading ? "—" : `$${(data?.netProfit ?? 0).toLocaleString()}`}
            description={data ? `${profitMargin}% margin` : undefined}
            trend={profitMargin > 0 ? `${profitMargin}% margin` : undefined}
            trendDirection={data && data.netProfit >= 0 ? "up" : "down"}
            icon={TrendingUp}
          />
          <StatCard
            accent="sky"
            title="Paid Invoices"
            value={loading ? "—" : `${data?.paidInvoices ?? 0} / ${data?.invoiceCount ?? 0}`}
            icon={Receipt}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent className="h-72 p-4">
              {data?.revenueByMonth.length ? (
                <RevenueChart data={data.revenueByMonth} />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  {loading ? "Loading..." : "No revenue data yet"}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-72 p-4">
              {expenseChart.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseChart}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {expenseChart.map((_, i) => (
                        <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  {loading ? "Loading..." : "No expense data"}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {expenseChart.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `$${v}`} className="text-xs" />
                  <YAxis type="category" dataKey="name" width={100} className="text-xs capitalize" />
                  <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Amount"]} />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
