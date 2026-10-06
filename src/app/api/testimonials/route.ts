import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { resolveListQuery } from "@/lib/list-query";
import { revalidateContent } from "@/lib/revalidate";
const createTestimonialSchema = z.object({
  clientName: z.string().min(1),
  company: z.string().optional(),
  role: z.string().optional(),
  image: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  review: z.string().min(1),
  videoUrl: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listQuery = await resolveListQuery(request);
    const featured = searchParams.get("featured");

    const testimonials = await prisma.testimonial.findMany({
      where: {
        ...(listQuery.publishedOnly && { published: true }),
        ...(featured === "true" && { featured: true }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { testimonials },
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

    const parsed = createTestimonialSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        ...parsed.data,
        videoUrl: parsed.data.videoUrl || null,
      },
    });

    revalidateContent("testimonials");
    return NextResponse.json({ testimonial }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
