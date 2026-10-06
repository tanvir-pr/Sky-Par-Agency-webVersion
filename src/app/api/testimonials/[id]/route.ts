import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { revalidateContent } from "@/lib/revalidate";

const updateTestimonialSchema = z.object({
  clientName: z.string().min(1).optional(),
  company: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional(),
  review: z.string().min(1).optional(),
  videoUrl: z.string().url().optional().or(z.literal("")).nullable(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

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

    const parsed = updateTestimonialSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Testimonial not found", 404);
    }

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.videoUrl === "" ? { videoUrl: null } : {}),
      },
    });

    revalidateContent("testimonials");
    return NextResponse.json({ testimonial });
  } catch {
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

    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Testimonial not found", 404);
    }

    await prisma.testimonial.delete({ where: { id } });

    revalidateContent("testimonials");
    return NextResponse.json({ message: "Testimonial deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
