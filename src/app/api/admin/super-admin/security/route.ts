import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;
    if (auth.user.role !== "SUPER_ADMIN") return jsonError("Forbidden", 403);

    const [loginHistory, suspendedUsers, settings] = await Promise.all([
      prisma.loginHistory.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { name: true, email: true, role: true } } },
      }),
      prisma.user.findMany({
        where: { status: "SUSPENDED" },
        select: { id: true, name: true, email: true, role: true, lastLoginAt: true },
      }),
      prisma.settings.findUnique({
        where: { id: "default" },
        select: {
          stripeKey: true,
          openaiKey: true,
          smtpHost: true,
          pusherKey: true,
          s3Bucket: true,
        },
      }),
    ]);

    const securityChecks = {
      stripeConfigured: !!settings?.stripeKey,
      openaiConfigured: !!settings?.openaiKey,
      smtpConfigured: !!settings?.smtpHost,
      pusherConfigured: !!settings?.pusherKey,
      s3Configured: !!settings?.s3Bucket,
      jwtSecretFromEnv: !!process.env.JWT_SECRET,
    };

    return NextResponse.json({
      loginHistory,
      suspendedUsers,
      securityChecks,
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
