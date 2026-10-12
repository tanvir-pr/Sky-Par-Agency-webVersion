"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/components/admin/admin-auth-context";

interface PortalHeaderProps {
  title: string;
  description?: string;
}

export function PortalHeader({ title, description }: PortalHeaderProps) {
  const router = useRouter();
  const { user, clearUser } = useAdminAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axios.post("/api/auth/logout");
      clearUser();
      toast.success("Logged out successfully");
      router.push("/portal/login");
      router.refresh();
    } catch {
      toast.error("Failed to logout");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40">
              <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-slate-500">Client Portal</p>
            </div>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
