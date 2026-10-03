import { buildPageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import {
  BreadcrumbJsonLd,
  FaqJsonLd,
  ServiceJsonLd,
} from "@/components/seo/json-ld-schemas";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FadeInUp } from "@/components/animations/motion";
import { CTASection } from "@/components/sections/cta-section";
import { ServicePlanCards } from "@/components/pricing/service-plan-cards";
import { PageSection } from "@/components/ui/page-section";
import { getServiceBySlug, getCachedServices } from "@/lib/data";
import { parsePricingPlans } from "@/types/pricing";

export const revalidate = 120;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ plan?: string }>;
}

async function getService(slug: string) {
  try {
    return await getServiceBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Service Not Found" };
  return buildPageMetadata({
    title: service.title,
    description: service.shortDesc || service.description.slice(0, 160),
    path: `/services/${slug}`,
  });
}

export async function generateStaticParams() {
  try {
    const services = await getCachedServices();
    return services.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export default async function ServiceDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { plan } = await searchParams;
  const service = await getService(slug);
  if (!service) notFound();

  const features = service.features || [];
  const process = (service.process as { step: string; title: string; description: string }[]) || [];
  const faqs = (service.faqs as { question: string; answer: string }[]) || [];
  const pricing = parsePricingPlans(service.pricing);

  return (
    <>
      <ServiceJsonLd
        name={service.title}
        description={service.shortDesc || service.description.slice(0, 200)}
        slug={slug}
        offers={pricing.map((p) => ({ name: p.name, price: p.price }))}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: service.title, path: `/services/${slug}` },
        ]}
      />
      {faqs.length > 0 && <FaqJsonLd items={faqs} />}
      <PageHeader
        badge="Service"
        title={service.title}
        description={service.shortDesc || undefined}
      />

      <PageSection className="!pt-0" variant="mesh">
        <div className="mx-auto max-w-4xl">
          <FadeInUp>
            <div className="prose-custom mb-16 rounded-3xl border bg-card/80 p-8 text-lg leading-relaxed backdrop-blur-sm md:p-10">
              <p>{service.description}</p>
            </div>
          </FadeInUp>

          {features.length > 0 && (
            <FadeInUp className="mb-16">
              <span className="section-label mb-5">Included</span>
              <h2 className="font-display mb-8 text-2xl font-bold md:text-3xl">
                What&apos;s <span className="text-gradient">included</span>
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 rounded-2xl border bg-card/80 p-5 backdrop-blur-sm transition-colors hover:border-primary/20"
                  >
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </FadeInUp>
          )}

          {process.length > 0 && (
            <FadeInUp className="mb-16">
              <span className="section-label mb-5">Process</span>
              <h2 className="font-display mb-8 text-2xl font-bold md:text-3xl">Our process</h2>
              <div className="space-y-4">
                {process.map((step) => (
                  <div
                    key={step.step}
                    className="flex gap-5 rounded-2xl border bg-card/80 p-6 backdrop-blur-sm card-hover-lift"
                  >
                    <div className="font-display text-3xl font-bold text-primary/25">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-display mb-1 font-semibold">{step.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeInUp>
          )}

          {pricing.length > 0 && (
            <FadeInUp className="mb-16">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="section-label mb-4">Pricing</span>
                  <h2 className="font-display text-2xl font-bold md:text-3xl">
                    Choose your <span className="text-gradient">plan</span>
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click a plan card to select your package
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/pricing?service=${slug}`}>Compare all plans</Link>
                </Button>
              </div>
              <ServicePlanCards
                serviceSlug={slug}
                plans={pricing}
                variant="service"
                initialPlan={plan}
                showHint={false}
              />
            </FadeInUp>
          )}

          {faqs.length > 0 && (
            <FadeInUp className="mb-16">
              <span className="section-label mb-5">FAQ</span>
              <h2 className="font-display mb-8 text-2xl font-bold md:text-3xl">Common questions</h2>
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="rounded-2xl border bg-card/80 px-6 backdrop-blur-sm data-[state=open]:border-primary/25"
                  >
                    <AccordionTrigger className="py-5 text-left font-display font-medium hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </FadeInUp>
          )}

          <FadeInUp className="text-center">
            <Button variant="gradient" size="lg" asChild>
              <Link href="/contact">
                Get started
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </FadeInUp>
        </div>
      </PageSection>

      <CTASection />
    </>
  );
}
