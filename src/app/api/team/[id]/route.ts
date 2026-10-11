import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { revalidateContent } from "@/lib/revalidate";

const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  bio: z.string().optional(),
  image: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const { id } = await params;
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateTeamSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(parsed.data.linkedin !== undefined && {
          linkedin: parsed.data.linkedin || null,
        }),
        ...(parsed.data.twitter !== undefined && {
          twitter: parsed.data.twitter || null,
        }),
      },
    });
    revalidateContent("team");
    return NextResponse.json({ member });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const { id } = await params;
    await prisma.teamMember.delete({ where: { id } });

    revalidateContent("team");
    return NextResponse.json({ success: true });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
