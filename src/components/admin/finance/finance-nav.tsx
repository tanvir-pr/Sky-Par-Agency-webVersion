"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CreditCard,
  DollarSign,
  FileText,
  Receipt,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FINANCE_LINKS = [
  { href: "/admin/finance", label: "Overview", icon: DollarSign, exact: true },
  { href: "/admin/finance/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/finance/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/finance/expenses", label: "Expenses", icon: Receipt },
  { href: "/admin/finance/revenue", label: "Revenue", icon: DollarSign },
  { href: "/admin/finance/ai-costs", label: "AI Costs", icon: Bot },
  { href: "/admin/proposals", label: "Proposals", icon: ScrollText },
  { href: "/admin/contracts", label: "Contracts", icon: Sparkles },
];

export function FinanceNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      {FINANCE_LINKS.map((link) => {
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
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
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
