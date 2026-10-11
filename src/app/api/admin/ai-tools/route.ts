import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { jsonError } from "@/lib/api-utils";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: Request) {
  try {
    const auth = await requireAdminSession();
    if ("error" in auth) return auth.error;

    const body = await request.json();
    const { tool, prompt, context } = body as { tool: string; prompt: string; context?: string };

    if (!openai) {
      return NextResponse.json({
        result: `[Demo Mode] AI ${tool} result for: "${prompt}"\n\nThis is a placeholder response. Set OPENAI_API_KEY to enable real AI generation.`,
        tokens: 0,
        cost: 0,
      });
    }

    const systemPrompts: Record<string, string> = {
      proposal: "You are a professional proposal writer for a digital marketing agency. Write compelling, structured proposals.",
      content: "You are a content marketing expert. Write engaging, SEO-friendly content.",
      meeting: "You are a meeting assistant. Summarize meetings into clear action items and key decisions.",
      report: "You are a client report generator for a digital agency. Create professional monthly client reports.",
      chat: "You are an AI assistant for a digital agency admin dashboard. Help with agency operations.",
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompts[tool] || systemPrompts.chat },
        { role: "user", content: context ? `Context: ${context}\n\n${prompt}` : prompt },
      ],
      max_tokens: 1500,
    });

    const result = completion.choices[0]?.message?.content ?? "";
    const tokens = completion.usage?.total_tokens ?? 0;
    const cost = tokens * 0.000002;

    await prisma.aiCostLog.create({
      data: {
        provider: "openai",
        model: "gpt-4o-mini",
        tokens,
        cost,
        metadata: { tool, userId: auth.user.id },
      },
    });

    return NextResponse.json({ result, tokens, cost });
  } catch (err) {
    console.error("AI error:", err);
    return jsonError("AI generation failed", 500);
  }
}
