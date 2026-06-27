import { cn } from "@/lib/utils";

/** HelixHealth wordmark: gradient DNA-helix glyph + brand text. */
export function Logo({
  className,
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-9 w-9" aria-hidden>
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          {/* rounded tile */}
          <rect x="2" y="2" width="32" height="32" rx="10" fill="url(#logoGrad)" />
          {/* DNA helix: two interweaving strands + rungs */}
          <g
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M13 8c0 5 10 5 10 10s-10 5-10 10" />
            <path d="M23 8c0 5-10 5-10 10s10 5 10 10" />
            <path d="M14.2 12.5h7.6M13 18h10M14.2 23.5h7.6" strokeWidth="1.6" />
          </g>
        </svg>
      </span>
      <span
        className={cn(
          "font-display text-xl font-bold tracking-tight",
          invert ? "text-white" : "text-navy"
        )}
      >
        Helix
        <span className="text-primary">Health</span>
      </span>
    </span>
  );
}
