"use client";

import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_CONFIG,
  PIPELINE_COLUMNS,
  formatCurrency,
  formatOrderStatus,
  type OrderStatus,
} from "@/lib/order-status";
import { formatDate } from "@/lib/utils";

export interface PipelineOrder {
  id: string;
  orderNumber: string;
  status: string;
  price: number;
  createdAt: string;
  client: { name: string; company: string | null };
  package: { name: string };
}

interface OrderPipelineProps {
  orders: PipelineOrder[];
  onStatusChange?: (id: string, status: OrderStatus) => void;
  updatingId?: string | null;
}

export function OrderPipeline({ orders, onStatusChange, updatingId }: OrderPipelineProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_COLUMNS.map((status) => {
        const cfg = ORDER_STATUS_CONFIG[status];
        const columnOrders = orders.filter((o) => o.status === status);

        return (
          <div
            key={status}
            className="flex w-72 shrink-0 flex-col rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950/80"
          >
            <div className={cn("flex items-center justify-between border-b px-4 py-3", cfg.border)}>
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", cfg.dot)} />
                <span className={cn("text-sm font-semibold", cfg.color)}>{cfg.label}</span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-muted-foreground dark:bg-slate-800">
                {columnOrders.length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-3 min-h-[200px]">
              {columnOrders.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">No orders</p>
              ) : (
                columnOrders.map((order) => (
                  <div
                    key={order.id}
                    className={cn(
                      "group rounded-xl border bg-white p-3 shadow-sm transition-all hover:shadow-md dark:bg-slate-900",
                      cfg.border,
                      updatingId === order.id && "opacity-60"
                    )}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-indigo-600">{order.orderNumber}</p>
                        <p className="mt-0.5 text-sm font-medium leading-tight">
                          {order.client.company || order.client.name}
                        </p>
                      </div>
                      <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                    <p className="mb-2 text-xs text-muted-foreground line-clamp-1">{order.package.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{formatCurrency(order.price)}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-slate-100 py-1.5 text-xs font-medium transition-colors hover:bg-indigo-100 hover:text-indigo-700 dark:bg-slate-800 dark:hover:bg-indigo-950"
                      >
                        View <ArrowRight className="h-3 w-3" />
                      </Link>
                      {onStatusChange && ORDER_STATUS_CONFIG[status] && (
                        <select
                          className="rounded-lg border bg-background px-2 py-1.5 text-[10px]"
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                        >
                          {Object.entries(ORDER_STATUS_CONFIG).map(([key, c]) => (
                            <option key={key} value={key}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
