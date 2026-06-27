import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional leading icon (lucide component). */
  icon?: React.ComponentType<{ className?: string }>;
}

/** Text input — soft-blue border, blue focus ring matching the brand. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon: Icon, ...props }, ref) => {
    const field = (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-2xl border border-border-soft bg-white text-[15px] text-navy placeholder:text-ink-muted transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15",
          Icon ? "pl-11 pr-4" : "px-4",
          className
        )}
        {...props}
      />
    );

    if (!Icon) return field;

    return (
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
        {field}
      </div>
    );
  }
);
Input.displayName = "Input";
