import { Star, Quote } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { CTASection } from "@/components/sections/cta-section";
import { FadeInUp, StaggerContainer } from "@/components/animations/motion";
import { ContentCard, PageSection } from "@/components/ui/page-section";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCachedAllTestimonials } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "Testimonials",
  description: "Read what our clients say about working with our digital agency.",
  path: "/testimonials",
});

const fallback = [
  { id: "1", clientName: "Sarah Johnson", company: "TechCorp", role: "CEO", rating: 5, review: "Nexus Digital transformed our online presence completely. Their team delivered a stunning website that increased our conversions by 150%.", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { id: "2", clientName: "Michael Chen", company: "InnovateLab", role: "Founder", rating: 5, review: "The automation solutions they built saved us 20+ hours per week. Professional, responsive, and truly understand business needs.", videoUrl: null },
  { id: "3", clientName: "Emily Rodriguez", company: "GrowthHub", role: "Marketing Director", rating: 5, review: "Outstanding digital marketing results. Our organic traffic tripled in 6 months.", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  { id: "4", clientName: "David Park", company: "DataFlow", role: "CTO", rating: 5, review: "Exceptional technical expertise. They built our SaaS platform on time and under budget.", videoUrl: null },
  { id: "5", clientName: "Lisa Wang", company: "CloudNine", role: "Product Manager", rating: 5, review: "Their AI integration work was groundbreaking for our product. Highly recommended!", videoUrl: null },
  { id: "6", clientName: "James Miller", company: "PixelPerfect", role: "Creative Director", rating: 5, review: "The video editing quality exceeded our expectations. Professional and creative team.", videoUrl: null },
];

export default async function TestimonialsPage() {
  const testimonials = await getCachedAllTestimonials().catch(() => []);
  const display = testimonials.length > 0 ? testimonials : fallback;
  const videoTestimonials = display.filter((t) => t.videoUrl);
  const textTestimonials = display.filter((t) => !t.videoUrl);

  return (
    <>
      <PageHeader
        badge="Testimonials"
        title="Client success stories"
        description="Don't just take our word for it — hear from teams we've helped grow."
      />

      <PageSection className="!pt-0" variant="mesh">
        {videoTestimonials.length > 0 && (
          <div className="mb-16">
            <SectionHeading
              label="Video"
              title={
                <>
                  Hear it <span className="text-gradient">directly</span>
                </>
              }
              align="left"
              className="mb-10"
            />
            <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {videoTestimonials.map((t) => (
                <FadeInUp key={t.id}>
                  <ContentCard className="overflow-hidden" hover={false}>
                    <div className="aspect-video bg-muted">
                      <iframe
                        src={t.videoUrl!}
                        title={`${t.clientName} testimonial`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-6">
                      <div className="mb-2 flex gap-1">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <div className="font-display font-semibold">{t.clientName}</div>
                      <div className="text-sm text-muted-foreground">
                        {t.role}{t.company ? `, ${t.company}` : ""}
                      </div>
                    </div>
                  </ContentCard>
                </FadeInUp>
              ))}
            </StaggerContainer>
          </div>
        )}

        <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(videoTestimonials.length > 0 ? textTestimonials : display).map((t) => (
            <FadeInUp key={t.id}>
              <ContentCard className="relative h-full p-8" glow>
                <Quote className="absolute right-6 top-6 h-10 w-10 text-primary/10" />
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  &ldquo;{t.review}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t pt-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-500 font-display text-sm font-bold text-white">
                    {t.clientName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{t.clientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {t.role}{t.company ? `, ${t.company}` : ""}
                    </div>
                  </div>
                </div>
              </ContentCard>
            </FadeInUp>
          ))}
        </StaggerContainer>
      </PageSection>

      <CTASection />
    </>
  );
}
