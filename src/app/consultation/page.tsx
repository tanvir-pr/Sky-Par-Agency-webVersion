import { Calendar, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FadeInUp } from "@/components/animations/motion";
import { ContentCard, IconBox, PageSection } from "@/components/ui/page-section";
import { getCachedSettings } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Book a Consultation",
  description: "Schedule a free strategy call with our digital experts.",
  path: "/consultation",
});

export const revalidate = 300;

const benefits = [
  "Free 30-minute strategy session",
  "Personalized project roadmap",
  "No-obligation quote",
  "Expert recommendations",
];

export default async function ConsultationPage() {
  const settings = await getCachedSettings();
  const calendlyUrl =
    settings.calendlyUrl ||
    process.env.NEXT_PUBLIC_CALENDLY_URL ||
    "https://calendly.com";

  return (
    <>
      <PageHeader
        badge="Consultation"
        title="Book your free strategy call"
        description="Schedule a complimentary consultation to discuss your goals and get personalized recommendations."
      />

      <PageSection className="!pt-0" variant="mesh">
        <div className="grid gap-12 lg:grid-cols-3">
          <FadeInUp className="space-y-6">
            <div>
              <span className="section-label mb-5">What to expect</span>
              <h2 className="font-display mb-6 text-2xl font-bold">
                Clarity in <span className="text-gradient">30 minutes</span>
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <ContentCard className="border-primary/20 bg-primary/5 p-6" glow>
              <IconBox icon={Calendar} className="mb-4" />
              <h3 className="font-display mb-2 font-semibold">Flexible scheduling</h3>
              <p className="text-sm text-muted-foreground">
                Choose a time that works for you. We offer consultations across all time
                zones.
              </p>
            </ContentCard>
          </FadeInUp>

          <FadeInUp delay={0.1} className="lg:col-span-2">
            <ContentCard className="overflow-hidden glow-ring" hover={false}>
              <div className="aspect-[4/3] min-h-[500px] md:aspect-[16/10]">
                <iframe
                  src={calendlyUrl}
                  className="h-full w-full border-0"
                  title="Schedule a consultation"
                  loading="lazy"
                />
              </div>
            </ContentCard>
          </FadeInUp>
        </div>
      </PageSection>
    </>
  );
}
