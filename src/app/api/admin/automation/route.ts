import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requirePermission("automation:read");
    if ("error" in auth) return auth.error;

    const rules = await prisma.automationRule.findMany({
      orderBy: { createdAt: "desc" },
    });

    const activeCount = rules.filter((r) => r.active).length;

    return NextResponse.json({ rules, activeCount, totalCount: rules.length });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
