import { PageHeader } from "@/components/layout/page-header";
import { CTASection } from "@/components/sections/cta-section";
import { BlogList } from "@/components/features/blog-list";
import { PageSection } from "@/components/ui/page-section";
import { getCachedBlogPosts } from "@/lib/data";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 120;

export const metadata = buildPageMetadata({
  title: "Blog",
  description: "Insights on web development, digital marketing, automation, and technology trends.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getCachedBlogPosts();

  return (
    <>
      <PageHeader
        badge="Blog"
        title="Insights & updates"
        description="Stay ahead with the latest trends in web development, digital marketing, and technology."
      />
      <PageSection className="!pt-0" variant="mesh">
        <BlogList posts={posts} />
      </PageSection>
      <CTASection />
    </>
  );
}
