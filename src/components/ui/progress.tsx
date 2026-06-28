"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

export function Progress({ className, value, ...props }: ProgressProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const pct = Math.min(100, Math.max(0, value));

  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.width = `${pct}%`;
    }
  }, [pct]);

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-surface",
        className
      )}
      {...props}
    >
      <div
        ref={ref}
        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300 ease-out"
      />
    </div>
  );
}
