"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { CheckCircle2, Clock, CreditCard, Search, XCircle } from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { FinanceNav } from "@/components/admin/finance/finance-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_CONFIG,
  formatCurrency,
  formatPaymentStatus,
  type PaymentStatus,
} from "@/lib/finance-status";
import { cn, formatDate } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  reference: string | null;
  createdAt: string;
  invoice: { id: string; invoiceNumber: string };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await axios.get("/api/payments", { params });
      setPayments(res.data.payments ?? []);
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const filtered = useMemo(() => {
    if (!search.trim()) return payments;
    const q = search.toLowerCase();
    return payments.filter(
      (p) =>
        p.invoice.invoiceNumber.toLowerCase().includes(q) ||
        p.reference?.toLowerCase().includes(q) ||
        p.method.toLowerCase().includes(q)
    );
  }, [payments, search]);

  const stats = useMemo(() => {
    const completed = payments.filter((p) => p.status === "COMPLETED");
    const pending = payments.filter((p) => p.status === "PENDING");
    return {
      total: payments.length,
      completedAmount: completed.reduce((s, p) => s + p.amount, 0),
      pendingCount: pending.length,
      failed: payments.filter((p) => p.status === "FAILED").length,
    };
  }, [payments]);

  return (
    <>
      <AdminHeader title="Payments" description="Track all payment transactions" />
      <div className="flex-1 overflow-y-auto p-6">
        <FinanceNav />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="emerald" title="Total Collected" value={loading ? "—" : formatCurrency(stats.completedAmount)} icon={CreditCard} />
          <StatCard accent="indigo" title="Transactions" value={loading ? "—" : stats.total} icon={CreditCard} />
          <StatCard accent="amber" title="Pending" value={loading ? "—" : stats.pendingCount} icon={Clock} />
          <StatCard accent="rose" title="Failed" value={loading ? "—" : stats.failed} icon={XCircle} />
        </div>

        <Card className="mb-6 overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoice, reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {PAYMENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {formatPaymentStatus(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filtered.length} payment{filtered.length !== 1 ? "s" : ""}
            </span>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Loading payments...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">No payments found</CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const cfg = PAYMENT_STATUS_CONFIG[p.status as PaymentStatus];
              return (
                <Card key={p.id} className="overflow-hidden border-slate-200/80 transition-all hover:shadow-md dark:border-slate-800">
                  <CardContent className="flex flex-wrap items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50">
                      <CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-[140px] flex-1">
                      <Button variant="link" className="h-auto p-0 font-bold text-emerald-600" asChild>
                        <Link href={`/admin/finance/invoices/${p.invoice.id}`}>{p.invoice.invoiceNumber}</Link>
                      </Button>
                      <p className="text-sm text-muted-foreground">{p.method.replace(/_/g, " ")}</p>
                      {p.reference && <p className="text-xs text-muted-foreground">Ref: {p.reference}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(p.amount)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(p.createdAt)}</p>
                    </div>
                    <Badge variant="outline" className={cn("shrink-0", cfg?.bg, cfg?.color, cfg?.border)}>
                      {formatPaymentStatus(p.status)}
                    </Badge>
                    {p.status === "COMPLETED" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
