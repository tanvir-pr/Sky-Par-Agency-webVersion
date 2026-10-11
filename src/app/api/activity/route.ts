import { NextResponse } from "next/server";
import { z } from "zod";
import { ActivityType } from "@prisma/client";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";

const activityTypeSchema = z.enum([
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "STATUS_CHANGE",
  "ASSIGNMENT",
  "PAYMENT",
  "UPLOAD",
]);

export async function GET(request: Request) {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");
    const type = activityTypeSchema.safeParse(typeParam).success
      ? (typeParam as ActivityType)
      : undefined;
    const entityType = searchParams.get("entityType") ?? undefined;
    const userId = searchParams.get("userId") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const where = {
      ...(type && { type }),
      ...(entityType && { entityType }),
      ...(userId && { userId }),
    };

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
