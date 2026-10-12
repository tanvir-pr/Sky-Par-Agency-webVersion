import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireClientSession();
    if ("error" in auth) return auth.error;

    const reports = await prisma.marketingReport.findMany({
      where: { clientId: auth.clientId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reports });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
