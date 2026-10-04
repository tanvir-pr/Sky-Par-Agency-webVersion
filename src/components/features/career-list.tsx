"use client";

import Link from "next/link";
import { MapPin, Clock, DollarSign, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeInUp, StaggerContainer } from "@/components/animations/motion";

export interface CareerItem {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  salary: string | null;
}

export function CareerList({ careers }: { careers: CareerItem[] }) {
  if (careers.length === 0) {
    return (
      <div className="glow-ring rounded-3xl border bg-card/80 py-16 text-center backdrop-blur-sm">
        <p className="mb-4 text-lg text-muted-foreground">
          No open positions at the moment.
        </p>
        <p className="text-sm text-muted-foreground">
          Send your resume to careers@nexusdigital.com and we&apos;ll keep you in mind.
        </p>
      </div>
    );
  }

  return (
    <StaggerContainer className="space-y-4">
      {careers.map((career) => (
        <FadeInUp key={career.id}>
          <Link href={`/careers/${career.slug}`} prefetch>
            <article className="group rounded-3xl border bg-card/80 p-6 backdrop-blur-sm transition-all duration-500 card-hover-lift hover:border-primary/25 md:p-8">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/10">
                    {career.department}
                  </Badge>
                  <h2 className="font-display mb-2 text-xl font-semibold transition-colors group-hover:text-primary md:text-2xl">
                    {career.title}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary/70" /> {career.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary/70" /> {career.type}
                    </span>
                    {career.salary && (
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-primary/70" /> {career.salary}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-background transition-all group-hover:border-primary/30 group-hover:bg-primary group-hover:text-white">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
            </article>
          </Link>
        </FadeInUp>
      ))}
    </StaggerContainer>
  );
}
