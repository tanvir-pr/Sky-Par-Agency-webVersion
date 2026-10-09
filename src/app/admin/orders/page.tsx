"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  LayoutGrid,
  List,
  Package,
  Search,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { OrderPipeline } from "@/components/admin/order-pipeline";
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
  ORDER_STATUSES,
  ORDER_STATUS_CONFIG,
  formatCurrency,
  formatOrderStatus,
  type OrderStatus,
} from "@/lib/order-status";
import { cn, formatDate } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  price: number;
  createdAt: string;
  client: { id: string; name: string; company: string | null };
  package: { name: string };
  manager: { name: string } | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"pipeline" | "table">("pipeline");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "100" };
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await axios.get("/api/orders", { params });
      setOrders(res.data.orders ?? []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = useMemo(() => {
    if (!search.trim()) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.client.name.toLowerCase().includes(q) ||
        o.client.company?.toLowerCase().includes(q) ||
        o.package.name.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const stats = useMemo(() => {
    const active = orders.filter(
      (o) => !["COMPLETED", "CANCELLED"].includes(o.status)
    ).length;
    const completed = orders.filter((o) => o.status === "COMPLETED").length;
    const revenue = orders
      .filter((o) => o.status === "COMPLETED")
      .reduce((s, o) => s + o.price, 0);
    const pipeline = orders
      .filter((o) => ["IN_PROGRESS", "CLIENT_REVIEW", "REVISION"].includes(o.status))
      .length;
    return { total: orders.length, active, completed, revenue, pipeline };
  }, [orders]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await axios.patch(`/api/orders/${id}`, { status });
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      toast.success(`Moved to ${formatOrderStatus(status)}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <AdminHeader
        title="Orders"
        description="Track, manage and deliver client orders through the pipeline"
      />
      <div className="flex-1 overflow-y-auto p-6">
        {/* KPI row */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            accent="indigo"
            title="Total Orders"
            value={loading ? "—" : stats.total}
            icon={ShoppingCart}
          />
          <StatCard
            accent="sky"
            title="Active Orders"
            value={loading ? "—" : stats.active}
            description="Awaiting completion"
            icon={Clock}
          />
          <StatCard
            accent="violet"
            title="In Delivery"
            value={loading ? "—" : stats.pipeline}
            description="In progress / review"
            icon={Package}
          />
          <StatCard
            accent="emerald"
            title="Completed Revenue"
            value={loading ? "—" : formatCurrency(stats.revenue)}
            description={`${stats.completed} completed`}
            icon={TrendingUp}
          />
        </div>

        {/* Toolbar */}
        <Card className="mb-6 overflow-hidden border-slate-200/80 shadow-sm dark:border-slate-800">
          <CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders, clients, packages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {formatOrderStatus(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex rounded-lg border p-1">
              <Button
                variant={view === "pipeline" ? "default" : "ghost"}
                size="sm"
                className="gap-1.5"
                onClick={() => setView("pipeline")}
              >
                <LayoutGrid className="h-4 w-4" />
                Pipeline
              </Button>
              <Button
                variant={view === "table" ? "default" : "ghost"}
                size="sm"
                className="gap-1.5"
                onClick={() => setView("table")}
              >
                <List className="h-4 w-4" />
                Table
              </Button>
            </div>
            <span className="text-sm text-muted-foreground">
              {filtered.length} order{filtered.length !== 1 ? "s" : ""}
            </span>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Loading orders...
          </div>
        ) : view === "pipeline" ? (
          <OrderPipeline
            orders={filtered}
            onStatusChange={updateStatus}
            updatingId={updatingId}
          />
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  No orders found
                </CardContent>
              </Card>
            ) : (
              filtered.map((order) => {
                const cfg = ORDER_STATUS_CONFIG[order.status as OrderStatus];
                return (
                  <Card
                    key={order.id}
                    className="overflow-hidden border-slate-200/80 transition-all hover:shadow-md dark:border-slate-800"
                  >
                    <CardContent className="flex flex-wrap items-center gap-4 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50">
                        <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-[140px] flex-1">
                        <p className="font-bold text-indigo-600">{order.orderNumber}</p>
                        <p className="text-sm font-medium">
                          {order.client.company || order.client.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{order.package.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatCurrency(order.price)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0", cfg?.bg, cfg?.color, cfg?.border)}
                      >
                        {formatOrderStatus(order.status)}
                      </Badge>
                      <Select
                        value={order.status}
                        onValueChange={(v) => updateStatus(order.id, v)}
                        disabled={updatingId === order.id}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {formatOrderStatus(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/orders/${order.id}`}>
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {!loading && stats.completed > 0 && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            {stats.completed} order{stats.completed !== 1 ? "s" : ""} delivered ·{" "}
            {formatCurrency(stats.revenue)} total revenue
            <ArrowRight className="ml-auto h-4 w-4" />
          </div>
        )}
      </div>
    </>
  );
}
