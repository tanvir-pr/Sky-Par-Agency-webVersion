import { getServiceBySlug } from "./data";
import { isStripeConfigured } from "./stripe";
import {
  findPricingPlan,
  parsePricingPlans,
  planSlug,
  type ServicePricingPlan,
} from "@/types/pricing";

export { planSlug, parsePricingPlans, type ServicePricingPlan };

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export interface CheckoutSelection {
  serviceSlug: string;
  serviceTitle: string;
  plan: ServicePricingPlan;
}

export async function getCheckoutSelection(
  serviceSlug: string,
  planQuery?: string
): Promise<CheckoutSelection | null> {
  const service = await getServiceBySlug(serviceSlug);
  if (!service) return null;

  const plans = parsePricingPlans(service.pricing);
  const plan = findPricingPlan(plans, planQuery);
  if (!plan) return null;

  return {
    serviceSlug: service.slug,
    serviceTitle: service.title,
    plan,
  };
}

export function canPayWithStripe(plan: ServicePricingPlan): boolean {
  return isStripeConfigured() && plan.depositCents !== null;
}

export function getDepositCentsFromPlan(plan: ServicePricingPlan): number | null {
  return plan.depositCents;
}
