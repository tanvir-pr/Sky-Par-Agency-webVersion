import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { resolveListQuery } from "@/lib/list-query";
import { revalidateContent } from "@/lib/revalidate";
const createTeamMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().optional(),
  image: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const listQuery = await resolveListQuery(request);

    const team = await prisma.teamMember.findMany({
      where: listQuery.publishedOnly ? { published: true } : undefined,
      orderBy: { order: "asc" },
    });

    return NextResponse.json(
      { team },
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

    const parsed = createTeamMemberSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const member = await prisma.teamMember.create({
      data: {
        ...parsed.data,
        linkedin: parsed.data.linkedin || null,
        twitter: parsed.data.twitter || null,
      },
    });

    revalidateContent("team");
    return NextResponse.json({ member }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
