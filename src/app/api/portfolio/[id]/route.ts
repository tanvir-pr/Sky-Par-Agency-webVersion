import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { revalidateContent } from "@/lib/revalidate";

const updatePortfolioSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().min(1).optional(),
  shortDesc: z.string().optional(),
  thumbnail: z.string().min(1).optional(),
  gallery: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  category: z.string().min(1).optional(),
  liveUrl: z.string().url().optional().or(z.literal("")).nullable(),
  challenge: z.string().optional().nullable(),
  solution: z.string().optional().nullable(),
  results: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const item =
      (await prisma.portfolio.findUnique({ where: { id } })) ||
      (await prisma.portfolio.findUnique({ where: { slug: id } }));

    if (!item) {
      return jsonError("Portfolio item not found", 404);
    }

    return NextResponse.json({ portfolio: item });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = updatePortfolioSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const existing = await prisma.portfolio.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Portfolio item not found", 404);
    }

    const data = {
      ...parsed.data,
      ...(parsed.data.title && !parsed.data.slug
        ? { slug: slugify(parsed.data.title) }
        : {}),
      ...(parsed.data.liveUrl === "" ? { liveUrl: null } : {}),
    };

    const item = await prisma.portfolio.update({
      where: { id },
      data,
    });

    revalidateContent("portfolio");
    return NextResponse.json({ portfolio: item });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return jsonError("A portfolio item with this slug already exists", 409);
    }
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await params;

    const existing = await prisma.portfolio.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Portfolio item not found", 404);
    }

    await prisma.portfolio.delete({ where: { id } });

    revalidateContent("portfolio");
    return NextResponse.json({ message: "Portfolio item deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
