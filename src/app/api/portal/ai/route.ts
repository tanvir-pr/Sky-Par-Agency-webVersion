import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireClientSession();
    if ("error" in auth) return auth.error;

    const logs = await prisma.aiCostLog.findMany({
      where: { clientId: auth.clientId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
    const totalTokens = logs.reduce((sum, log) => sum + log.tokens, 0);

    const byProvider = logs.reduce<Record<string, { cost: number; tokens: number; count: number }>>(
      (acc, log) => {
        if (!acc[log.provider]) {
          acc[log.provider] = { cost: 0, tokens: 0, count: 0 };
        }
        acc[log.provider].cost += log.cost;
        acc[log.provider].tokens += log.tokens;
        acc[log.provider].count += 1;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      logs,
      summary: { totalCost, totalTokens, totalRequests: logs.length, byProvider },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
