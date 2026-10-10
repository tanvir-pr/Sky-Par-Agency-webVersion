import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requirePermission("reports:read");
    if ("error" in auth) return auth.error;

    const [invoices, payments, expenses] = await Promise.all([
      prisma.invoice.findMany({
        select: { status: true, total: true, createdAt: true, paidAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.findMany({
        where: { status: "COMPLETED" },
        select: { amount: true, createdAt: true },
      }),
      prisma.expense.findMany({
        select: { amount: true, category: true, date: true },
      }),
    ]);

    const totalRevenue = invoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + i.total, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const monthlyRevenue: Record<string, number> = {};
    for (const inv of invoices.filter((i) => i.status === "PAID")) {
      const date = inv.paidAt ?? inv.createdAt;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + inv.total;
    }

    const revenueByMonth = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, amount]) => ({ month, amount }));

    const expensesByCategory = expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    return NextResponse.json({
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      totalPayments: payments.reduce((sum, p) => sum + p.amount, 0),
      revenueByMonth,
      expensesByCategory,
      invoiceCount: invoices.length,
      paidInvoices: invoices.filter((i) => i.status === "PAID").length,
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
