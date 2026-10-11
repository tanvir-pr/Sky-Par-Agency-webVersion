"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileText,
  Globe,
  Image,
  MessageSquareQuote,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CMS_LINKS = [
  { href: "/admin/cms", label: "Overview", icon: Globe, exact: true },
  { href: "/admin/portfolio", label: "Portfolio", icon: Image },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/services", label: "Services Page", icon: Wrench },
  { href: "/admin/team", label: "Team Page", icon: Users },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/careers", label: "Careers", icon: Briefcase },
];

export function CmsNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      {CMS_LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              active
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/25"
                : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
