"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, Wrench, ShoppingCart, FolderKanban, UserCircle,
  DollarSign, BarChart3, FileText, MessageSquare, Calendar, Zap, Sparkles,
  Settings, Shield, Globe, ChevronDown, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, type NavItem } from "@/lib/admin-nav";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { hasPermission, PermissionKey } from "@/lib/rbac/permissions";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, Wrench, ShoppingCart, FolderKanban, UserCircle,
  DollarSign, BarChart3, FileText, MessageSquare, Calendar, Zap, Sparkles,
  Settings, Shield, Globe,
};

function canSeeItem(item: NavItem, role: string): boolean {
  if (item.roles && !item.roles.includes(role)) return false;
  if (item.permission && !hasPermission(role, item.permission as PermissionKey)) return false;
  if (item.children) {
    return item.children.some((child) => canSeeItem(child, role));
  }
  return true;
}

function NavLink({ item, role }: { item: NavItem; role: string }) {
  const pathname = usePathname();
  const Icon = item.icon ? ICON_MAP[item.icon] : null;

  if (!canSeeItem(item, role)) return null;

  if (item.children) {
    return <NavGroup item={item} role={role} />;
  }

  if (!item.href) return null;

  const isActive = item.href === "/admin"
    ? pathname === "/admin"
    : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
          : "text-slate-400 hover:bg-slate-900 hover:text-white"
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {item.label}
    </Link>
  );
}

function NavGroup({ item, role }: { item: NavItem; role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(
    item.children?.some((c) => c.href && pathname.startsWith(c.href)) ?? false
  );
  const Icon = item.icon ? ICON_MAP[item.icon] : null;
  const visibleChildren = item.children?.filter((c) => canSeeItem(c, role)) ?? [];

  if (visibleChildren.length === 0) return null;

  const isActive = visibleChildren.some(
    (c) => c.href && (c.href === "/admin" ? pathname === "/admin" : pathname.startsWith(c.href))
  );

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-slate-900 text-white"
            : "text-slate-400 hover:bg-slate-900 hover:text-white"
        )}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="flex-1 text-left">{item.label}</span>
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-800 pl-3">
          {visibleChildren.map((child) => {
            if (!child.href) return null;
            const childActive = pathname.startsWith(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                  childActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminSidebar() {
  const { user } = useAdminAuth();
  const role = user?.role ?? "EDITOR";

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-100">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Nexus Admin</p>
          <p className="text-xs text-slate-400">Agency Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_NAV.map((item) => (
          <NavLink key={item.label} item={item} role={role} />
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <p className="text-xs text-slate-500">Nexus Digital Agency</p>
        <p className="text-xs text-slate-600">v2.0.0 SaaS</p>
      </div>
    </aside>
  );
}
