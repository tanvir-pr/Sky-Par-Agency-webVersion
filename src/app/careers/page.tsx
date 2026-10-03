import { PageHeader } from "@/components/layout/page-header";
import { CTASection } from "@/components/sections/cta-section";
import { CareerList } from "@/components/features/career-list";
import { PageSection } from "@/components/ui/page-section";
import { getCachedCareers } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "Careers",
  description: "Join our team. Explore open roles in web development, design, marketing, and more.",
  path: "/careers",
});

export default async function CareersPage() {
  const careers = await getCachedCareers();

  return (
    <>
      <PageHeader
        badge="Careers"
        title="Join our team"
        description="We're always looking for talented individuals who are passionate about digital innovation."
      />
      <PageSection className="!pt-0" variant="mesh">
        <div className="mx-auto max-w-4xl">
          <CareerList careers={careers} />
        </div>
      </PageSection>
      <CTASection />
    </>
  );
}
