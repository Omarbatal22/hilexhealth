import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { SERVICE_CARDS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

/**
 * "Everything You Need" — the core service grid. Five soft-gradient cards,
 * each with a large illustrated icon tile, a short pitch, and a "Learn more"
 * affordance. The AI card keeps purple; the rest stay in the brand range.
 */
export function Services() {
  return (
    <section id="health-tools" className="relative scroll-mt-24 py-20 lg:py-28">
      <Container>
        {/* Section header — eyebrow + split heading/supporting copy */}
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <Reveal>
            <Eyebrow className="mb-4 block text-center lg:text-left">
              Everything You Need
            </Eyebrow>
            <h2 className="text-balance text-center font-display text-4xl font-bold leading-[1.1] tracking-tight text-navy sm:text-5xl lg:text-left">
              Everything You Need,
              <br className="hidden sm:block" /> All in One Place
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto max-w-xs text-center text-lg leading-8 text-ink-soft lg:mx-0 lg:pb-1 lg:text-left">
              A complete healthcare platform designed around you.
            </p>
          </Reveal>
        </div>

        {/* Card grid */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {SERVICE_CARDS.map(
            (
              { icon: Icon, title, desc, gradient, iconGradient, iconColor, ai },
              i
            ) => (
              <Reveal key={title} delay={i * 0.06}>
                <article
                  className={cn(
                    "group relative flex h-full flex-col rounded-[var(--radius-xl2)] border border-white/60 bg-gradient-to-b p-6 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-large)]",
                    gradient,
                    ai && "ai-glow"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-[var(--shadow-soft)] transition-transform duration-300 group-hover:scale-105",
                      iconGradient
                    )}
                  >
                    <Icon className={cn("h-8 w-8", iconColor)} strokeWidth={1.6} />
                  </span>

                  <h3 className="mt-5 font-display text-lg font-semibold text-navy">
                    {title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">
                    {desc}
                  </p>

                  <button
                    type="button"
                    className={cn(
                      "mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors",
                      ai ? "text-ai hover:text-ai" : "text-primary"
                    )}
                  >
                    Learn more
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                </article>
              </Reveal>
            )
          )}
        </div>
      </Container>
    </section>
  );
}
