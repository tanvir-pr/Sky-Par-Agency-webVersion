"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  CheckSquare,
  FolderKanban,
  LayoutGrid,
  Milestone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROJECT_LINKS = [
  { href: "/admin/projects", label: "All Projects", icon: FolderKanban, exact: true },
  { href: "/admin/projects/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/admin/projects/kanban", label: "Kanban", icon: LayoutGrid },
  { href: "/admin/projects/calendar", label: "Calendar", icon: Calendar },
  { href: "/admin/projects/milestones", label: "Milestones", icon: Milestone },
];

export function ProjectNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      {PROJECT_LINKS.map((link) => {
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
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/25"
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
