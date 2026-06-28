import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The maximum width variant for the container.
   * - `prose`: 760px (reading/narrative)
   * - `content`: 1200px (standard marketing layout - default)
   * - `app`: 1440px (application pages)
   * - `wide`: 1600px (wide hero / gallery detail)
   * - `dashboard`: 1760px (ultra-wide dashboard safety cap)
   * - `fluid`: None (gutters only)
   */
  size?: "prose" | "content" | "app" | "wide" | "dashboard" | "fluid";
}

/** Page container — defines page-level width constraint and responsive gutters. */
export function Container({
  className,
  children,
  size = "content",
  ...props
}: ContainerProps) {
  const sizeMap = {
    prose: "max-w-[var(--container-prose)]",
    content: "max-w-[var(--container-content)]",
    app: "max-w-[var(--container-app)]",
    wide: "max-w-[var(--container-wide)]",
    dashboard: "max-w-[var(--container-dashboard)]",
    fluid: "",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full px-6 sm:px-8 lg:px-12",
        sizeMap[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
