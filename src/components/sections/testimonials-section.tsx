"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeInUp } from "@/components/animations/motion";

interface Testimonial {
  id: string;
  clientName: string;
  company: string | null;
  role: string | null;
  image: string | null;
  rating: number;
  review: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [current, setCurrent] = useState(0);
  const items =
    testimonials.length > 0
      ? testimonials
      : [
          {
            id: "1",
            clientName: "Sarah Johnson",
            company: "TechCorp",
            role: "CEO",
            image: null,
            rating: 5,
            review:
              "Nexus Digital transformed our online presence completely. Their team delivered a stunning website that increased our conversions by 150%.",
          },
          {
            id: "2",
            clientName: "Michael Chen",
            company: "InnovateLab",
            role: "Founder",
            image: null,
            rating: 5,
            review:
              "The automation solutions they built saved us 20+ hours per week. Professional, responsive, and truly understand business needs.",
          },
          {
            id: "3",
            clientName: "Emily Rodriguez",
            company: "GrowthHub",
            role: "Marketing Director",
            image: null,
            rating: 5,
            review:
              "Outstanding digital marketing results. Our organic traffic tripled in 6 months. Highly recommend their SEO services.",
          },
        ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  return (
    <section className="section-padding mesh-bg relative overflow-hidden">
      <div className="container-custom relative">
        <SectionHeading
          label="Testimonials"
          title={
            <>
              Loved by teams who{" "}
              <span className="text-gradient">ship fast</span>
            </>
          }
        />

        <FadeInUp className="mx-auto max-w-4xl">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -24, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <article className="glow-ring relative overflow-hidden rounded-3xl border bg-card/90 p-10 backdrop-blur-sm md:p-14">
                  <Quote className="absolute right-8 top-8 h-16 w-16 text-primary/10" />
                  <div className="mb-6 flex gap-1">
                    {Array.from({ length: items[current].rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="font-display relative text-xl leading-relaxed md:text-2xl md:leading-relaxed">
                    &ldquo;{items[current].review}&rdquo;
                  </p>
                  <div className="mt-8 flex items-center gap-4 border-t pt-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-500 font-display text-lg font-bold text-white">
                      {items[current].clientName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{items[current].clientName}</div>
                      <div className="text-sm text-muted-foreground">
                        {items[current].role}
                        {items[current].company ? `, ${items[current].company}` : ""}
                      </div>
                    </div>
                  </div>
                </article>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() =>
                  setCurrent((prev) => (prev - 1 + items.length) % items.length)
                }
                className="rounded-full border p-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === current
                        ? "w-10 bg-primary"
                        : "w-2 bg-muted-foreground/25 hover:bg-muted-foreground/40"
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrent((prev) => (prev + 1) % items.length)}
                className="rounded-full border p-2.5 transition-colors hover:border-primary/30 hover:bg-primary/5"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
