import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { revalidateContent } from "@/lib/revalidate";

const updateServiceSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().min(1).optional(),
  shortDesc: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  features: z.array(z.string()).optional(),
  process: z.unknown().optional().nullable(),
  pricing: z.unknown().optional().nullable(),
  faqs: z.unknown().optional().nullable(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const service =
      (await prisma.service.findUnique({ where: { id } })) ||
      (await prisma.service.findUnique({ where: { slug: id } }));

    if (!service) {
      return jsonError("Service not found", 404);
    }

    return NextResponse.json({ service });
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

    const parsed = updateServiceSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Service not found", 404);
    }

    const data = {
      ...parsed.data,
      ...(parsed.data.title && !parsed.data.slug
        ? { slug: slugify(parsed.data.title) }
        : {}),
    };

    const service = await prisma.service.update({
      where: { id },
      data: data as Prisma.ServiceUpdateInput,
    });

    revalidateContent("services");
    return NextResponse.json({ service });
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

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await params;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Service not found", 404);
    }

    await prisma.service.delete({ where: { id } });

    revalidateContent("services");
    return NextResponse.json({ message: "Service deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
