import { getSession } from "./auth";

export interface ListQueryOptions {
  isAdmin: boolean;
  publishedOnly: boolean;
  cacheControl: string;
  defaultLimit: number;
  maxLimit: number;
}

export async function resolveListQuery(
  request: Request,
  defaults: { publicLimit?: number; adminLimit?: number } = {}
): Promise<ListQueryOptions> {
  const session = await getSession();
  const isAdmin = !!session;
  const { searchParams } = new URL(request.url);
  const publishedParam = searchParams.get("published");

  const publishedOnly = !isAdmin && publishedParam !== "false";

  return {
    isAdmin,
    publishedOnly,
    cacheControl: isAdmin
      ? "no-store"
      : "public, s-maxage=120, stale-while-revalidate=300",
    defaultLimit: isAdmin
      ? (defaults.adminLimit ?? 50)
      : (defaults.publicLimit ?? 10),
    maxLimit: isAdmin ? 100 : 50,
  };
}

export function parsePagination(
  searchParams: URLSearchParams,
  defaultLimit: number,
  maxLimit: number
) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(searchParams.get("limit") || String(defaultLimit), 10))
  );

  return { page, limit, skip: (page - 1) * limit };
}
