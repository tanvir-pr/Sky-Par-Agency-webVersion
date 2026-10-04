import Link from "next/link";
import {
  Globe,
  Bot,
  Brain,
  Video,
  Image,
  Megaphone,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeInUp, StaggerContainer } from "@/components/animations/motion";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Globe,
  Bot,
  Brain,
  Video,
  Image,
  Megaphone,
};

interface Service {
  id: string;
  title: string;
  slug: string;
  shortDesc: string | null;
  icon: string | null;
}

interface ServicesOverviewProps {
  services: Service[];
}

const bentoSpans = [
  "md:col-span-2 md:row-span-2",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-2",
];

export function ServicesOverview({ services }: ServicesOverviewProps) {
  const displayServices =
    services.length > 0
      ? services.slice(0, 6)
      : [
          {
            id: "1",
            title: "Web Development",
            slug: "web-development",
            shortDesc:
              "Custom websites and web applications built with modern technologies.",
            icon: "Globe",
          },
          {
            id: "2",
            title: "Automation",
            slug: "automation",
            shortDesc:
              "Streamline workflows with intelligent business automation solutions.",
            icon: "Bot",
          },
          {
            id: "3",
            title: "AI Integrations",
            slug: "ai-integrations",
            shortDesc:
              "Leverage AI to transform your business processes and customer experience.",
            icon: "Brain",
          },
          {
            id: "4",
            title: "Video Editing",
            slug: "video-editing",
            shortDesc:
              "Professional video editing for YouTube, ads, and social media.",
            icon: "Video",
          },
          {
            id: "5",
            title: "Photo Editing",
            slug: "photo-editing",
            shortDesc:
              "Expert retouching, product editing, and creative graphics.",
            icon: "Image",
          },
          {
            id: "6",
            title: "Digital Marketing",
            slug: "digital-marketing",
            shortDesc:
              "SEO, PPC, and social media strategies that drive results.",
            icon: "Megaphone",
          },
        ];

  return (
    <section className="section-padding mesh-bg relative overflow-hidden">
      <div className="container-custom relative">
        <SectionHeading
          label="Our Services"
          title={
            <>
              Crafted solutions that{" "}
              <span className="text-gradient">scale with you</span>
            </>
          }
          description="From concept to launch — we design, build, and grow digital products that feel premium and perform."
        />

        <StaggerContainer className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 md:grid-cols-4">
          {displayServices.map((service, index) => {
            const Icon = iconMap[service.icon || "Globe"] || Globe;
            const isFeatured = index === 0;

            return (
              <FadeInUp key={service.id} className={cn(bentoSpans[index])}>
                <Link href={`/services/${service.slug}`} className="block h-full">
                  <article
                    className={cn(
                      "group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card/80 p-6 backdrop-blur-sm transition-all duration-500 card-hover-lift",
                      isFeatured && "md:p-8"
                    )}
                  >
                    <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-all duration-500 group-hover:bg-primary/20" />
                    <div
                      className={cn(
                        "relative mb-5 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/10 text-primary transition-all duration-500 group-hover:scale-110 group-hover:from-primary group-hover:to-cyan-500 group-hover:text-white",
                        isFeatured ? "h-16 w-16" : "h-14 w-14"
                      )}
                    >
                      <Icon className={isFeatured ? "h-8 w-8" : "h-7 w-7"} />
                    </div>
                    <h3
                      className={cn(
                        "font-display relative font-semibold transition-colors group-hover:text-primary",
                        isFeatured ? "text-2xl md:text-3xl" : "text-xl"
                      )}
                    >
                      {service.title}
                    </h3>
                    <p
                      className={cn(
                        "relative mt-3 flex-1 leading-relaxed text-muted-foreground",
                        isFeatured ? "text-base" : "text-sm"
                      )}
                    >
                      {service.shortDesc}
                    </p>
                    <span className="relative mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Explore service
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </article>
                </Link>
              </FadeInUp>
            );
          })}
        </StaggerContainer>

        <FadeInUp className="mt-12 text-center">
          <Button variant="glow" size="lg" asChild>
            <Link href="/services">View all services</Link>
          </Button>
        </FadeInUp>
      </div>
    </section>
  );
}
