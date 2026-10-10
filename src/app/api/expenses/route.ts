import { NextResponse } from "next/server";
import { z } from "zod";
import { ExpenseCategory } from "@prisma/client";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const expenseCategorySchema = z.enum(["TEAM", "SOFTWARE", "API", "AI", "MARKETING", "OTHER"]);

const createExpenseSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  category: expenseCategorySchema.optional(),
  description: z.string().optional(),
  userId: z.string().optional(),
  date: z.string().datetime().optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("finance:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const category = expenseCategorySchema.safeParse(categoryParam).success
      ? (categoryParam as ExpenseCategory)
      : undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where = category ? { category } : {};

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({
      expenses,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("finance:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createExpenseSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { date, category, ...rest } = parsed.data;

    const expense = await prisma.expense.create({
      data: {
        ...rest,
        category: (category as ExpenseCategory) ?? "OTHER",
        date: date ? new Date(date) : new Date(),
        userId: rest.userId ?? auth.user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity(auth.user.id, "CREATE", "Created expense", "Expense", expense.id);

    return NextResponse.json({ expense }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
