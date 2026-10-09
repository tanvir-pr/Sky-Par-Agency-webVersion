"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  FolderKanban,
  Mail,
  Package,
  Phone,
  User,
  Zap,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { OrderWorkflow } from "@/components/admin/order-workflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  ORDER_WORKFLOW,
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
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string; email: string; company: string | null; phone: string | null };
  package: { name: string; price: string; deliveryTime: string };
  manager: { id: string; name: string } | null;
  project: { id: string; title: string } | null;
}

const ACTION_STYLES: Record<string, string> = {
  CANCELLED: "bg-red-600 hover:bg-red-700 text-white",
  COMPLETED: "bg-emerald-600 hover:bg-emerald-700 text-white",
  default: "bg-indigo-600 hover:bg-indigo-700 text-white",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/orders/${id}`);
      setOrder(res.data.order ?? null);
    } catch {
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await axios.patch(`/api/orders/${id}`, { status });
      setOrder(res.data.order);
      toast.success(`Order moved to ${formatOrderStatus(status)}`);
    } catch {
      toast.error("Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !order) {
    return (
      <>
        <AdminHeader title="Order" description="Loading order details..." />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <AdminHeader title="Order Not Found" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <p className="text-muted-foreground">This order could not be found.</p>
          <Button variant="outline" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
      </>
    );
  }

  const cfg = ORDER_STATUS_CONFIG[order.status as OrderStatus];
  const nextStatuses = ORDER_WORKFLOW[order.status as OrderStatus] ?? [];

  return (
    <>
      <AdminHeader
        title={order.orderNumber}
        description={`${order.client.company || order.client.name} · ${order.package.name}`}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Orders
          </Link>
        </Button>

        {/* Hero summary */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white shadow-xl shadow-indigo-600/20 dark:border-indigo-900">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-indigo-200">Order</p>
              <h2 className="text-3xl font-bold tracking-tight">{order.orderNumber}</h2>
              <p className="mt-1 text-indigo-100">{order.package.name}</p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "border-white/30 bg-white/10 text-white backdrop-blur",
                cfg?.bg && "bg-white/20"
              )}
            >
              {formatOrderStatus(order.status)}
            </Badge>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-indigo-200">Amount</p>
              <p className="text-xl font-bold">{formatCurrency(order.price)}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-indigo-200">Client</p>
              <p className="text-sm font-semibold">{order.client.company || order.client.name}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
              <p className="text-xs text-indigo-200">Ordered</p>
              <p className="text-sm font-semibold">{formatDate(order.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Workflow stepper */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Delivery Progress
          </h3>
          <OrderWorkflow currentStatus={order.status} />
        </div>

        {/* Quick actions */}
        {nextStatuses.length > 0 && (
          <Card className="mb-6 border-indigo-200/50 bg-indigo-50/30 dark:border-indigo-900/50 dark:bg-indigo-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-indigo-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {nextStatuses.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  disabled={updating}
                  className={ACTION_STYLES[status] ?? ACTION_STYLES.default}
                  onClick={() => updateStatus(status)}
                >
                  → {formatOrderStatus(status)}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Client */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-indigo-600" />
                Client Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {[
                { icon: User, label: "Name", value: order.client.name },
                { icon: Mail, label: "Email", value: order.client.email },
                order.client.phone && { icon: Phone, label: "Phone", value: order.client.phone },
                order.client.company && {
                  icon: Building2,
                  label: "Company",
                  value: order.client.company,
                },
              ]
                .filter(Boolean)
                .map((item) => {
                  const row = item as { icon: typeof User; label: string; value: string };
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{row.label}</p>
                        <p className="text-sm font-medium">{row.value}</p>
                      </div>
                    </div>
                  );
                })}
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/admin/crm/clients/${order.client.id}`}>View Client Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Package */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-indigo-600" />
                Package & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {[
                { icon: Package, label: "Package", value: order.package.name },
                { icon: DollarSign, label: "Listed Price", value: order.package.price },
                { icon: Calendar, label: "Delivery Time", value: order.package.deliveryTime },
                {
                  icon: User,
                  label: "Manager",
                  value: order.manager?.name || "Unassigned",
                },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{row.label}</p>
                      <p className="text-sm font-medium">{row.value}</p>
                    </div>
                  </div>
                );
              })}
              {order.project && (
                <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                  <Link href={`/admin/projects/${order.project.id}`}>
                    <FolderKanban className="h-4 w-4" />
                    View Project: {order.project.title}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {order.notes && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Client Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-900">
                {order.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Manual override */}
        <Card className="mt-6 border-dashed">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Manual Status Override
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={order.status} onValueChange={updateStatus} disabled={updating}>
              <SelectTrigger className="w-56">
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}
