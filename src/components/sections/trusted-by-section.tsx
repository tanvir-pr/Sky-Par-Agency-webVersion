"use client";

import { CLIENT_LOGOS } from "@/lib/constants";
import { Marquee } from "@/components/animations/motion";

export function TrustedBySection() {
  return (
    <section className="overflow-hidden border-y border-border/60 bg-background py-10">
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        Trusted by innovative teams worldwide
      </p>
      <Marquee className="py-2">
        {CLIENT_LOGOS.map((logo) => (
          <span
            key={logo}
            className="shrink-0 font-display text-2xl font-bold text-muted-foreground/30 transition-colors hover:text-muted-foreground/60"
          >
            {logo}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
