import { Search, CheckCircle, BarChart3, Zap, Shield } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { AuditForm } from "@/components/forms/audit-form";
import { CTASection } from "@/components/sections/cta-section";
import { FadeInUp, StaggerContainer } from "@/components/animations/motion";
import { ContentCard, IconBox, PageSection } from "@/components/ui/page-section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Free Website Audit",
  description: "Get a free SEO, performance, and UX audit of your website from our experts.",
  path: "/audit",
});

const auditIncludes = [
  { icon: Search, title: "SEO Analysis", desc: "Keywords, meta tags, indexing issues" },
  { icon: Zap, title: "Performance Check", desc: "Page speed, Core Web Vitals, load time" },
  { icon: BarChart3, title: "UX Review", desc: "Navigation, conversion paths, mobile experience" },
  { icon: Shield, title: "Security Scan", desc: "SSL, headers, basic vulnerability check" },
];

const perks = [
  "100% free, no obligation",
  "Detailed PDF report",
  "Actionable recommendations",
  "48-hour turnaround",
];

export default function AuditPage() {
  return (
    <>
      <PageHeader
        badge="Free Audit"
        title="Get your free website audit"
        description="Discover what's holding your website back. Our experts will analyze your site and send a detailed report within 48 hours."
      />

      <PageSection className="!pt-0" variant="mesh">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2">
          <div>
            <FadeInUp>
              <span className="section-label mb-5">What&apos;s included</span>
              <h2 className="font-display mb-8 text-3xl font-bold">
                A complete <span className="text-gradient">health check</span>
              </h2>
            </FadeInUp>
            <StaggerContainer className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {auditIncludes.map((item) => (
                <FadeInUp key={item.title}>
                  <ContentCard className="group p-5">
                    <IconBox icon={item.icon} className="mb-3" />
                    <h3 className="font-display mb-1 font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </ContentCard>
                </FadeInUp>
              ))}
            </StaggerContainer>
            <FadeInUp>
              <ul className="space-y-3">
                {perks.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeInUp>
          </div>

          <FadeInUp delay={0.1}>
            <ContentCard className="glow-ring p-6 md:p-8" hover={false}>
              <h2 className="font-display mb-6 text-xl font-bold">Request your free audit</h2>
              <AuditForm />
            </ContentCard>
          </FadeInUp>
        </div>
      </PageSection>

      <CTASection />
    </>
  );
}
