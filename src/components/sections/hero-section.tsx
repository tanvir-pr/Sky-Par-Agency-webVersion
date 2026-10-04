"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CounterAnimation,
  FloatingOrb,
  GlowBlob,
  TextReveal,
} from "@/components/animations/motion";
import { SITE_CONFIG, STATS } from "@/lib/constants";

const floatingCards = [
  { label: "Web Apps", color: "from-cyan-500/20 to-primary/10", delay: 0 },
  { label: "AI Automation", color: "from-violet-500/20 to-purple-500/10", delay: 0.15 },
  { label: "Brand Growth", color: "from-orange-500/15 to-rose-500/10", delay: 0.3 },
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#06070c] pt-24 text-white grain">
      <div className="absolute inset-0 bg-hero-mesh opacity-80" />
      <FloatingOrb className="left-[5%] top-24 h-[28rem] w-[28rem] bg-cyan-500/25 opacity-50" />
      <GlowBlob className="right-[8%] top-1/3 h-80 w-80 opacity-60" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_50%,transparent_100%)]" />

      <div className="container-custom relative z-10 py-16 md:py-24">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Award-winning digital studio
            </motion.div>

            <h1 className="font-display mb-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              <TextReveal text="We craft" delay={0.1} />
              <br />
              <span className="text-gradient">digital experiences</span>
              <br />
              <TextReveal text="that scale brands." delay={0.35} />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mb-10 max-w-xl text-lg leading-relaxed text-white/65 md:text-xl"
            >
              {SITE_CONFIG.tagline}. Strategy, design, development, and growth —
              delivered as one seamless team.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <Button variant="gradient" size="lg" asChild className="h-14 px-8 text-base">
                <Link href="/contact">
                  Start your project
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-14 border-white/15 bg-white/5 px-8 text-base text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/portfolio">
                  <Play className="h-4 w-4 fill-white" />
                  View our work
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-14 grid max-w-lg grid-cols-2 gap-6 border-t border-white/10 pt-10 md:grid-cols-4"
            >
              {STATS.map((stat, i) => (
                <div key={i}>
                  <div className="font-display text-3xl font-bold text-white md:text-4xl">
                    <CounterAnimation value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mt-1 text-sm text-white/50">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="relative hidden min-h-[32rem] lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto aspect-square max-w-md"
            >
              <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-white/10" />
              <div className="absolute inset-8 rounded-full border border-white/5 bg-white/[0.03] backdrop-blur-sm" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="glow-ring rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 text-center backdrop-blur-xl">
                  <div className="font-display text-5xl font-bold text-gradient">360°</div>
                  <p className="mt-2 text-sm text-white/60">Full-service digital partner</p>
                </div>
              </div>

              {floatingCards.map((card, i) => {
                const positions = [
                  "left-0 top-8",
                  "right-0 top-1/3",
                  "bottom-8 left-1/4",
                ];
                return (
                  <motion.div
                    key={card.label}
                    className={`absolute ${positions[i]} glass-dark rounded-2xl px-5 py-4`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: [0, -10, 0] }}
                    transition={{
                      opacity: { delay: 0.5 + card.delay, duration: 0.5 },
                      y: {
                        delay: 0.8 + card.delay,
                        duration: 4 + i,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                  >
                    <div
                      className={`mb-2 h-1.5 w-10 rounded-full bg-gradient-to-r ${card.color}`}
                    />
                    <p className="text-sm font-medium text-white/90">{card.label}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="h-10 w-6 rounded-full border border-white/20 p-1">
          <div className="mx-auto h-2 w-1 rounded-full bg-white/50" />
        </div>
      </motion.div>
    </section>
  );
}
