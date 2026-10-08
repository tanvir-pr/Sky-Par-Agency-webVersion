import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type AccentColor = "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down";
  accent?: AccentColor;
  className?: string;
}

const ACCENTS: Record<AccentColor, { bg: string; icon: string; bar: string }> = {
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/50", icon: "text-indigo-600 dark:text-indigo-400", bar: "from-indigo-500 to-indigo-600" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/50", icon: "text-emerald-600 dark:text-emerald-400", bar: "from-emerald-500 to-emerald-600" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950/50", icon: "text-amber-600 dark:text-amber-400", bar: "from-amber-500 to-amber-600" },
  rose: { bg: "bg-rose-50 dark:bg-rose-950/50", icon: "text-rose-600 dark:text-rose-400", bar: "from-rose-500 to-rose-600" },
  sky: { bg: "bg-sky-50 dark:bg-sky-950/50", icon: "text-sky-600 dark:text-sky-400", bar: "from-sky-500 to-sky-600" },
  violet: { bg: "bg-violet-50 dark:bg-violet-950/50", icon: "text-violet-600 dark:text-violet-400", bar: "from-violet-500 to-violet-600" },
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendDirection,
  accent = "indigo",
  className,
}: StatCardProps) {
  const a = ACCENTS[accent];
  return (
    <Card className={cn("group relative overflow-hidden transition-all hover:shadow-md", className)}>
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", a.bar)} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend && (
              <p
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  trendDirection === "down" ? "text-rose-600" : "text-emerald-600"
                )}
              >
                {trendDirection === "down" ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                {trend}
              </p>
            )}
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110", a.bg)}>
            <Icon className={cn("h-6 w-6", a.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
