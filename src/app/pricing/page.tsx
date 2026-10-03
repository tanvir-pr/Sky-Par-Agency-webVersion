import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/cta-section";
import { FadeInUp } from "@/components/animations/motion";
import { PricingView } from "@/components/pricing/pricing-view";
import { ContentCard, PageSection } from "@/components/ui/page-section";
import { getCachedServices } from "@/lib/data";
import { parsePricingPlans } from "@/types/pricing";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "Pricing",
  description:
    "Service-based pricing for web development, automation, AI, video, photo editing, and digital marketing.",
  path: "/pricing",
});

interface Props {
  searchParams: Promise<{ service?: string }>;
}

export default async function PricingPage({ searchParams }: Props) {
  const { service: serviceParam } = await searchParams;
  const rawServices = await getCachedServices();

  const services = rawServices
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      shortDesc: s.shortDesc,
      icon: s.icon,
      plans: parsePricingPlans(s.pricing),
    }))
    .filter((s) => s.plans.length > 0);

  const defaultSlug =
    services.find((s) => s.slug === serviceParam)?.slug ??
    services.find((s) => s.slug === "web-development")?.slug ??
    services[0]?.slug ??
    "web-development";

  return (
    <>
      <PageHeader
        badge="Pricing"
        title="Service-based pricing"
        description="Choose your service first — each offering has tailored plans designed for your needs."
      />

      <PageSection className="!pt-0" variant="mesh">
        <Suspense
          fallback={
            <div className="py-20 text-center text-muted-foreground">
              Loading pricing...
            </div>
          }
        >
          <PricingView services={services} initialServiceSlug={defaultSlug} />
        </Suspense>

        <FadeInUp className="mt-16 text-center">
          <ContentCard className="mx-auto max-w-2xl p-8" glow>
            <p className="mb-5 text-muted-foreground">
              Not sure which service or plan? Get a free consultation first.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="gradient" asChild>
                <Link href="/audit">Get free website audit</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/consultation">Schedule free consultation</Link>
              </Button>
            </div>
          </ContentCard>
        </FadeInUp>
      </PageSection>

      <CTASection />
    </>
  );
}
