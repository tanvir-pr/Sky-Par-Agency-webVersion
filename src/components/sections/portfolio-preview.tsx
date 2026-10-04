import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeInUp, StaggerContainer } from "@/components/animations/motion";
import { cn } from "@/lib/utils";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  shortDesc: string | null;
  thumbnail: string;
  technologies: string[];
  category: string;
  liveUrl: string | null;
}

interface PortfolioPreviewProps {
  projects: PortfolioItem[];
}

export function PortfolioPreview({ projects }: PortfolioPreviewProps) {
  const displayProjects = projects.slice(0, 3);
  if (displayProjects.length === 0) return null;

  const [featured, ...rest] = displayProjects;

  return (
    <section className="section-padding">
      <div className="container-custom">
        <FadeInUp className="mb-14 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span className="section-label mb-5">Portfolio</span>
            <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl">
              Work that <span className="text-gradient">speaks loudly</span>
            </h2>
          </div>
          <Button variant="glow" asChild>
            <Link href="/portfolio">
              View all projects
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </FadeInUp>

        <StaggerContainer className="grid gap-6 lg:grid-cols-2">
          <FadeInUp className="lg:row-span-2">
            <ProjectCard project={featured} featured />
          </FadeInUp>
          {rest.map((project) => (
            <FadeInUp key={project.id}>
              <ProjectCard project={project} />
            </FadeInUp>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  featured = false,
}: {
  project: PortfolioItem;
  featured?: boolean;
}) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-3xl border bg-card card-hover-lift",
        featured ? "h-full min-h-[28rem]" : "min-h-[14rem]"
      )}
    >
      <div className={cn("relative overflow-hidden", featured ? "h-[55%]" : "h-full")}>
        <Image
          src={project.thumbnail}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-4 top-4 rounded-xl bg-white/90 p-2.5 opacity-0 shadow-lg transition-all group-hover:opacity-100"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
        {!featured && (
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <Badge className="mb-2 bg-white/15 text-white backdrop-blur-md">
              {project.category}
            </Badge>
            <h3 className="font-display text-xl font-semibold text-white">
              <Link href={`/portfolio/${project.slug}`}>{project.title}</Link>
            </h3>
          </div>
        )}
      </div>

      {featured && (
        <div className="flex flex-col p-6 md:p-8">
          <Badge variant="secondary" className="mb-3 w-fit">
            {project.category}
          </Badge>
          <h3 className="font-display mb-2 text-2xl font-bold transition-colors group-hover:text-primary md:text-3xl">
            <Link href={`/portfolio/${project.slug}`}>{project.title}</Link>
          </h3>
          <p className="mb-4 line-clamp-2 text-muted-foreground">{project.shortDesc}</p>
          <div className="mt-auto flex flex-wrap gap-2">
            {project.technologies.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
