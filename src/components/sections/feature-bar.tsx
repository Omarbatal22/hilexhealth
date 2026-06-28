import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { FEATURE_CARDS, type FeatureCard } from "@/lib/site-data";
import { cn } from "@/lib/utils";

/** Icon-tile accent → gradient classes. Purple stays reserved for AI. */
const ACCENT: Record<FeatureCard["accent"], string> = {
  ai: "bg-gradient-to-br from-ai to-ai-light",
  teal: "bg-gradient-to-br from-teal to-cyan",
  warning: "bg-gradient-to-br from-warning to-[#fbbf24]",
  primary: "bg-gradient-to-br from-primary to-primary-light",
};

/**
 * Dark feature bar — a single navy slab of four quick value props. It sits
 * below the booking section (out of the first viewport), bridging into the
 * service grid. Four props side by side, separated by hairline rules on
 * desktop and stacked two-up on smaller screens.
 */
export function FeatureBar() {
  return (
    <section className="relative -mt-2 pb-4">
      <Container size="content">
        <Reveal className="overflow-hidden rounded-[var(--radius-xl2)] bg-navy bg-gradient-to-br from-navy via-navy to-navy-light shadow-[var(--shadow-large)]">
          <ul className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
            {FEATURE_CARDS.map(({ icon: Icon, title, desc, accent }, i) => (
              <li
                key={title}
                className={cn(
                  "flex items-start gap-4 p-6 lg:p-7",
                  // vertical hairlines between columns on lg
                  i > 0 && "lg:border-l lg:border-white/10",
                  // on sm (2-col) add a left rule to the right column
                  i % 2 === 1 && "sm:border-l sm:border-white/10"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)]",
                    ACCENT[accent]
                  )}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[15px] font-semibold text-white">
                    {title}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/65">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
