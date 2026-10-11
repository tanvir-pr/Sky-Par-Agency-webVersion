"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  ArrowRight,
  Briefcase,
  FileText,
  Globe,
  Image,
  MessageSquareQuote,
  Users,
  Wrench,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/header";
import { CmsNav } from "@/components/admin/cms/cms-nav";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CMS_CARDS = [
  { href: "/admin/portfolio", title: "Portfolio", description: "Showcase projects and case studies", icon: Image, gradient: "from-teal-500/10 to-emerald-500/5" },
  { href: "/admin/blog", title: "Blog", description: "Articles and content marketing", icon: FileText, gradient: "from-blue-500/10 to-cyan-500/5" },
  { href: "/admin/services", title: "Services Page", description: "Public services page content", icon: Wrench, gradient: "from-violet-500/10 to-purple-500/5" },
  { href: "/admin/team", title: "Team Page", description: "Team members on website", icon: Users, gradient: "from-indigo-500/10 to-blue-500/5" },
  { href: "/admin/testimonials", title: "Testimonials", description: "Client reviews and quotes", icon: MessageSquareQuote, gradient: "from-amber-500/10 to-orange-500/5" },
  { href: "/admin/careers", title: "Careers", description: "Job listings and openings", icon: Briefcase, gradient: "from-rose-500/10 to-pink-500/5" },
];

export default function CmsHubPage() {
  const [stats, setStats] = useState({ portfolio: 0, blog: 0, testimonials: 0, careers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get("/api/portfolio"),
      axios.get("/api/blog"),
      axios.get("/api/testimonials"),
      axios.get("/api/careers"),
    ])
      .then(([portfolio, blog, testimonials, careers]) => {
        setStats({
          portfolio: portfolio.data.portfolio?.length ?? 0,
          blog: blog.data.posts?.length ?? 0,
          testimonials: testimonials.data.testimonials?.length ?? 0,
          careers: careers.data.careers?.length ?? 0,
        });
      })
      .catch(() => setStats({ portfolio: 0, blog: 0, testimonials: 0, careers: 0 }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader title="Website CMS" description="Manage all public website content" />
      <div className="flex-1 overflow-y-auto p-6">
        <CmsNav />
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard accent="emerald" title="Portfolio Items" value={loading ? "—" : stats.portfolio} icon={Image} />
          <StatCard accent="sky" title="Blog Posts" value={loading ? "—" : stats.blog} icon={FileText} />
          <StatCard accent="amber" title="Testimonials" value={loading ? "—" : stats.testimonials} icon={MessageSquareQuote} />
          <StatCard accent="rose" title="Career Listings" value={loading ? "—" : stats.careers} icon={Briefcase} />
        </div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Content Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CMS_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className={cn("group h-full overflow-hidden border-slate-200/80 transition-all hover:border-teal-300 hover:shadow-lg dark:border-slate-800", `bg-gradient-to-br ${card.gradient}`)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-900">
                        <Icon className="h-5 w-5 text-teal-600" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-teal-600" />
                    </div>
                    <CardTitle className="mt-3 text-lg">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{card.description}</p></CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        <Card className="mt-6 overflow-hidden border-teal-200/50 bg-gradient-to-r from-teal-50/50 to-white dark:from-teal-950/20 dark:to-slate-900">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-3">
              <Globe className="h-8 w-8 text-teal-600" />
              <div>
                <p className="font-semibold">Live Website</p>
                <p className="text-sm text-muted-foreground">Changes publish to the public site after save</p>
              </div>
            </div>
            <Link href="/" target="_blank" className="text-sm font-medium text-teal-600 hover:underline">
              View public site →
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
