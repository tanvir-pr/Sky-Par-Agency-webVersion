"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Clock,
  Shield,
  UserCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TEAM_LINKS = [
  { href: "/admin/team/overview", label: "Overview", icon: Users, exact: true },
  { href: "/admin/users/employees", label: "Employees", icon: UserCircle },
  { href: "/admin/users/roles", label: "Roles", icon: Shield },
  { href: "/admin/team/attendance", label: "Attendance", icon: Users },
  { href: "/admin/team/time-tracking", label: "Time Tracking", icon: Clock },
  { href: "/admin/my-work", label: "My Work", icon: Briefcase },
];

export function TeamNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      {TEAM_LINKS.map((link) => {
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
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/25"
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
