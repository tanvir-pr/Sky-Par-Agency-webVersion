import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;

    const payments = await prisma.payment.findMany({
      where: { status: "COMPLETED" },
      select: { amount: true, createdAt: true, method: true },
      orderBy: { createdAt: "desc" },
    });

    const invoices = await prisma.invoice.findMany({
      select: { total: true, status: true, createdAt: true },
    });

    const monthMap: Record<string, { revenue: number; invoiced: number }> = {};
    for (const p of payments) {
      const date = new Date(p.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[key]) monthMap[key] = { revenue: 0, invoiced: 0 };
      monthMap[key].revenue += p.amount;
    }
    for (const inv of invoices) {
      const date = new Date(inv.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[key]) monthMap[key] = { revenue: 0, invoiced: 0 };
      monthMap[key].invoiced += inv.total;
    }

    const chart = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, val]) => ({
        month: new Date(`${key}-01`).toLocaleString("en-US", { month: "short", year: "2-digit" }),
        revenue: Math.round(val.revenue),
        invoiced: Math.round(val.invoiced),
      }));

    const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
    const totalExpenses = await prisma.expense.aggregate({ _sum: { amount: true } });
    const profit = totalRevenue - (totalExpenses._sum.amount ?? 0);

    return NextResponse.json({
      chart,
      totalRevenue,
      totalExpenses: totalExpenses._sum.amount ?? 0,
      profit,
      byMethod: await prisma.payment.groupBy({
        by: ["method"],
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
