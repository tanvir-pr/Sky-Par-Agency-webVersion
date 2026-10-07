import { cn } from "@/lib/utils";

interface CardIconsProps {
  className?: string;
  showStripe?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { visa: "h-7 min-w-[2.75rem] text-[9px] px-1.5", mc: "h-7 min-w-[2.75rem]", stripe: "h-7 text-[9px] px-2" },
  md: { visa: "h-9 min-w-[3.25rem] text-[10px] px-2", mc: "h-9 min-w-[3.25rem]", stripe: "h-9 text-[10px] px-2.5" },
  lg: { visa: "h-11 min-w-[4rem] text-xs px-3", mc: "h-11 min-w-[4rem]", stripe: "h-11 text-xs px-3" },
};

export function CardIcons({ className, showStripe = true, size = "md" }: CardIconsProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-lg bg-[#1A1F71] font-bold tracking-wider text-white shadow-sm",
          s.visa
        )}
        aria-label="Visa"
      >
        VISA
      </span>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-[#EB001B] via-[#F79E1B] to-[#FF5F00] shadow-sm",
          s.mc
        )}
        aria-label="Mastercard"
      >
        <span className="flex">
          <span className="h-4 w-4 rounded-full bg-white/95" />
          <span className="-ml-2 h-4 w-4 rounded-full bg-white/75" />
        </span>
      </span>
      {showStripe && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-lg bg-[#635BFF] font-semibold lowercase text-white shadow-sm",
            s.stripe
          )}
          aria-label="Stripe"
        >
          stripe
        </span>
      )}
    </div>
  );
}

export function PayPalBadge({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const heights = { sm: "h-7 px-3 text-[9px]", md: "h-9 px-4 text-[10px]", lg: "h-11 px-5 text-xs" };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-[#003087] font-bold tracking-wide text-white shadow-sm",
        heights[size],
        className
      )}
    >
      Pay<span className="text-[#009CDE]">Pal</span>
    </span>
  );
}

export function BankBadge({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const heights = { sm: "h-7 px-3 text-[9px]", md: "h-9 px-4 text-[10px]", lg: "h-11 px-5 text-xs" };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-emerald-700 font-semibold text-white shadow-sm",
        heights[size],
        className
      )}
    >
      Bank Transfer
    </span>
  );
}
