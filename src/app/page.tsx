import {
  getCachedServices,
  getCachedFeaturedPortfolio,
  getCachedFeaturedTestimonials,
} from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";
import { HeroSection } from "@/components/sections/hero-section";
import { TrustedBySection } from "@/components/sections/trusted-by-section";
import { ServicesOverview } from "@/components/sections/services-overview";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { PortfolioPreview } from "@/components/sections/portfolio-preview";
import { ProcessSection } from "@/components/sections/process-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { FAQSection } from "@/components/sections/faq-section";
import { CTASection } from "@/components/sections/cta-section";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "Digital Agency — Web Development, AI & Marketing",
  description:
    "Full-service digital agency for web development, automation, AI integrations, video editing, and digital marketing.",
  path: "/",
});

export default async function HomePage() {
  const [services, projects, testimonials] = await Promise.all([
    getCachedServices(),
    getCachedFeaturedPortfolio(),
    getCachedFeaturedTestimonials(),
  ]);

  return (
    <>
      <HeroSection />
      <TrustedBySection />
      <ServicesOverview services={services} />
      <WhyChooseUs />
      <PortfolioPreview projects={projects} />
      <ProcessSection />
      <TestimonialsSection testimonials={testimonials} />
      <FAQSection />
      <CTASection />
    </>
  );
}
