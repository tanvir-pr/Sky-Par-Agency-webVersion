import { buildPageMetadata } from "@/lib/seo";
import {
  ArticleJsonLd,
  BreadcrumbJsonLd,
} from "@/components/seo/json-ld-schemas";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeInUp } from "@/components/animations/motion";
import { CTASection } from "@/components/sections/cta-section";
import { ContentCard, PageSection } from "@/components/ui/page-section";
import { formatDate } from "@/lib/utils";
import { getBlogBySlug } from "@/lib/data";

export const revalidate = 120;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  try {
    return await getBlogBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };
  return buildPageMetadata({
    title: post.title,
    description: post.excerpt || post.content.slice(0, 160),
    path: `/blog/${slug}`,
    image: post.thumbnail,
    type: "article",
  });
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article>
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt || post.content.slice(0, 160)}
        slug={slug}
        image={post.thumbnail}
        datePublished={post.createdAt.toISOString()}
        dateModified={post.updatedAt.toISOString()}
        authorName={post.author.name}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${slug}` },
        ]}
      />

      <PageSection className="!pb-8 !pt-32" variant="mesh">
        <div className="mx-auto max-w-3xl">
          <FadeInUp>
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
            {post.category && (
              <Badge variant="secondary" className="mb-4">
                {post.category}
              </Badge>
            )}
            <h1 className="font-display mb-6 text-4xl font-bold leading-tight md:text-5xl">
              {post.title}
            </h1>
            <div className="mb-8 flex items-center gap-4 text-sm text-muted-foreground">
              <span>By {post.author.name}</span>
              <span>•</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
            {post.thumbnail && (
              <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-[2rem] border glow-ring">
                <Image
                  src={post.thumbnail}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </FadeInUp>
        </div>
      </PageSection>

      <PageSection className="!pt-0" variant="default">
        <div className="mx-auto max-w-3xl">
          <FadeInUp>
            <ContentCard className="p-8 md:p-10" hover={false}>
              <div
                className="prose-custom"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </ContentCard>
          </FadeInUp>

          {post.tags.length > 0 && (
            <FadeInUp className="mt-10 border-t pt-8">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </FadeInUp>
          )}
        </div>
      </PageSection>

      <CTASection />
    </article>
  );
}
