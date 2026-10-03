import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Target, Eye, Heart } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { FadeInUp, StaggerContainer } from "@/components/animations/motion";
import { CTASection } from "@/components/sections/cta-section";
import { ContentCard, IconBox, PageSection } from "@/components/ui/page-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { CORE_VALUES, ACHIEVEMENTS } from "@/lib/constants";
import { getCachedTeam } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "About Us",
  description: "Learn about our digital agency — story, mission, team, and values.",
  path: "/about",
});

export const revalidate = 120;

const valueIcons = [Heart, Target, Award, Eye];

export default async function AboutPage() {
  const team = await getCachedTeam().catch(() => []);

  return (
    <>
      <PageHeader
        badge="About Us"
        title="Building the future of digital"
        description="We're a passionate team of creators, developers, and strategists dedicated to helping businesses thrive in the digital age."
      />

      <PageSection className="!pt-0" variant="mesh">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <FadeInUp>
            <span className="section-label mb-5">Our story</span>
            <h2 className="font-display mb-6 text-3xl font-bold md:text-4xl">
              From studio to <span className="text-gradient">full-service partner</span>
            </h2>
            <div className="space-y-4 leading-relaxed text-muted-foreground">
              <p>
                Founded in 2019, we started with a simple mission: help businesses harness
                technology to achieve extraordinary results.
              </p>
              <p>
                What began as a small web development studio has evolved into a
                full-service digital agency serving clients across 20+ countries — over 200
                projects delivered, from startup MVPs to enterprise platforms.
              </p>
              <p>
                Our team combines technical expertise with creative vision, ensuring every
                project is not just functional, but exceptional.
              </p>
            </div>
          </FadeInUp>
          <FadeInUp delay={0.15}>
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border glow-ring">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                alt="Our team"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </FadeInUp>
        </div>
      </PageSection>

      <PageSection variant="muted">
        <SectionHeading
          label="Values"
          title={
            <>
              What <span className="text-gradient">drives us</span>
            </>
          }
          description="The principles behind every project we ship."
        />
        <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {CORE_VALUES.map((value, i) => {
            const Icon = valueIcons[i] || Heart;
            return (
              <FadeInUp key={value.title}>
                <ContentCard className="group h-full p-8 text-center">
                  <IconBox icon={Icon} size="lg" className="mx-auto mb-5" />
                  <h3 className="font-display mb-2 text-lg font-semibold">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </ContentCard>
              </FadeInUp>
            );
          })}
        </StaggerContainer>
      </PageSection>

      <PageSection>
        <SectionHeading
          label="Team"
          title={
            <>
              Meet the <span className="text-gradient">people</span> behind the work
            </>
          }
        />
        <StaggerContainer className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {(team.length > 0
            ? team
            : [
                { id: "1", name: "Alex Morgan", role: "CEO & Founder", image: "https://ui-avatars.com/api/?name=Alex+Morgan&size=200&background=0891b2&color=fff" },
                { id: "2", name: "Jordan Lee", role: "Lead Developer", image: "https://ui-avatars.com/api/?name=Jordan+Lee&size=200&background=0891b2&color=fff" },
                { id: "3", name: "Sam Taylor", role: "Creative Director", image: "https://ui-avatars.com/api/?name=Sam+Taylor&size=200&background=0891b2&color=fff" },
                { id: "4", name: "Casey Kim", role: "Marketing Head", image: "https://ui-avatars.com/api/?name=Casey+Kim&size=200&background=0891b2&color=fff" },
              ]
          ).map((member) => (
            <FadeInUp key={member.id}>
              <div className="group text-center">
                <div className="relative mx-auto mb-4 h-44 w-44 overflow-hidden rounded-[1.5rem] border transition-transform duration-500 group-hover:scale-105">
                  <Image
                    src={
                      member.image ||
                      `https://ui-avatars.com/api/?name=${member.name}&size=200&background=0891b2&color=fff`
                    }
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-display text-lg font-semibold">{member.name}</h3>
                <p className="text-sm text-primary">{member.role}</p>
              </div>
            </FadeInUp>
          ))}
        </StaggerContainer>
      </PageSection>

      <PageSection variant="mesh">
        <FadeInUp className="text-center">
          <span className="section-label mb-5">Recognition</span>
          <h2 className="font-display mb-8 text-3xl font-bold">Certifications & awards</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {ACHIEVEMENTS.map((achievement) => (
              <span
                key={achievement}
                className="rounded-full border bg-card/80 px-5 py-2.5 text-sm font-medium backdrop-blur-sm"
              >
                {achievement}
              </span>
            ))}
          </div>
          <div className="mt-12">
            <Button variant="gradient" size="lg" asChild>
              <Link href="/contact">
                Work with us
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </FadeInUp>
      </PageSection>

      <CTASection />
    </>
  );
}
