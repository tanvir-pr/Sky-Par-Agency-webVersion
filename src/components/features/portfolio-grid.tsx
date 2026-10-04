"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeInUp, StaggerContainer } from "@/components/animations/motion";
import { PORTFOLIO_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  shortDesc: string | null;
  thumbnail: string;
  technologies: string[];
  category: string;
  liveUrl: string | null;
}


export function PortfolioGrid({ projects }: { projects: PortfolioItem[] }) {
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <>
      <FadeInUp className="mb-12 flex justify-center">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="h-auto flex-wrap gap-2 rounded-2xl border bg-card/80 p-2 backdrop-blur-sm">
            {PORTFOLIO_CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="rounded-xl px-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </FadeInUp>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No projects found in this category.
        </p>
      ) : (
        <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, i) => (
            <FadeInUp key={project.id}>
              <article
                className={cn(
                  "group relative overflow-hidden rounded-3xl border bg-card card-hover-lift",
                  i === 0 && filtered.length > 2 && "md:col-span-2 md:row-span-1"
                )}
              >
                <div
                  className={cn(
                    "relative overflow-hidden",
                    i === 0 && filtered.length > 2 ? "aspect-[21/9]" : "aspect-[16/10]"
                  )}
                >
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-4 top-4 rounded-xl bg-white/90 p-2.5 opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <Badge className="mb-2 bg-white/15 text-white backdrop-blur-md">
                      {project.category}
                    </Badge>
                    <h3 className="font-display text-xl font-semibold text-white md:text-2xl">
                      <Link href={`/portfolio/${project.slug}`} prefetch>
                        {project.title}
                      </Link>
                    </h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {project.shortDesc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </article>
            </FadeInUp>
          ))}
        </StaggerContainer>
      )}
    </>
  );
}
