import Link from "next/link";
import {
  Globe, Bot, Brain, Video, Image, Megaphone, ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FadeInUp, StaggerContainer } from "@/components/animations/motion";
import { CTASection } from "@/components/sections/cta-section";
import { PageSection } from "@/components/ui/page-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCachedServices } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = buildPageMetadata({
  title: "Services",
  description:
    "Explore our digital services: web development, automation, AI integrations, video, photo editing, and marketing.",
  path: "/services",
});

const iconMap: Record<string, React.ElementType> = {
  Globe, Bot, Brain, Video, Image, Megaphone,
};

const bentoSpans = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-2",
];

export const revalidate = 120;

export default async function ServicesPage() {
  const services = await getCachedServices().catch(() => []);

  return (
    <>
      <PageHeader
        badge="Services"
        title="Digital solutions for every ambition"
        description="From concept to launch — end-to-end services that drive measurable business results."
      />

      <PageSection className="!pt-0" variant="mesh">
        <SectionHeading
          label="What we do"
          title={
            <>
              Full-stack capabilities, <span className="text-gradient">one team</span>
            </>
          }
          description="Pick a service to explore packages, process, and pricing."
        />

        <StaggerContainer className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 md:grid-cols-4">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon || "Globe"] || Globe;
            const isFeatured = index === 0;

            return (
              <FadeInUp key={service.id} className={cn(bentoSpans[index % bentoSpans.length])}>
                <Link href={`/services/${service.slug}`} className="block h-full">
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card/80 p-6 backdrop-blur-sm card-hover-lift md:p-8">
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />
                    <div
                      className={cn(
                        "relative mb-5 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/10 text-primary transition-all duration-500 group-hover:from-primary group-hover:to-cyan-500 group-hover:text-white",
                        isFeatured ? "h-16 w-16" : "h-14 w-14"
                      )}
                    >
                      <Icon className={isFeatured ? "h-8 w-8" : "h-7 w-7"} />
                    </div>
                    <h2
                      className={cn(
                        "font-display relative font-semibold transition-colors group-hover:text-primary",
                        isFeatured ? "text-2xl md:text-3xl" : "text-xl"
                      )}
                    >
                      {service.title}
                    </h2>
                    <p className="relative mt-3 flex-1 text-sm leading-relaxed text-muted-foreground md:text-base">
                      {service.shortDesc || service.description.slice(0, 150)}
                    </p>
                    <span className="relative mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      View details
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </article>
                </Link>
              </FadeInUp>
            );
          })}
        </StaggerContainer>
      </PageSection>

      <CTASection />
    </>
  );
}
