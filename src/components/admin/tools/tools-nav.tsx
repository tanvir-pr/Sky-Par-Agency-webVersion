"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Calendar, FileText, MessageSquare, Wrench, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLS_LINKS = [
  { href: "/admin/tools", label: "Overview", icon: Wrench, exact: true },
  { href: "/admin/files", label: "Files", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/calendar", label: "Calendar", icon: Calendar },
  { href: "/admin/automation", label: "Automation", icon: Zap },
  { href: "/admin/ai-tools", label: "AI Tools", icon: Bot },
];

export function ToolsNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      {TOOLS_LINKS.map((link) => {
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
                ? "bg-orange-600 text-white shadow-md shadow-orange-600/25"
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
