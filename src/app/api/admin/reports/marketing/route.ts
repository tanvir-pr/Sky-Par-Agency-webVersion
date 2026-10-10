import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requirePermission("reports:read");
    if ("error" in auth) return auth.error;

    const reports = await prisma.marketingReport.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: { select: { id: true, name: true, company: true } } },
    });

    const byType = reports.reduce<Record<string, number>>((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      totalReports: reports.length,
      byType,
      reports,
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
