"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ArrowRight, CreditCard, Globe, Bot, Brain, Video, Image, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PricingPaymentSection } from "@/components/payment/pricing-payment-section";
import { ServicePlanCards } from "@/components/pricing/service-plan-cards";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Bot,
  Brain,
  Video,
  Image,
  Megaphone,
};

export interface ServicePricingItem {
  slug: string;
  title: string;
  shortDesc: string | null;
  icon: string | null;
  plans: import("@/types/pricing").ServicePricingPlan[];
}

interface PricingViewProps {
  services: ServicePricingItem[];
  initialServiceSlug: string;
}

export function PricingView({ services, initialServiceSlug }: PricingViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeSlug =
    services.find((s) => s.slug === searchParams.get("service"))?.slug ??
    services.find((s) => s.slug === initialServiceSlug)?.slug ??
    services[0]?.slug;

  const activeService = services.find((s) => s.slug === activeSlug) ?? services[0];
  const plans = activeService?.plans ?? [];

  const selectService = useCallback(
    (slug: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("service", slug);
      params.delete("plan");
      router.replace(`/pricing?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  if (!activeService || services.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        No pricing plans available yet. Please check back soon.
      </div>
    );
  }

  return (
    <>
      <div className="mb-10">
        <span className="section-label mb-5 block text-center">Services</span>
        <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
          Select a service to view pricing plans
        </p>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {services.map((service) => {
            const isActive = service.slug === activeSlug;
            const Icon = ICON_MAP[service.icon || ""] ?? Globe;

            return (
              <button
                key={service.slug}
                type="button"
                onClick={() => selectService(service.slug)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all duration-300",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isActive
                    ? "border-primary bg-primary/5 shadow-md glow-ring"
                    : "border-border bg-card/80 backdrop-blur-sm hover:border-primary/30 hover:bg-muted/20 card-hover-lift"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold leading-tight">{service.title}</span>
                <span className="text-[10px] text-muted-foreground">
                  {service.plans.length} plan{service.plans.length !== 1 ? "s" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlug}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              {activeService.title}{" "}
              <span className="text-gradient">pricing</span>
            </h2>
            {activeService.shortDesc && (
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                {activeService.shortDesc}
              </p>
            )}
          </div>

          <ServicePlanCards
            serviceSlug={activeService.slug}
            plans={plans}
            variant="pricing"
          />
        </motion.div>
      </AnimatePresence>

      <PricingPaymentSection serviceSlug={activeService.slug} />
    </>
  );
}
