"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminAuthProvider } from "@/components/admin/admin-auth-context";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (pathname === "/admin/login") {
    return (
      <AdminAuthProvider>
        <div className="fixed inset-0 z-0 bg-slate-950">{children}</div>
      </AdminAuthProvider>
    );
  }

  return (
    <AdminAuthProvider>
      <div className="fixed inset-0 z-0 flex bg-slate-100 dark:bg-slate-950">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        {/* Mobile drawer */}
        <div
          className={cn(
            "fixed inset-0 z-50 md:hidden",
            mobileOpen ? "pointer-events-auto" : "pointer-events-none"
          )}
        >
          <div
            className={cn(
              "absolute inset-0 bg-black/50 transition-opacity",
              mobileOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={cn(
              "absolute left-0 top-0 h-full transition-transform duration-200",
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <AdminSidebar />
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile top bar with menu toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="absolute left-3 top-3 z-40 rounded-lg bg-slate-900 p-2 text-white shadow-lg md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {children}
        </div>
      </div>
    </AdminAuthProvider>
  );
}
