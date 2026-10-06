import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { parsePagination, resolveListQuery } from "@/lib/list-query";
import { revalidateContent } from "@/lib/revalidate";
const createBlogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  thumbnail: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  authorId: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listQuery = await resolveListQuery(request, {
      publicLimit: 10,
      adminLimit: 50,
    });
    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category");
    const { page, limit, skip } = parsePagination(
      searchParams,
      listQuery.defaultLimit,
      listQuery.maxLimit
    );

    const where = {
      ...(listQuery.publishedOnly && { published: true }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { excerpt: { contains: search, mode: "insensitive" as const } },
          { content: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [posts, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    return NextResponse.json(
      { posts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
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

    const parsed = createBlogSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const slug = parsed.data.slug || slugify(parsed.data.title);
    const authorId = parsed.data.authorId || session.userId;

    const post = await prisma.blog.create({
      data: {
        ...parsed.data,
        slug,
        authorId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    revalidateContent("blog");
    return NextResponse.json({ post }, { status: 201 });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return jsonError("A blog post with this slug already exists", 409);
    }
    return jsonError("Internal server error", 500);
  }
}
