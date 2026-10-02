import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const staticPages = [
    { route: "", priority: 1, changeFrequency: "weekly" as const },
    { route: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/services", priority: 0.9, changeFrequency: "weekly" as const },
    { route: "/portfolio", priority: 0.8, changeFrequency: "weekly" as const },
    { route: "/pricing", priority: 0.9, changeFrequency: "weekly" as const },
    { route: "/audit", priority: 0.7, changeFrequency: "monthly" as const },
    { route: "/blog", priority: 0.8, changeFrequency: "daily" as const },
    { route: "/testimonials", priority: 0.7, changeFrequency: "monthly" as const },
    { route: "/careers", priority: 0.6, changeFrequency: "weekly" as const },
    { route: "/contact", priority: 0.8, changeFrequency: "monthly" as const },
    { route: "/consultation", priority: 0.7, changeFrequency: "monthly" as const },
    { route: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { route: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  ].map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  try {
    const [services, portfolio, blogs, careers] = await Promise.all([
      prisma.service.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      prisma.portfolio.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      prisma.blog.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      prisma.career.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    ]);

    return [
      ...staticPages,
      ...services.map((s) => ({
        url: `${baseUrl}/services/${s.slug}`,
        lastModified: s.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...portfolio.map((p) => ({
        url: `${baseUrl}/portfolio/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...blogs.map((b) => ({
        url: `${baseUrl}/blog/${b.slug}`,
        lastModified: b.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...careers.map((c) => ({
        url: `${baseUrl}/careers/${c.slug}`,
        lastModified: c.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    ];
  } catch {
    return staticPages;
  }
}
