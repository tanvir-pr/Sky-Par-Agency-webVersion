"use client";

import { usePathname } from "next/navigation";
import { PortalSidebar } from "@/components/portal/portal-sidebar";
import { AdminAuthProvider } from "@/components/admin/admin-auth-context";

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/portal/login") {
    return (
      <AdminAuthProvider>
        <div className="fixed inset-0 z-0 bg-slate-950">{children}</div>
      </AdminAuthProvider>
    );
  }

  return (
    <AdminAuthProvider>
      <div className="fixed inset-0 z-0 flex bg-slate-100 dark:bg-slate-950">
        <PortalSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </AdminAuthProvider>
  );
}
