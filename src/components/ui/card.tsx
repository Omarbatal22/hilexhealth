import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Surface card — white panel with a soft blue border and shadow, matching the
 * design system's "Cards: White, very soft blue border, soft shadow" rule.
 * Set `interactive` for hover lift on clickable cards.
 */
export function Card({
  className,
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-border-soft bg-white shadow-[var(--shadow-soft)]",
        interactive &&
          "transition-all duration-200 ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-medium)]",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 pb-5 sm:px-6 sm:pb-6", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-lg font-bold tracking-tight text-navy",
        className
      )}
      {...props}
    />
  );
}
