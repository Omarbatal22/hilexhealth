import * as React from "react";
import { cn } from "@/lib/utils";

interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** AI eyebrows render in purple; everything else in primary blue. */
  tone?: "primary" | "ai" | "muted";
}

/** Small uppercase label that sits above section headings. */
export function Eyebrow({
  className,
  tone = "primary",
  children,
  ...props
}: EyebrowProps) {
  return (
    <span
      className={cn(
        "text-xs font-bold uppercase tracking-[0.22em]",
        tone === "primary" && "text-primary",
        tone === "ai" && "text-ai",
        tone === "muted" && "text-ink-muted",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
