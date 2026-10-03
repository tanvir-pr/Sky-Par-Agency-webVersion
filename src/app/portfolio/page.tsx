import { PageHeader } from "@/components/layout/page-header";
import { CTASection } from "@/components/sections/cta-section";
import { PortfolioGrid } from "@/components/features/portfolio-grid";
import { PageSection } from "@/components/ui/page-section";
import { getCachedAllPortfolio } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "Portfolio",
  description: "Explore our portfolio of web development, automation, marketing, and creative projects.",
  path: "/portfolio",
});

export default async function PortfolioPage() {
  const projects = await getCachedAllPortfolio();

  return (
    <>
      <PageHeader
        badge="Portfolio"
        title="Our latest work"
        description="Explore our portfolio of successful projects across web development, automation, marketing, and more."
      />
      <PageSection className="!pt-0" variant="mesh">
        <PortfolioGrid projects={projects} />
      </PageSection>
      <CTASection />
    </>
  );
}
