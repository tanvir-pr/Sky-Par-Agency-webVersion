import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { chatSchema } from "@/validations/forms";
import { buildIdempotencyKey, emitN8nEvent } from "@/lib/n8n";

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = chatSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { name, email, message, sessionId } = parsed.data;
    const session = sessionId || `chat_${Date.now()}`;

    let leadId: string | undefined;
    if (email && name) {
      const lead = await prisma.lead.create({
        data: {
          name,
          email,
          message,
          type: "CONTACT",
          source: "Live Chat",
        },
      });
      leadId = lead.id;
    }

    await emitN8nEvent(
      "chat.message",
      "website",
      {
        sessionId: session,
        leadId,
        name: name ?? "Visitor",
        email,
        message,
        page: request.headers.get("referer"),
      },
      buildIdempotencyKey(["chat", session, String(Date.now())])
    );

    await emitN8nEvent(
      "chat.message",
      "communication",
      { sessionId: session, message, leadId },
      buildIdempotencyKey(["chat_comm", session, String(Date.now())])
    );

    return NextResponse.json({
      ok: true,
      sessionId: session,
      reply: "Thanks! Our team will respond shortly.",
    });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
