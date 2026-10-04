"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ArrowRight, CreditCard, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { findPricingPlan, planSlug, type ServicePricingPlan } from "@/types/pricing";
import { cn } from "@/lib/utils";

interface ServicePlanCardsProps {
  serviceSlug: string;
  plans: ServicePricingPlan[];
  variant?: "pricing" | "service";
  initialPlan?: string | null;
  showHint?: boolean;
  showServiceDetailsLink?: boolean;
  className?: string;
}

function resolvePlanSlug(plans: ServicePricingPlan[], planQuery?: string | null) {
  if (!planQuery) return null;
  const match = findPricingPlan(plans, planQuery);
  return match ? planSlug(match.name) : null;
}

interface PlanCardsGridProps {
  serviceSlug: string;
  plans: ServicePricingPlan[];
  selectedPlanSlug: string | null;
  onSelectPlan: (planName: string) => void;
  variant: "pricing" | "service";
  showHint?: boolean;
  showServiceDetailsLink?: boolean;
  className?: string;
}

function PlanCardsGrid({
  serviceSlug,
  plans,
  selectedPlanSlug,
  onSelectPlan,
  variant,
  showHint,
  showServiceDetailsLink,
  className,
}: PlanCardsGridProps) {
  const isCompact = variant === "service";

  return (
    <div className={className}>
      {showHint && (
        <p className="text-sm text-muted-foreground text-center mb-8">
          Click a plan card to select your package
        </p>
      )}

      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-3",
          isCompact ? "gap-6" : "gap-8 max-w-6xl mx-auto"
        )}
      >
        {plans.map((pkg) => {
          const isSelected = planSlug(pkg.name) === selectedPlanSlug;

          return (
            <motion.div
              key={pkg.name}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                onSelectPlan(pkg.name);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectPlan(pkg.name);
                }
              }}
              onMouseDown={(e) => e.preventDefault()}
              animate={{
                scale: isSelected ? 1.03 : 1,
                opacity: isSelected ? 1 : selectedPlanSlug ? 0.85 : 1,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "relative h-full cursor-pointer rounded-3xl outline-none transition-shadow duration-300",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isSelected
                  ? "z-10 glow-ring"
                  : "shadow-none"
              )}
            >
              <Card
                className={cn(
                  "relative flex h-full flex-col rounded-3xl border bg-card/80 backdrop-blur-sm transition-colors duration-300",
                  isSelected ? "border-primary bg-card" : "border-border/70",
                  !isSelected && "card-hover-lift"
                )}
              >
                {isSelected && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold whitespace-nowrap">
                    Selected
                  </div>
                )}
                {!isSelected && pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold whitespace-nowrap border">
                    Most Popular
                  </div>
                )}

                {isCompact ? (
                  <CardContent className="p-6 pt-8">
                    <h3
                      className={cn(
                        "font-semibold text-lg mb-1 transition-colors",
                        !isSelected && "text-foreground/80"
                      )}
                    >
                      {pkg.name}
                    </h3>
                    <div
                      className={cn(
                        "text-3xl font-bold mb-2 transition-all",
                        isSelected ? "text-primary" : "text-foreground/75"
                      )}
                    >
                      {pkg.price}
                    </div>
                    {pkg.description && (
                      <p
                        className={cn(
                          "text-sm mb-2",
                          isSelected ? "text-muted-foreground" : "text-muted-foreground/70"
                        )}
                      >
                        {pkg.description}
                      </p>
                    )}
                    {pkg.timeline && (
                      <p
                        className={cn(
                          "text-xs mb-4",
                          isSelected ? "text-muted-foreground" : "text-muted-foreground/70"
                        )}
                      >
                        {pkg.timeline}
                      </p>
                    )}
                    <ul className="space-y-2 mb-6">
                      {pkg.features.map((f) => (
                        <li
                          key={f}
                          className={cn(
                            "flex items-center gap-2 text-sm transition-colors",
                            !isSelected && "text-foreground/75"
                          )}
                        >
                          <CheckCircle
                            className={cn(
                              "h-4 w-4 shrink-0",
                              isSelected ? "text-primary" : "text-primary/60"
                            )}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div onClick={(e) => e.stopPropagation()}>
                      {pkg.depositCents != null ? (
                        <Button
                          variant={isSelected ? "gradient" : "outline"}
                          className="w-full gap-2"
                          asChild
                        >
                          <Link
                            href={`/checkout?service=${serviceSlug}&plan=${planSlug(pkg.name)}`}
                          >
                            Pay Deposit
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          variant={isSelected ? "gradient" : "outline"}
                          className="w-full"
                          asChild
                        >
                          <Link href={`/contact?service=${serviceSlug}`}>
                            Get Custom Quote
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                ) : (
                  <>
                    <CardHeader className="text-center pb-2">
                      <CardTitle
                        className={cn(
                          "text-xl transition-colors",
                          !isSelected && "text-foreground/80"
                        )}
                      >
                        {pkg.name}
                      </CardTitle>
                      <div
                        className={cn(
                          "text-4xl font-bold my-4 transition-all",
                          isSelected ? "text-gradient" : "text-foreground/75"
                        )}
                      >
                        {pkg.price}
                      </div>
                      <CardDescription className={cn(!isSelected && "text-muted-foreground/80")}>
                        {pkg.description}
                      </CardDescription>
                      {pkg.timeline && (
                        <p
                          className={cn(
                            "text-sm mt-2",
                            isSelected ? "text-muted-foreground" : "text-muted-foreground/70"
                          )}
                        >
                          Timeline: {pkg.timeline}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-3 mb-8 flex-1">
                        {pkg.features.map((feature) => (
                          <li
                            key={feature}
                            className={cn(
                              "flex items-start gap-3 text-sm transition-colors",
                              !isSelected && "text-foreground/75"
                            )}
                          >
                            <Check
                              className={cn(
                                "h-4 w-4 shrink-0 mt-0.5",
                                isSelected ? "text-primary" : "text-primary/60"
                              )}
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        {pkg.depositCents != null ? (
                          <Button
                            variant={isSelected ? "gradient" : "outline"}
                            className="w-full"
                            asChild
                          >
                            <Link
                              href={`/checkout?service=${serviceSlug}&plan=${planSlug(pkg.name)}`}
                            >
                              <CreditCard className="h-4 w-4" />
                              Pay Deposit & Start
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            variant={isSelected ? "gradient" : "outline"}
                            className="w-full"
                            asChild
                          >
                            <Link href={`/contact?service=${serviceSlug}`}>
                              Get Custom Quote
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {showServiceDetailsLink && (
                          <Button variant="ghost" className="w-full" asChild>
                            <Link href={`/services/${serviceSlug}`}>
                              View Service Details
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ServicePlanCardsLocal({
  serviceSlug,
  plans,
  initialPlan,
  showHint,
  className,
}: ServicePlanCardsProps) {
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string | null>(() =>
    resolvePlanSlug(plans, initialPlan)
  );

  const selectPlan = useCallback((planName: string) => {
    const slug = planSlug(planName);
    setSelectedPlanSlug(slug);
    const url = new URL(window.location.href);
    url.searchParams.set("plan", slug);
    window.history.replaceState(window.history.state, "", url.toString());
  }, []);

  if (plans.length === 0) return null;

  return (
    <PlanCardsGrid
      serviceSlug={serviceSlug}
      plans={plans}
      selectedPlanSlug={selectedPlanSlug}
      onSelectPlan={selectPlan}
      variant="service"
      showHint={showHint}
      className={className}
    />
  );
}

function ServicePlanCardsRouted({
  serviceSlug,
  plans,
  showHint,
  showServiceDetailsLink,
  className,
}: ServicePlanCardsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");

  const selectedPlanSlug = useMemo(
    () => resolvePlanSlug(plans, planParam),
    [plans, planParam]
  );

  const selectPlan = useCallback(
    (planName: string) => {
      const slug = planSlug(planName);
      const params = new URLSearchParams(searchParams.toString());
      params.set("service", serviceSlug);
      params.set("plan", slug);
      router.replace(`/pricing?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, serviceSlug]
  );

  if (plans.length === 0) return null;

  return (
    <PlanCardsGrid
      serviceSlug={serviceSlug}
      plans={plans}
      selectedPlanSlug={selectedPlanSlug}
      onSelectPlan={selectPlan}
      variant="pricing"
      showHint={showHint}
      showServiceDetailsLink={showServiceDetailsLink}
      className={className}
    />
  );
}

export function ServicePlanCards(props: ServicePlanCardsProps) {
  if (props.variant === "service") {
    return <ServicePlanCardsLocal {...props} />;
  }
  return <ServicePlanCardsRouted {...props} />;
}
