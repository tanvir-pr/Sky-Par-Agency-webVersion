"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  ArrowRight,
  Bot,
  CreditCard,
  DollarSign,
  FileText,
  Receipt,
  ScrollText,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { FinanceNav } from "@/components/admin/finance/finance-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/finance-status";
import { cn } from "@/lib/utils";

const FINANCE_CARDS = [
  {
    href: "/admin/finance/invoices",
    title: "Invoices",
    description: "Create, send and track client invoices",
    icon: FileText,
    accent: "indigo" as const,
    gradient: "from-indigo-500/10 to-violet-500/5",
  },
  {
    href: "/admin/finance/payments",
    title: "Payments",
    description: "All payment transactions and status",
    icon: CreditCard,
    accent: "emerald" as const,
    gradient: "from-emerald-500/10 to-teal-500/5",
  },
  {
    href: "/admin/finance/expenses",
    title: "Expenses",
    description: "Agency costs by category",
    icon: Receipt,
    accent: "rose" as const,
    gradient: "from-rose-500/10 to-pink-500/5",
  },
  {
    href: "/admin/finance/revenue",
    title: "Revenue",
    description: "Financial performance & charts",
    icon: TrendingUp,
    accent: "emerald" as const,
    gradient: "from-emerald-500/10 to-green-500/5",
  },
  {
    href: "/admin/finance/ai-costs",
    title: "AI Costs",
    description: "API and AI tool spending",
    icon: Bot,
    accent: "violet" as const,
    gradient: "from-violet-500/10 to-purple-500/5",
  },
  {
    href: "/admin/proposals",
    title: "Proposals",
    description: "Client proposals and quotes",
    icon: ScrollText,
    accent: "sky" as const,
    gradient: "from-sky-500/10 to-blue-500/5",
  },
];

interface FinanceOverview {
  totalRevenue: number;
  totalInvoiced: number;
  outstanding: number;
  invoiceCount: number;
  paymentCount: number;
  expenseTotal: number;
}

export default function FinanceHubPage() {
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/revenue"),
      axios.get("/api/invoices", { params: { limit: "100" } }),
      axios.get("/api/payments", { params: { limit: "100" } }),
      axios.get("/api/expenses", { params: { limit: "100" } }),
    ])
      .then(([rev, inv, pay, exp]) => {
        const expenses = exp.data.expenses ?? [];
        setOverview({
          totalRevenue: rev.data.totalRevenue ?? 0,
          totalInvoiced: rev.data.totalInvoiced ?? 0,
          outstanding: rev.data.outstanding ?? 0,
          invoiceCount: inv.data.invoices?.length ?? 0,
          paymentCount: pay.data.payments?.length ?? 0,
          expenseTotal: expenses.reduce((s: number, e: { amount: number }) => s + e.amount, 0),
        });
      })
      .catch(() => setOverview(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader
        title="Finance"
        description="Invoices, payments, expenses and revenue at a glance"
      />
      <div className="flex-1 overflow-y-auto p-6">
        <FinanceNav />

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            accent="emerald"
            title="Total Revenue"
            value={loading ? "—" : formatCurrency(overview?.totalRevenue ?? 0)}
            description="Completed payments"
            icon={DollarSign}
          />
          <StatCard
            accent="indigo"
            title="Total Invoiced"
            value={loading ? "—" : formatCurrency(overview?.totalInvoiced ?? 0)}
            description={`${overview?.invoiceCount ?? 0} invoices`}
            icon={FileText}
          />
          <StatCard
            accent="amber"
            title="Outstanding"
            value={loading ? "—" : formatCurrency(overview?.outstanding ?? 0)}
            description="Unpaid invoices"
            icon={TrendingUp}
          />
          <StatCard
            accent="rose"
            title="Total Expenses"
            value={loading ? "—" : formatCurrency(overview?.expenseTotal ?? 0)}
            description={`${overview?.paymentCount ?? 0} payments`}
            icon={Receipt}
          />
        </div>

        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Finance Modules
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FINANCE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card
                  className={cn(
                    "group h-full overflow-hidden border-slate-200/80 transition-all hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 dark:border-slate-800 dark:hover:border-emerald-700",
                    `bg-gradient-to-br ${card.gradient}`
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
                        <Icon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                    </div>
                    <CardTitle className="mt-3 text-lg">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          <Link href="/admin/contracts">
            <Card className="group h-full overflow-hidden border-slate-200/80 bg-gradient-to-br from-slate-500/10 to-slate-500/5 transition-all hover:border-emerald-300 hover:shadow-lg dark:border-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                </div>
                <CardTitle className="mt-3 text-lg">Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Client contracts and agreements</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </>
  );
}
