"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ADMIN_NAV, type NavItem } from "@/lib/admin-nav";
import { useAdminAuth } from "@/components/admin/admin-auth-context";
import { hasPermission, PermissionKey } from "@/lib/rbac/permissions";
import { cn } from "@/lib/utils";

interface FlatItem {
  label: string;
  href: string;
  group?: string;
}

function flatten(items: NavItem[], role: string): FlatItem[] {
  const out: FlatItem[] = [];
  const visible = (item: NavItem) => {
    if (item.roles && !item.roles.includes(role)) return false;
    if (item.permission && !hasPermission(role, item.permission as PermissionKey)) return false;
    return true;
  };
  for (const item of items) {
    if (!visible(item)) continue;
    if (item.children) {
      for (const child of item.children) {
        if (visible(child) && child.href) {
          out.push({ label: child.label, href: child.href, group: item.label });
        }
      }
    } else if (item.href) {
      out.push({ label: item.label, href: item.href });
    }
  }
  return out;
}

export function CommandPalette() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const role = user?.role ?? "EDITOR";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => flatten(ADMIN_NAV, role), [role]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (i) => i.label.toLowerCase().includes(q) || i.group?.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      e.preventDefault();
      go(filtered[activeIndex].href);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search...</span>
        <kbd className="ml-2 hidden rounded border bg-muted px-1.5 text-[10px] font-medium md:inline">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <div className="flex items-center gap-2 border-b px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search pages and modules..."
              className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">No results</p>
            ) : (
              filtered.map((item, i) => (
                <button
                  key={item.href}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => go(item.href)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm",
                    i === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                >
                  <span>{item.label}</span>
                  {item.group && (
                    <span className="text-xs text-muted-foreground">{item.group}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
