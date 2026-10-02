import { cn } from "@/lib/utils";

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "mesh" | "muted" | "dark";
  id?: string;
}

const variants = {
  default: "",
  mesh: "mesh-bg relative overflow-hidden",
  muted: "bg-muted/40 relative overflow-hidden",
  dark: "bg-[#06070c] text-white relative overflow-hidden grain",
};
  

export function PageSection({
  children,
  className,
  variant = "default",
  id,
}: PageSectionProps) {
  return (
    <section
      id={id}
      className={cn("section-padding", variants[variant], className)}
    >
      {variant === "mesh" && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,hsl(var(--primary)/0.06),transparent_40%)]" />
      )}
      <div className="container-custom relative">{children}</div>
    </section>
  );
}

interface ContentCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function ContentCard({
  children,
  className,
  hover = true,
  glow = false,
}: ContentCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border bg-card/80 backdrop-blur-sm",
        hover && "card-hover-lift",
        glow && "glow-ring",
        className
      )}
    >
      {children}
    </div>
  );
}

interface IconBoxProps {
  icon: React.ElementType;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function IconBox({ icon: Icon, className, size = "md" }: IconBoxProps) {
  const sizes = {
    sm: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
    md: "h-12 w-12 [&_svg]:h-6 [&_svg]:w-6",
    lg: "h-16 w-16 [&_svg]:h-8 [&_svg]:w-8",
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-cyan-500/10 text-primary transition-all duration-500 group-hover:from-primary group-hover:to-cyan-500 group-hover:text-white",
        sizes[size],
        className
      )}
    >
      <Icon />
    </div>
  );
}
