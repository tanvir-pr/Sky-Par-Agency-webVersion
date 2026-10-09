import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { logActivity } from "@/lib/notifications/create";

const createMeetingSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().optional(),
  meetingUrl: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  attendeeIds: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  try {
    const auth = await requirePermission("calendar:read");
    if ("error" in auth) return auth.error;

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const projectId = searchParams.get("projectId") ?? undefined;

    const where = {
      ...(projectId && { projectId }),
      ...(from && to && {
        startTime: { gte: new Date(from) },
        endTime: { lte: new Date(to) },
      }),
    };

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        attendees: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ meetings });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requirePermission("calendar:write");
    if ("error" in auth) return auth.error;

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = createMeetingSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { attendeeIds, startTime, endTime, ...rest } = parsed.data;
    const members = [...new Set([auth.user.id, ...(attendeeIds ?? [])])];

    const meeting = await prisma.meeting.create({
      data: {
        ...rest,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        creatorId: auth.user.id,
        attendees: {
          create: members.map((userId) => ({ userId })),
        },
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        attendees: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    await logActivity(auth.user.id, "CREATE", "Created meeting", "Meeting", meeting.id);

    return NextResponse.json({ meeting }, { status: 201 });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
