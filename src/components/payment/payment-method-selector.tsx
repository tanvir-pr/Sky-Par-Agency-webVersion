"use client";

import { Building2, Check, CreditCard, Lock, Zap, Mail, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CardIcons, PayPalBadge, BankBadge } from "./card-icons";

export type PaymentMethodId = "stripe" | "bank_transfer" | "paypal";

interface PaymentMethodSelectorProps {
  value: PaymentMethodId | string;
  onChange: (method: PaymentMethodId) => void;
  stripeEnabled?: boolean;
  depositLabel?: string;
  error?: string;
}

interface PaymentOption {
  id: PaymentMethodId;
  title: string;
  subtitle: string;
  badge: string;
  badgeClass: string;
  icon: typeof CreditCard;
  accent: string;
  iconBg: string;
  brand: React.ReactNode;
}

const ALL_OPTIONS: PaymentOption[] = [
  {
    id: "stripe",
    title: "Stripe",
    subtitle: "Visa & Mastercard",
    badge: "Instant",
    badgeClass: "bg-[#635BFF]/15 text-[#635BFF] dark:text-[#a5b4fc]",
    icon: CreditCard,
    accent: "border-[#635BFF] ring-[#635BFF]/25 shadow-[#635BFF]/10",
    iconBg: "bg-gradient-to-br from-[#635BFF] to-indigo-600",
    brand: <CardIcons size="sm" />,
  },
  {
    id: "bank_transfer",
    title: "Bank Transfer",
    subtitle: "Wire or ACH",
    badge: "Invoice",
    badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    icon: Building2,
    accent: "border-emerald-500 ring-emerald-500/25 shadow-emerald-500/10",
    iconBg: "bg-gradient-to-br from-emerald-600 to-teal-600",
    brand: <BankBadge size="sm" />,
  },
  {
    id: "paypal",
    title: "PayPal",
    subtitle: "Balance or card",
    badge: "Invoice",
    badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    icon: Mail,
    accent: "border-[#003087] ring-blue-500/25 shadow-blue-500/10",
    iconBg: "bg-gradient-to-br from-[#003087] to-[#009CDE]",
    brand: <PayPalBadge size="sm" />,
  },
];

function PaymentDetailPanel({
  method,
  depositLabel,
}: {
  method: PaymentMethodId;
  depositLabel?: string;
}) {
  if (method === "stripe") {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#635BFF]/30 bg-gradient-to-br from-[#635BFF]/5 via-background to-indigo-500/5">
        <div className="flex items-center justify-between gap-4 border-b border-[#635BFF]/20 bg-[#635BFF]/10 px-5 py-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#635BFF]" />
            <span className="text-sm font-semibold text-[#635BFF]">Stripe Secure Checkout</span>
          </div>
          <Zap className="h-4 w-4 text-[#635BFF]" />
        </div>
        <div className="p-5 space-y-4">
          <CardIcons size="lg" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Pay <strong className="text-foreground">{depositLabel}</strong> instantly with Visa or Mastercard.
            You&apos;ll be redirected to Stripe&apos;s encrypted checkout — we never see your card number.
          </p>
          <div className="flex flex-wrap gap-0.5 text-xs text-muted-foreground">
            {["256-bit SSL", "PCI compliant", "Instant confirmation"].map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-2.5 py-1 mr-1.5 mt-1">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (method === "bank_transfer") {
    return (
      <div className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-background to-teal-500/5">
        <div className="flex items-center justify-between gap-4 border-b border-emerald-500/20 bg-emerald-500/10 px-5 py-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              Bank Transfer
            </span>
          </div>
          <Clock className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="p-5 space-y-3">
          <BankBadge size="md" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            We&apos;ll email you an invoice with bank details within <strong className="text-foreground">24 hours</strong>.
            Deposit amount: <strong className="text-foreground">{depositLabel}</strong>
          </p>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>• Wire transfer or ACH accepted</li>
            <li>• Project starts after deposit clears</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/5 via-background to-sky-500/5">
      <div className="flex items-center justify-between gap-4 border-b border-blue-500/20 bg-blue-500/10 px-5 py-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-[#003087]" />
          <span className="text-sm font-semibold text-[#003087] dark:text-blue-400">PayPal Invoice</span>
        </div>
        <Clock className="h-4 w-4 text-[#003087]" />
      </div>
      <div className="p-5 space-y-3">
        <PayPalBadge size="md" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          A PayPal payment link for <strong className="text-foreground">{depositLabel}</strong> will be sent to your email within 24 hours.
        </p>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li>• Pay with PayPal balance or linked card</li>
          <li>• Buyer protection included</li>
        </ul>
      </div>
    </div>
  );
}

export function PaymentMethodSelector({
  value,
  onChange,
  stripeEnabled = true,
  depositLabel,
  error,
}: PaymentMethodSelectorProps) {
  const options = ALL_OPTIONS.filter(
    (opt) => opt.id !== "stripe" || stripeEnabled
  );
  const selected = (value as PaymentMethodId) || options[0]?.id;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-1">Choose Payment Method *</p>
        <p className="text-xs text-muted-foreground mb-4">
          Click a card below to switch payment option
        </p>
      </div>

      <div
        className={cn(
          "grid gap-3",
          options.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
        )}
        role="radiogroup"
        aria-label="Payment method"
      >
        {options.map((option) => {
          const isActive = selected === option.id;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.id)}
              className={cn(
                "group relative flex flex-col items-start rounded-2xl border-2 p-4 text-left transition-all duration-300",
                "hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isActive
                  ? cn("border-2 shadow-lg ring-2 ring-offset-2 ring-offset-background scale-[1.02]", option.accent)
                  : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/30"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="payment-check"
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </motion.span>
              )}

              <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm", option.iconBg)}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="w-full flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm">{option.title}</span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", option.badgeClass)}>
                    {option.badge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{option.subtitle}</p>
                <div className={cn("transition-opacity", isActive ? "opacity-100" : "opacity-60 group-hover:opacity-90")}>
                  {option.brand}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <PaymentDetailPanel method={selected} depositLabel={depositLabel} />
        </motion.div>
      </AnimatePresence>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
