import { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { FadeInUp } from "@/components/animations/motion";
import { ContentCard, PageSection } from "@/components/ui/page-section";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "Terms of service for our digital agency. Read our terms for using this website and purchasing our services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHeader
        badge="Legal"
        title="Terms of Service"
        description="Terms for using our website and services."
      />
      <PageSection className="!pt-0" variant="muted">
        <FadeInUp>
          <ContentCard className="mx-auto max-w-3xl p-8 md:p-10" hover={false}>
            <div className="prose-custom space-y-6 text-muted-foreground">
              <p className="text-sm">Last updated: {new Date().toLocaleDateString("en-US")}</p>
              <p>
                By accessing this website and using our services, you agree to these terms. Update
                this page with your agency&apos;s legal terms before going live.
              </p>
              <h2 className="font-display text-xl font-semibold text-foreground">Services</h2>
              <p>
                We provide digital agency services including web development, automation, AI
                integrations, marketing, and related creative services as described on our website
                and in project agreements.
              </p>
              <h2 className="font-display text-xl font-semibold text-foreground">Payments</h2>
              <p>
                Deposits and milestone payments are outlined in pricing plans and invoices. Project
                work begins after agreed deposit payment unless otherwise stated in writing.
              </p>
              <h2 className="font-display text-xl font-semibold text-foreground">Contact</h2>
              <p>
                Questions about these terms? Reach us via our{" "}
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
