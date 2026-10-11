"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Camera,
  Clapperboard,
  Globe,
  Megaphone,
  Package,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SERVICE_LINKS = [
  { href: "/admin/services-mgmt", label: "Overview", icon: Package, exact: true },
  { href: "/admin/services-mgmt/web-development", label: "Web Dev", icon: Globe },
  { href: "/admin/services-mgmt/automation", label: "Automation", icon: Zap },
  { href: "/admin/services-mgmt/ai-integrations", label: "AI", icon: Bot },
  { href: "/admin/services-mgmt/video-editing", label: "Video", icon: Clapperboard },
  { href: "/admin/services-mgmt/photo-editing", label: "Photo", icon: Camera },
  { href: "/admin/services-mgmt/digital-marketing", label: "Marketing", icon: Megaphone },
];

export function ServicesNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      {SERVICE_LINKS.map((link) => {
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
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/25"
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
