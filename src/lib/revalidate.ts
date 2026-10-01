import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Public website content types. Each maps to the unstable_cache tag used in
 * src/lib/data.ts plus the public routes that render that content.
 */
type ContentType =
  | "blog"
  | "portfolio"
  | "testimonials"
  | "services"
  | "careers"
  | "team"
  | "settings";

const STATIC_PATHS: Record<ContentType, string[]> = {
  blog: ["/blog"],
  portfolio: ["/portfolio", "/"],
  testimonials: ["/testimonials", "/"],
  services: ["/services", "/", "/pricing"],
  careers: ["/careers"],
  team: ["/about", "/"],
  settings: ["/"],
};

const DYNAMIC_PATHS: Partial<Record<ContentType, string>> = {
  blog: "/blog/[slug]",
  portfolio: "/portfolio/[slug]",
  services: "/services/[slug]",
};

/**
 * Invalidate both the tagged data cache and the affected public routes so that
 * admin CMS create/edit/delete actions appear on the live website immediately.
 */
export function revalidateContent(type: ContentType) {
  try {
    revalidateTag(type);
    for (const path of STATIC_PATHS[type]) {
      revalidatePath(path);
    }
    const dynamic = DYNAMIC_PATHS[type];
    if (dynamic) {
      revalidatePath(dynamic, "page");
    }
  } catch (err) {
    console.error(`[revalidate] failed for ${type}:`, err);
  }
}
