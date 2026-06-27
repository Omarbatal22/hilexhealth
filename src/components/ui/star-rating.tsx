import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Star rating display — filled stars for the rounded rating, with the numeric value. */
export function StarRating({
  rating,
  count,
  size = "sm",
  className,
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const dim = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const rounded = Math.round(rating);
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="inline-flex" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              dim,
              i < rounded
                ? "fill-warning text-warning"
                : "fill-border-soft text-border-soft"
            )}
          />
        ))}
      </span>
      <span className="text-sm font-semibold text-navy">{rating.toFixed(1)}</span>
      {count !== undefined && (
        <span className="text-sm text-ink-muted">({count})</span>
      )}
    </span>
  );
}
