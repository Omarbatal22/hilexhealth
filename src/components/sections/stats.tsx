import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { STATS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

/**
 * "Trusted by Millions" — a navy gradient band. Heading + reassurance on the
 * left, four metric tiles on the right. Each tile pairs a colored icon chip
 * with a bold figure; the AI metric keeps purple.
 */
export function Stats() {
  return (
    <section id="about" className="scroll-mt-24 pb-20 lg:pb-28">
      <Container size="content">
        <Reveal className="relative overflow-hidden rounded-[var(--radius-xl3)] bg-gradient-to-br from-navy via-navy-light to-[#2748a8] px-7 py-10 shadow-[var(--shadow-large)] sm:px-10 lg:px-14 lg:py-12">
          {/* faint grid / glow accents */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-ai/20 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="max-w-sm">
              <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Trusted by Millions
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-white/70">
                We partner with verified doctors and clinics to provide the best
                care for you.
              </p>
            </div>

            <ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
              {STATS.map(({ icon: Icon, value, label, tile }) => (
                <li key={label} className="flex flex-col gap-3">
                  <span
                    className={cn(
                      "inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.45)]",
                      tile
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span>
                    <span className="block font-display text-2xl font-bold text-white sm:text-3xl">
                      {value}
                    </span>
                    <span className="mt-0.5 block text-sm text-white/65">
                      {label}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
