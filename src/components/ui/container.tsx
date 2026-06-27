import * as React from "react";
import { cn } from "@/lib/utils";

/** Page container — caps content at the 1440 landing width with responsive gutters. */
export function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1280px] px-6 sm:px-8 lg:px-12",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
