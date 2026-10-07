"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CardIcons, PayPalBadge, BankBadge } from "@/components/payment/card-icons";
import { PAYMENT_TERMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type MethodId = "stripe" | "bank_transfer" | "paypal";

const METHODS: {
  id: MethodId;
  title: string;
  description: string;
  brand: React.ReactNode;
  accent: string;
  glow: string;
  activeBg: string;
}[] = [
  {
    id: "stripe",
    title: "Visa / Mastercard",
    description: "Pay instantly via Stripe secure checkout",
    brand: <CardIcons size="md" />,
    accent: "border-[#635BFF] ring-[#635BFF]/30",
    glow: "shadow-[0_0_24px_rgba(99,91,255,0.35),0_0_48px_rgba(99,91,255,0.12)]",
    activeBg: "from-[#635BFF]/10 to-indigo-500/5",
  },
  {
    id: "bank_transfer",
    title: "Bank Transfer",
    description: "Wire or ACH — invoice sent within 24 hours",
    brand: <BankBadge size="md" />,
    accent: "border-emerald-500 ring-emerald-500/30",
    glow: "shadow-[0_0_24px_rgba(16,185,129,0.3),0_0_48px_rgba(16,185,129,0.1)]",
    activeBg: "from-emerald-500/10 to-teal-500/5",
  },
  {
    id: "paypal",
    title: "PayPal",
    description: "PayPal invoice link sent to your email",
    brand: <PayPalBadge size="md" />,
    accent: "border-[#003087] ring-blue-500/30",
    glow: "shadow-[0_0_24px_rgba(0,48,135,0.28),0_0_48px_rgba(0,156,222,0.1)]",
    activeBg: "from-blue-500/10 to-sky-500/5",
  },
];

interface PricingPaymentSectionProps {
  serviceSlug?: string;
}

export function PricingPaymentSection({ serviceSlug = "web-development" }: PricingPaymentSectionProps) {
  const [active, setActive] = useState<MethodId>("stripe");
  const current = METHODS.find((m) => m.id === active)!;

  return (
    <div className="mt-20 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3">Payment & Billing</h2>
        <p className="text-muted-foreground">
          Click a payment option to see details — switch anytime at checkout
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {METHODS.map((method) => {
          const isActive = active === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => setActive(method.id)}
              className={cn(
                "relative rounded-2xl border-2 p-5 text-left transition-all duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isActive
                  ? cn("z-10 bg-card scale-[1.02]", method.accent, method.glow, "ring-2 ring-offset-2 ring-offset-background")
                  : "border-border bg-card opacity-80 scale-[0.99] hover:opacity-95"
              )}
            >
              <div className={cn("mb-3", !isActive && "opacity-90")}>{method.brand}</div>
              <p className="font-semibold text-sm mb-1">{method.title}</p>
              <p className="text-xs text-muted-foreground">{method.description}</p>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <Card className={cn("overflow-hidden bg-gradient-to-br", current.activeBg)}>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-3">{current.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{current.description}</p>
                  <Button variant="gradient" asChild className="gap-2">
                    <Link href={`/checkout?service=${serviceSlug}&method=${active}`}>
                      Checkout with {current.title.split(" ")[0]}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Payment Terms</h4>
                  <ul className="space-y-2">
                    {PAYMENT_TERMS.slice(0, 4).map((term) => (
                      <li key={term} className="text-sm text-muted-foreground flex gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {term}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
