import { PROCESS_STEPS } from "@/lib/constants";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeInUp, StaggerContainer } from "@/components/animations/motion";

export function ProcessSection() {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <SectionHeading
          label="Our process"
          title={
            <>
              A clear path from <span className="text-gradient">idea to impact</span>
            </>
          }
          description="Six proven steps that keep projects on track, stakeholders aligned, and launches stress-free."
        />

        <StaggerContainer className="relative">
          <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent md:left-1/2 md:block md:-translate-x-px" />

          <div className="space-y-6 md:space-y-8">
            {PROCESS_STEPS.map((step, i) => (
              <FadeInUp key={step.step}>
                <div
                  className={`relative flex flex-col gap-6 md:flex-row md:items-center ${
                    i % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="hidden md:block md:w-1/2" />
                  <div
                    className={`md:w-1/2 ${
                      i % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"
                    }`}
                  >
                    <article className="group rounded-3xl border bg-card p-8 transition-all duration-500 card-hover-lift">
                      <div className="font-display mb-3 text-5xl font-bold text-primary/15 transition-colors group-hover:text-primary/25">
                        {step.step}
                      </div>
                      <h3 className="font-display mb-3 text-xl font-semibold">
                        {step.title}
                      </h3>
                      <p className="leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </article>
                  </div>
                  <div className="absolute left-8 top-8 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-background bg-primary shadow-lg shadow-primary/40 md:left-1/2 md:block" />
                </div>
              </FadeInUp>
            ))}
          </div>
        </StaggerContainer>
      </div>
    </section>
  );
}
