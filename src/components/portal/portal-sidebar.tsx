"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  FolderKanban,
  Receipt,
  FileText,
  MessageSquare,
  ShoppingCart,
  BarChart3,
  Bot,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "/portal", icon: LayoutDashboard, exact: true },
  { label: "Services", href: "/portal/services", icon: Wrench },
  { label: "Projects", href: "/portal/projects", icon: FolderKanban },
  { label: "Invoices", href: "/portal/invoices", icon: Receipt },
  { label: "Files", href: "/portal/files", icon: FileText },
  { label: "Messages", href: "/portal/messages", icon: MessageSquare },
  { label: "Orders", href: "/portal/orders/new", icon: ShoppingCart },
  { label: "Marketing", href: "/portal/marketing", icon: BarChart3 },
  { label: "Automation", href: "/portal/automation", icon: Bot },
  { label: "AI Usage", href: "/portal/ai", icon: Sparkles },
];

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-semibold text-white">Client Portal</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
