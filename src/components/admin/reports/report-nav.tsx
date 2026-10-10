"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  DollarSign,
  Megaphone,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const REPORT_LINKS = [
  { href: "/admin/reports/revenue", label: "Revenue", icon: DollarSign },
  { href: "/admin/reports/clients", label: "Clients", icon: Users },
  { href: "/admin/reports/services", label: "Services", icon: Wrench },
  { href: "/admin/reports/team", label: "Team", icon: Users },
  { href: "/admin/reports/marketing", label: "Marketing", icon: Megaphone },
];

export function ReportNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <Link
        href="/admin/reports"
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
          pathname === "/admin/reports"
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
            : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800"
        )}
      >
        <BarChart3 className="h-4 w-4" />
        Overview
      </Link>
      {REPORT_LINKS.map((link) => {
        const active = pathname === link.href;
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
