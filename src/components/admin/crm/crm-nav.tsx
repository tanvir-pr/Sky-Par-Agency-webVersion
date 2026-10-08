"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Handshake,
  Target,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CRM_LINKS = [
  { href: "/admin/crm", label: "Overview", icon: BarChart3, exact: true },
  { href: "/admin/crm/clients", label: "Clients", icon: Users },
  { href: "/admin/crm/leads", label: "Leads", icon: UserPlus },
  { href: "/admin/crm/deals", label: "Deals", icon: Handshake },
  { href: "/admin/crm/pipeline", label: "Pipeline", icon: Target },
];

export function CrmNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      {CRM_LINKS.map((link) => {
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
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
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
