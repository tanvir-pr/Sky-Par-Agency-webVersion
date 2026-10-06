import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { resolveListQuery } from "@/lib/list-query";
import { revalidateContent } from "@/lib/revalidate";
const createServiceSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().min(1),
  shortDesc: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  features: z.array(z.string()).optional(),
  process: z.unknown().optional(),
  pricing: z.unknown().optional(),
  faqs: z.unknown().optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const listQuery = await resolveListQuery(request);

    const services = await prisma.service.findMany({
      where: listQuery.publishedOnly ? { published: true } : undefined,
      orderBy: { order: "asc" },
    });

    return NextResponse.json(
      { services },
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

    const parsed = createServiceSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const slug = parsed.data.slug || slugify(parsed.data.title);

    const service = await prisma.service.create({
      data: {
        ...parsed.data,
        slug,
        process: parsed.data.process ?? undefined,
        pricing: parsed.data.pricing ?? undefined,
        faqs: parsed.data.faqs ?? undefined,
      },
    });

    revalidateContent("services");
    return NextResponse.json({ service }, { status: 201 });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return jsonError("A service with this slug already exists", 409);
    }
    return jsonError("Internal server error", 500);
  }
}
