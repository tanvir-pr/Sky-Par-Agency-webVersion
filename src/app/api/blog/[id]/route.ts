import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { revalidateContent } from "@/lib/revalidate";

const updateBlogSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  authorId: z.string().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const post =
      (await prisma.blog.findUnique({
        where: { id },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      })) ||
      (await prisma.blog.findUnique({
        where: { slug: id },
        include: {
          author: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }));

    if (!post) {
      return jsonError("Blog post not found", 404);
    }

    return NextResponse.json({ post });
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

    const parsed = updateBlogSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Blog post not found", 404);
    }

    const data = {
      ...parsed.data,
      ...(parsed.data.title && !parsed.data.slug
        ? { slug: slugify(parsed.data.title) }
        : {}),
    };

    const post = await prisma.blog.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    revalidateContent("blog");
    return NextResponse.json({ post });
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

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await params;

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Blog post not found", 404);
    }

    await prisma.blog.delete({ where: { id } });

    revalidateContent("blog");
    return NextResponse.json({ message: "Blog post deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
