import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { applicationSchema } from "@/validations/forms";
import { notifyNewLead, sendConfirmationEmail } from "@/lib/email";
import { emitApplicationReceived } from "@/lib/n8n";

const createApplicationSchema = applicationSchema.extend({
  careerId: z.string().min(1, "Career ID is required"),
  resume: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return jsonError("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const careerId = searchParams.get("careerId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where = careerId ? { careerId } : {};

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          career: {
            select: { id: true, title: true, slug: true, department: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) {
      return jsonError("Invalid JSON body", 400);
    }

    const parsed = createApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const career = await prisma.career.findUnique({
      where: { id: parsed.data.careerId },
    });

    if (!career) {
      return jsonError("Career not found", 404);
    }

    if (!career.published) {
      return jsonError("This position is no longer accepting applications", 400);
    }

    const application = await prisma.application.create({
      data: parsed.data,
      include: {
        career: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    await notifyNewLead({
      type: "INQUIRY",
      name: application.name,
      email: application.email,
      phone: application.phone,
      service: `Career: ${career.title}`,
      message: application.cover || "Job application submitted",
    });
    await sendConfirmationEmail(application.email, application.name, "INQUIRY");
    await emitApplicationReceived({
      id: application.id,
      name: application.name,
      email: application.email,
      careerTitle: career.title,
      careerId: career.id,
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
