import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { revalidateContent } from "@/lib/revalidate";

const updateCareerSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  department: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  type: z.string().optional(),
  salary: z.string().optional().nullable(),
  description: z.string().min(1).optional(),
  requirements: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const career =
      (await prisma.career.findUnique({ where: { id } })) ||
      (await prisma.career.findUnique({ where: { slug: id } }));

    if (!career) {
      return jsonError("Career not found", 404);
    }

    return NextResponse.json({ career });
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

    const parsed = updateCareerSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const existing = await prisma.career.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Career not found", 404);
    }

    const data = {
      ...parsed.data,
      ...(parsed.data.title && !parsed.data.slug
        ? { slug: slugify(parsed.data.title) }
        : {}),
    };

    const career = await prisma.career.update({
      where: { id },
      data,
    });

    revalidateContent("careers");
    return NextResponse.json({ career });
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

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { id } = await params;

    const existing = await prisma.career.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("Career not found", 404);
    }

    await prisma.career.delete({ where: { id } });

    revalidateContent("careers");
    return NextResponse.json({ message: "Career deleted successfully" });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
