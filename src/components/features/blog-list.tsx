"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeInUp, StaggerContainer } from "@/components/animations/motion";
import { formatDate } from "@/lib/utils";

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail: string | null;
  category: string | null;
  tags: string[];
  createdAt: Date | string;
  author: { name: string };
}

export function BlogList({ posts }: { posts: BlogPostItem[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(() => {
    const cats = new Set(posts.map((p) => p.category).filter(Boolean) as string[]);
    return ["All", ...Array.from(cats)];
  }, [posts]);

  const filtered = useMemo(
    () =>
      posts.filter((p) => {
        const matchSearch =
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.excerpt?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = category === "All" || p.category === category;
        return matchSearch && matchCategory;
      }),
    [posts, search, category]
  );

  return (
    <>
      <FadeInUp className="relative mx-auto mb-10 max-w-lg">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 rounded-2xl border-primary/10 bg-card/80 pl-11 backdrop-blur-sm focus-visible:ring-primary/30"
        />
      </FadeInUp>

      {categories.length > 1 && (
        <FadeInUp className="mb-12 flex justify-center">
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList className="h-auto flex-wrap gap-2 rounded-2xl border bg-card/80 p-2 backdrop-blur-sm">
              {categories.map((cat) => (
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
      )}

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No articles found.</p>
      ) : (
        <StaggerContainer className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <FadeInUp key={post.id} className={i === 0 ? "md:col-span-2 lg:col-span-1" : ""}>
              <Link href={`/blog/${post.slug}`} prefetch className="group block h-full">
                <article className="flex h-full flex-col overflow-hidden rounded-3xl border bg-card/80 card-hover-lift">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={
                        post.thumbnail ||
                        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80"
                      }
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    {post.category && (
                      <Badge variant="secondary" className="mb-3 w-fit">
                        {post.category}
                      </Badge>
                    )}
                    <h2 className="font-display mb-2 line-clamp-2 text-xl font-semibold transition-colors group-hover:text-primary">
                      {post.title}
                    </h2>
                    <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{post.author?.name}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            </FadeInUp>
          ))}
        </StaggerContainer>
      )}
    </>
  );
}
