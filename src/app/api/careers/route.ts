import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { resolveListQuery } from "@/lib/list-query";
import { revalidateContent } from "@/lib/revalidate";
const createCareerSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  department: z.string().min(1),
  location: z.string().min(1),
  type: z.string().optional(),
  salary: z.string().optional(),
  description: z.string().min(1),
  requirements: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listQuery = await resolveListQuery(request);
    const department = searchParams.get("department");
    const slug = searchParams.get("slug");

    if (slug) {
      const career = await prisma.career.findUnique({
        where: { slug },
        include: listQuery.isAdmin
          ? { _count: { select: { applications: true } } }
          : undefined,
      });
      return NextResponse.json(career ? { careers: [career] } : { careers: [] });
    }

    const careers = await prisma.career.findMany({
      where: {
        ...(listQuery.publishedOnly && { published: true }),
        ...(department && { department }),
      },
      orderBy: { createdAt: "desc" },
      include: listQuery.isAdmin
        ? { _count: { select: { applications: true } } }
        : undefined,
    });

    return NextResponse.json(
      { careers },
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

    const parsed = createCareerSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const slug = parsed.data.slug || slugify(parsed.data.title);

    const career = await prisma.career.create({
      data: {
        ...parsed.data,
        slug,
      },
    });

    revalidateContent("careers");
    return NextResponse.json({ career }, { status: 201 });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return jsonError("A career with this slug already exists", 409);
    }
    return jsonError("Internal server error", 500);
  }
}
