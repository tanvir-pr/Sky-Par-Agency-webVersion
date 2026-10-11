import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jsonError, parseJsonBody, zodErrorResponse } from "@/lib/api-utils";
import { revalidateContent } from "@/lib/revalidate";

const settingsSchema = z.object({
  companyName: z.string().optional(),
  tagline: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  socialTwitter: z.string().optional(),
  socialLinkedin: z.string().optional(),
  socialInstagram: z.string().optional(),
  socialFacebook: z.string().optional(),
  socialYoutube: z.string().optional(),
  calendlyUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().int().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  stripeKey: z.string().optional(),
  paypalEmail: z.string().optional(),
  pusherKey: z.string().optional(),
  s3Bucket: z.string().optional(),
  openaiKey: z.string().optional(),
  customDomain: z.string().optional(),
});

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: "default" } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: "default" } });
    }
    return NextResponse.json({ settings });
  } catch {
    return jsonError("Internal server error", 500);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);

    const body = await parseJsonBody(request);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const settings = await prisma.settings.upsert({
      where: { id: "default" },
      update: parsed.data,
      create: { id: "default", ...parsed.data },
    });

    revalidateContent("settings");
    return NextResponse.json({ settings });
  } catch {
    return jsonError("Internal server error", 500);
  }
}
