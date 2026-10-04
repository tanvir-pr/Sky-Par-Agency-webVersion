"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeInUp } from "@/components/animations/motion";

export function CTASection() {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <FadeInUp>
          <div className="relative overflow-hidden rounded-[2rem] bg-[#06070c] px-8 py-16 text-white md:px-16 md:py-20 grain">
            <div className="absolute inset-0 bg-hero-mesh opacity-70" />
            <motion.div
              className="absolute -left-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/30 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 6, repeat: Infinity }}
            />
            <motion.div
              className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl"
              animate={{ scale: [1.1, 1, 1.1] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />

            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <span className="mb-6 inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Let&apos;s build together
              </span>
              <h2 className="font-display mb-6 text-3xl font-bold md:text-4xl lg:text-5xl lg:leading-tight">
                Ready to launch something{" "}
                <span className="text-gradient">extraordinary?</span>
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-white/65">
                Book a free strategy session. We&apos;ll map your goals, timeline,
                and the fastest path to results.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  className="h-14 bg-white px-8 text-base text-foreground hover:bg-white/90"
                  asChild
                >
                  <Link href="/consultation">
                    <Calendar className="h-5 w-5" />
                    Book free strategy call
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-white/20 bg-white/5 px-8 text-base text-white hover:bg-white/10 hover:text-white"
                  asChild
                >
                  <Link href="/contact">
                    Contact us
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
}
