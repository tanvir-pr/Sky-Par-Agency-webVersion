import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { resolveListQuery } from "@/lib/list-query";
import { revalidateContent } from "@/lib/revalidate";
const createPortfolioSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().min(1),
  shortDesc: z.string().optional(),
  thumbnail: z.string().min(1),
  gallery: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  category: z.string().min(1),
  liveUrl: z.string().url().optional().or(z.literal("")),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  results: z.string().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listQuery = await resolveListQuery(request);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const items = await prisma.portfolio.findMany({
      where: {
        ...(listQuery.publishedOnly && { published: true }),
        ...(category && category !== "All" && { category }),
        ...(featured === "true" && { featured: true }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { portfolio: items },
      { headers: { "Cache-Control": listQuery.cacheControl } }
    );
  } catch {
    return jsonError("Internal server error", 500);
  }
}
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const body = await parseJsonBody(request);
    if (!body) {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = createPortfolioSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const slug = parsed.data.slug || slugify(parsed.data.title);

    const item = await prisma.portfolio.create({
      data: {
        ...parsed.data,
        slug,
        liveUrl: parsed.data.liveUrl || null,
      },
    });

    revalidateContent("portfolio");
    return NextResponse.json({ portfolio: item }, { status: 201 });
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
