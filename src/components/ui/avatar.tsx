import { cn } from "@/lib/utils";

const TONES = [
  "from-primary to-primary-light",
  "from-teal to-cyan",
  "from-ai to-ai-light",
  "from-[#f59e0b] to-[#fbbf24]",
  "from-coral to-[#fb7185]",
  "from-navy-light to-primary",
] as const;

/** Deterministic gradient pick from a name, so an avatar is stable per person. */
function toneFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}

function initials(name: string) {
  return name
    .replace(/^(Dr\.?|Mr\.?|Ms\.?|Mrs\.?)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const SIZES = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
} as const;

/**
 * Asset-free avatar: gradient tile with initials (no portraits in /public yet).
 * Swap for next/image once real photos land.
 */
export function Avatar({
  name,
  size = "md",
  className,
  ring = false,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
  ring?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white",
        toneFor(name),
        SIZES[size],
        ring && "ring-4 ring-white shadow-[var(--shadow-medium)]",
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
