export interface ServicePricingPlan {
  name: string;
  price: string;
  priceCents: number | null;
  depositCents: number | null;
  description: string;
  timeline: string;
  features: string[];
  popular?: boolean;
}

export function planSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function parsePricingPlans(raw: unknown): ServicePricingPlan[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null && typeof item.name === "string"
    )
    .map((item) => ({
      name: String(item.name),
      price: String(item.price ?? "Custom"),
      priceCents:
        typeof item.priceCents === "number" ? item.priceCents : null,
      depositCents:
        typeof item.depositCents === "number"
          ? item.depositCents
          : typeof item.priceCents === "number"
            ? Math.round(item.priceCents / 2)
            : null,
      description: String(item.description ?? ""),
      timeline: String(item.timeline ?? ""),
      features: Array.isArray(item.features)
        ? item.features.map(String)
        : [],
      popular: Boolean(item.popular),
    }));
}

export function findPricingPlan(
  plans: ServicePricingPlan[],
  planQuery?: string
): ServicePricingPlan | null {
  if (plans.length === 0) return null;
  if (!planQuery) {
    return plans.find((p) => p.popular) ?? plans[0];
  }

  const q = planQuery.toLowerCase();
  return (
    plans.find((p) => planSlug(p.name) === q) ??
    plans.find((p) => p.name.toLowerCase() === q) ??
    plans.find((p) => p.popular) ??
    plans[0]
  );
}
