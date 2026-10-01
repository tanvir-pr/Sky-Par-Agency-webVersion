import { unstable_cache } from "next/cache";
import { prisma } from "./db";

const REVALIDATE = 120; // seconds — cache DB results, refresh every 2 min

export const getCachedServices = unstable_cache(
  async () =>
    prisma.service.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    }),
  ["services-published"],
  { revalidate: REVALIDATE, tags: ["services"] }
);

export const getCachedFeaturedPortfolio = unstable_cache(
  async () =>
    prisma.portfolio.findMany({
      where: { published: true, featured: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ["portfolio-featured-3"],
  { revalidate: REVALIDATE, tags: ["portfolio"] }
);

export const getCachedAllPortfolio = unstable_cache(
  async () =>
    prisma.portfolio.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    }),
  ["portfolio-all"],
  { revalidate: REVALIDATE, tags: ["portfolio"] }
);

export const getCachedFeaturedTestimonials = unstable_cache(
  async () =>
    prisma.testimonial.findMany({
      where: { published: true, featured: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ["testimonials-featured-5"],
  { revalidate: REVALIDATE, tags: ["testimonials"] }
);

export const getCachedAllTestimonials = unstable_cache(
  async () =>
    prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    }),
  ["testimonials-all"],
  { revalidate: REVALIDATE, tags: ["testimonials"] }
);

export const getCachedBlogPosts = unstable_cache(
  async () =>
    prisma.blog.findMany({
      where: { published: true },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ["blog-posts"],
  { revalidate: REVALIDATE, tags: ["blog"] }
);

export const getCachedCareers = unstable_cache(
  async () =>
    prisma.career.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    }),
  ["careers"],
  { revalidate: REVALIDATE, tags: ["careers"] }
);

export const getCachedTeam = unstable_cache(
  async () =>
    prisma.teamMember.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    }),
  ["team"],
  { revalidate: REVALIDATE, tags: ["team"] }
);

export async function getServiceBySlug(slug: string) {
  return unstable_cache(
    async () => prisma.service.findUnique({ where: { slug, published: true } }),
    ["service", slug],
    { revalidate: REVALIDATE, tags: ["services"] }
  )();
}

export async function getPortfolioBySlug(slug: string) {
  return unstable_cache(
    async () => prisma.portfolio.findUnique({ where: { slug, published: true } }),
    ["portfolio", slug],
    { revalidate: REVALIDATE, tags: ["portfolio"] }
  )();
}

export const getCachedSettings = unstable_cache(
  async () => {
    let settings = await prisma.settings.findUnique({ where: { id: "default" } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { id: "default" } });
    }
    return settings;
  },
  ["settings"],
  { revalidate: 300, tags: ["settings"] }
);

export async function getBlogBySlug(slug: string) {
  return unstable_cache(
    async () =>
      prisma.blog.findUnique({
        where: { slug, published: true },
        include: { author: { select: { name: true } } },
      }),
    ["blog", slug],
    { revalidate: REVALIDATE, tags: ["blog"] }
  )();
}
