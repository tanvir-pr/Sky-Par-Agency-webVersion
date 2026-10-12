import { NextResponse } from "next/server";
import { requireClientSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireClientSession();
    if ("error" in auth) return auth.error;

    const [automationProjects, subscriptions] = await Promise.all([
      prisma.project.findMany({
        where: {
          clientId: auth.clientId,
          package: { category: { slug: "automation" } },
        },
        include: {
          tasks: {
            where: {
              type: {
                in: ["AUTO_REQUIREMENT", "AUTO_WORKFLOW", "AUTO_API_SETUP", "AUTO_TESTING"],
              },
            },
            select: { id: true, title: true, status: true, type: true },
          },
        },
      }),
      prisma.clientSubscription.findMany({
        where: {
          clientId: auth.clientId,
          package: { category: { slug: "automation" } },
        },
        include: { package: true },
      }),
    ]);

    return NextResponse.json({ automationProjects, subscriptions });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
