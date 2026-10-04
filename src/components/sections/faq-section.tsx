import { FAQ_ITEMS } from "@/lib/constants";
import { FaqJsonLd } from "@/components/seo/json-ld-schemas";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FadeInUp } from "@/components/animations/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageSection } from "@/components/ui/page-section";

export function FAQSection() {
  return (
    <PageSection variant="muted" id="faq">
      <FaqJsonLd items={FAQ_ITEMS} />
      <SectionHeading
        label="FAQ"
        title={
          <>
            Questions? <span className="text-gradient">We&apos;ve got answers.</span>
          </>
        }
        description="Everything you need to know about working with our team."
      />

      <FadeInUp className="mx-auto max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="glow-ring rounded-2xl border bg-card/90 px-6 backdrop-blur-sm transition-all data-[state=open]:border-primary/25 data-[state=open]:shadow-lg data-[state=open]:shadow-primary/5"
            >
              <AccordionTrigger className="py-5 text-left font-display font-medium hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </FadeInUp>
    </PageSection>
  );
}
