import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireClientSession();
    if ("error" in auth) return auth.error;

    const subscriptions = await prisma.clientSubscription.findMany({
      where: { clientId: auth.clientId },
      orderBy: { createdAt: "desc" },
      include: {
        package: { include: { category: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    const packages = await prisma.servicePackage.findMany({
      include: { category: true },
      orderBy: [{ category: { order: "asc" } }, { order: "asc" }],
    });

    return NextResponse.json({ subscriptions, packages });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
