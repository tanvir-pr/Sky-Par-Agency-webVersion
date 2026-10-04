import { Zap, Users, DollarSign, Headphones } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { CounterAnimation, FadeInUp, StaggerContainer } from "@/components/animations/motion";

const features = [
  {
    title: "Fast Delivery",
    description:
      "Agile sprints and clear milestones — shipped on time without cutting corners.",
    icon: Zap,
  },
  {
    title: "Senior Team",
    description:
      "Designers, engineers, and marketers with deep product experience.",
    icon: Users,
  },
  {
    title: "Clear Pricing",
    description:
      "Transparent packages and scopes — no surprise invoices mid-project.",
    icon: DollarSign,
  },
  {
    title: "Ongoing Support",
    description:
      "Post-launch care, maintenance, and iteration when you need it most.",
    icon: Headphones,
  },
];

export function WhyChooseUs() {
  return (
    <section className="section-padding relative overflow-hidden bg-muted/40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,hsl(var(--primary)/0.08),transparent_50%)]" />
      <div className="container-custom relative">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <FadeInUp>
            <SectionHeading
              label="Why choose us"
              title={
                <>
                  A partner obsessed with{" "}
                  <span className="text-gradient">your outcomes</span>
                </>
              }
              description="We blend creative direction with engineering rigor — so every pixel, line of code, and campaign drives real business impact."
              align="left"
              className="mb-8"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="glow-ring rounded-2xl border bg-card p-6">
                <div className="font-display text-4xl font-bold text-gradient">
                  <CounterAnimation value={98} suffix="%" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Client satisfaction</p>
              </div>
              <div className="glow-ring rounded-2xl border bg-card p-6">
                <div className="font-display text-4xl font-bold text-gradient">24/7</div>
                <p className="mt-1 text-sm text-muted-foreground">Support available</p>
              </div>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <FadeInUp key={feature.title}>
                <article className="group h-full rounded-2xl border bg-card/80 p-6 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-cyan-500/10 text-primary transition-all group-hover:from-primary group-hover:to-cyan-500 group-hover:text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              </FadeInUp>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
