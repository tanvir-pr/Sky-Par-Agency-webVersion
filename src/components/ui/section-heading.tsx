import { cn } from "@/lib/utils";
import { FadeInUp } from "@/components/animations/motion";

interface SectionHeadingProps {
  label: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  label,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <FadeInUp
      className={cn(
        "mb-14 md:mb-16",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl",
        className
      )}
    >
      <span className="section-label mb-5">{label}</span>
      <h2 className="font-display text-3xl font-bold md:text-4xl lg:text-5xl lg:leading-[1.1]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </FadeInUp>
  );
}
