"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSearch, ScrollText, Shield, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const SUPER_ADMIN_LINKS = [
  { href: "/admin/super-admin", label: "Overview", icon: Shield, exact: true },
  { href: "/admin/super-admin/logs", label: "System Logs", icon: ScrollText },
  { href: "/admin/super-admin/audit", label: "Audit Logs", icon: FileSearch },
  { href: "/admin/super-admin/security", label: "Security", icon: ShieldAlert },
];

export function SuperAdminNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      {SUPER_ADMIN_LINKS.map((link) => {
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
                ? "bg-red-600 text-white shadow-md shadow-red-600/25"
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
