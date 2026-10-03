import { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { FadeInUp } from "@/components/animations/motion";
import { ContentCard, PageSection } from "@/components/ui/page-section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "Privacy policy for our digital agency website. Learn how we collect, use, and protect your personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        badge="Legal"
        title="Privacy Policy"
        description="How we handle and protect your data."
      />
      <PageSection className="!pt-0" variant="muted">
        <FadeInUp>
          <ContentCard className="mx-auto max-w-3xl p-8 md:p-10" hover={false}>
            <div className="prose-custom space-y-6 text-muted-foreground">
              <p className="text-sm">Last updated: {new Date().toLocaleDateString("en-US")}</p>
              <p>
                This privacy policy explains how we collect, use, disclose, and safeguard your
                information when you visit our website or use our services. Update this page with
                your agency&apos;s specific legal requirements before going live.
              </p>
              <h2 className="font-display text-xl font-semibold text-foreground">
                Information We Collect
              </h2>
              <p>
                We may collect personal information that you voluntarily provide when filling out
                contact forms, checkout requests, newsletter subscriptions, job applications, or
                consultation bookings — including name, email, phone, and company details.
              </p>
              <h2 className="font-display text-xl font-semibold text-foreground">
                How We Use Your Information
              </h2>
              <p>
                We use collected information to respond to inquiries, deliver services, process
                payments, send updates you requested, and improve our website experience.
              </p>
              <h2 className="font-display text-xl font-semibold text-foreground">Contact</h2>
              <p>
                For privacy-related questions, contact us through our{" "}
                <a href="/contact" className="text-primary hover:underline">
                  contact page
                </a>
                .
              </p>
            </div>
          </ContentCard>
        </FadeInUp>
      </PageSection>
    </>
  );
}
