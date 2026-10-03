import { buildPageMetadata } from "@/lib/seo";
import {
  BreadcrumbJsonLd,
  CreativeWorkJsonLd,
} from "@/components/seo/json-ld-schemas";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeInUp } from "@/components/animations/motion";
import { CTASection } from "@/components/sections/cta-section";
import { ContentCard, PageSection } from "@/components/ui/page-section";
import { getPortfolioBySlug } from "@/lib/data";

export const revalidate = 120;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProject(slug: string) {
  try {
    return await getPortfolioBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project Not Found" };
  return buildPageMetadata({
    title: project.title,
    description: project.shortDesc || project.description.slice(0, 160),
    path: `/portfolio/${slug}`,
    image: project.thumbnail,
  });
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <>
      <CreativeWorkJsonLd
        title={project.title}
        description={project.shortDesc || project.description.slice(0, 200)}
        slug={slug}
        image={project.thumbnail}
        category={project.category}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Portfolio", path: "/portfolio" },
          { name: project.title, path: `/portfolio/${slug}` },
        ]}
      />

      <PageSection className="!pb-8 !pt-32" variant="mesh">
        <FadeInUp>
          <Link
            href="/portfolio"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to portfolio
          </Link>
          <Badge variant="secondary" className="mb-4">
            {project.category}
          </Badge>
          <h1 className="font-display mb-4 text-4xl font-bold md:text-5xl">
            {project.title}
          </h1>
          <p className="mb-6 max-w-2xl text-lg text-muted-foreground">
            {project.shortDesc}
          </p>
          <div className="mb-6 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
          </div>
          {project.liveUrl && (
            <Button variant="gradient" asChild>
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                View live project
              </a>
            </Button>
          )}
        </FadeInUp>
      </PageSection>

      <PageSection className="!pt-0" variant="default">
        <FadeInUp>
          <div className="relative mb-12 aspect-[16/8] overflow-hidden rounded-[2rem] border glow-ring">
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </FadeInUp>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <FadeInUp>
              <span className="section-label mb-4">Overview</span>
              <h2 className="font-display mb-4 text-2xl font-bold">Project overview</h2>
              <p className="leading-relaxed text-muted-foreground">{project.description}</p>
            </FadeInUp>

            {project.challenge && (
              <FadeInUp>
                <span className="section-label mb-4">Challenge</span>
                <h2 className="font-display mb-4 text-2xl font-bold">The challenge</h2>
                <p className="leading-relaxed text-muted-foreground">{project.challenge}</p>
              </FadeInUp>
            )}

            {project.solution && (
              <FadeInUp>
                <span className="section-label mb-4">Solution</span>
                <h2 className="font-display mb-4 text-2xl font-bold">Our solution</h2>
                <p className="leading-relaxed text-muted-foreground">{project.solution}</p>
              </FadeInUp>
            )}

            {project.gallery.length > 0 && (
              <FadeInUp>
                <span className="section-label mb-4">Gallery</span>
                <h2 className="font-display mb-6 text-2xl font-bold">Screenshots</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {project.gallery.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-video overflow-hidden rounded-2xl border"
                    >
                      <Image
                        src={img}
                        alt={`Screenshot ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </FadeInUp>
            )}
          </div>

          <div>
            {project.results && (
              <FadeInUp>
                <ContentCard className="sticky top-28 border-primary/20 bg-primary/5 p-8" glow>
                  <h3 className="font-display mb-5 text-xl font-bold">Results</h3>
                  <div className="space-y-3">
                    {project.results.split("\n").map((result) => (
                      <div key={result} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm">{result}</span>
                      </div>
                    ))}
                  </div>
                </ContentCard>
              </FadeInUp>
            )}
          </div>
        </div>
      </PageSection>

      <CTASection />
    </>
  );
}
