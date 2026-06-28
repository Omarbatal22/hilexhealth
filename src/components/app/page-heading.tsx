import { cn } from "@/lib/utils";

/** Standard heading block for dashboard sub-pages. */
export function PageHeading({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4",
        className
      )}
    >
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-navy">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Constrained content wrapper used inside the app shell. */
export function AppPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[var(--container-dashboard)]">{children}</div>
    </div>
  );
}
