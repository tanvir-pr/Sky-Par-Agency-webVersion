import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ContactForm } from "@/components/forms/contact-form";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { AuditForm } from "@/components/forms/audit-form";
import { QuoteForm } from "@/components/forms/quote-form";
import { SupportForm } from "@/components/forms/support-form";
import { BookingForm } from "@/components/forms/booking-form";
import { FadeInUp } from "@/components/animations/motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentCard, IconBox, PageSection } from "@/components/ui/page-section";
import { SITE_CONFIG } from "@/lib/constants";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Contact Us",
  description: "Get in touch with our digital agency. We'd love to hear about your project.",
  path: "/contact",
});

const contactItems = [
  { icon: Mail, title: "Email us", value: SITE_CONFIG.email },
  { icon: Phone, title: "Call us", value: SITE_CONFIG.phone },
  { icon: MapPin, title: "Visit us", value: SITE_CONFIG.address },
  { icon: Clock, title: "Business hours", value: "Mon - Fri: 9AM - 6PM PST" },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        badge="Contact"
        title="Let's start a conversation"
        description="Have a project in mind? Send us a message and we'll respond within 24 hours."
      />

      <PageSection className="!pt-0" variant="mesh">
        <div className="grid gap-12 lg:grid-cols-3">
          <FadeInUp className="space-y-4">
            {contactItems.map((item) => (
              <ContentCard key={item.title} className="group flex items-start gap-4 p-5" glow>
                <IconBox icon={item.icon} />
                <div>
                  <h3 className="font-display font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.value}</p>
                </div>
              </ContentCard>
            ))}
          </FadeInUp>

          <FadeInUp delay={0.15} className="lg:col-span-2">
            <ContentCard className="glow-ring p-6 md:p-10" hover={false}>
              <Tabs defaultValue="contact">
                <TabsList className="mb-8 h-auto w-full flex-wrap justify-start gap-2 rounded-2xl border bg-muted/50 p-2">
                  <TabsTrigger value="contact" className="rounded-xl px-5">General</TabsTrigger>
                  <TabsTrigger value="inquiry" className="rounded-xl px-5">Project inquiry</TabsTrigger>
                  <TabsTrigger value="quote" className="rounded-xl px-5">Get quote</TabsTrigger>
                  <TabsTrigger value="booking" className="rounded-xl px-5">Book consultation</TabsTrigger>
                  <TabsTrigger value="support" className="rounded-xl px-5">Support</TabsTrigger>
                  <TabsTrigger value="audit" className="rounded-xl px-5">Free audit</TabsTrigger>
                </TabsList>
                <TabsContent value="contact">
                  <ContactForm />
                </TabsContent>
                <TabsContent value="inquiry">
                  <InquiryForm />
                </TabsContent>
                <TabsContent value="quote">
                  <QuoteForm />
                </TabsContent>
                <TabsContent value="booking">
                  <BookingForm />
                </TabsContent>
                <TabsContent value="support">
                  <SupportForm />
                </TabsContent>
                <TabsContent value="audit">
                  <AuditForm />
                </TabsContent>
              </Tabs>
            </ContentCard>
          </FadeInUp>
        </div>
      </PageSection>
    </>
  );
}
