import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap",
  {
    variants: {
      tone: {
        primary: "bg-primary-soft/70 text-primary",
        navy: "bg-navy text-white",
        success: "bg-success/12 text-success",
        warning: "bg-warning/14 text-[#b45309]",
        error: "bg-error/12 text-error",
        ai: "bg-ai/10 text-ai",
        neutral: "bg-surface text-ink-soft",
        teal: "bg-teal/12 text-[#0f766e]",
      },
      size: {
        sm: "px-2.5 py-0.5 text-[11px]",
        md: "px-3 py-1 text-xs",
      },
    },
    defaultVariants: { tone: "primary", size: "md" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size, className }))} {...props} />
  );
}
