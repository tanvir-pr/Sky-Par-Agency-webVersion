import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireClientSession();
    if ("error" in auth) return auth.error;

    const invoices = await prisma.invoice.findMany({
      where: { clientId: auth.clientId },
      orderBy: { createdAt: "desc" },
      include: {
        payments: true,
      },
    });

    const summary = {
      total: invoices.length,
      paid: invoices.filter((i) => i.status === "PAID").length,
      pending: invoices.filter((i) => i.status === "SENT" || i.status === "OVERDUE").length,
      totalPaid: invoices
        .filter((i) => i.status === "PAID")
        .reduce((sum, i) => sum + i.total, 0),
      totalOutstanding: invoices
        .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
        .reduce((sum, i) => sum + i.total, 0),
    };

    return NextResponse.json({ invoices, summary });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
