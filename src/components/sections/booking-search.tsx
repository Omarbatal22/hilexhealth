"use client";

import { ArrowRight, ChevronDown, MapPin, Search, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { SPECIALTIES } from "@/lib/doctors";
import {
  CONSULTATION_CARDS,
  DISTRICTS,
  GOVERNORATES,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";

/**
 * Booking + online-consultation band — the second action, below the AI Hero.
 * A premium glass container split into two equal halves: real doctor search on
 * the left, online-consultation entry points on the right.
 */
export function BookingSearch() {
  return (
    <section className="relative scroll-mt-24 py-16 lg:py-20" id="book">
      <Container>
        <Reveal className="mb-8 text-center">
          <Eyebrow className="mb-3 block">Book With Confidence</Eyebrow>
          <h2 className="text-balance font-display text-4xl font-bold leading-[1.1] tracking-tight text-navy sm:text-5xl">
            Find care, your way
          </h2>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="glass-strong overflow-hidden rounded-[var(--radius-xl2)] shadow-[var(--shadow-large)]">
            <div className="grid lg:grid-cols-2">
              {/* ---------- Left: Book Appointment ---------- */}
              <div className="border-b border-white/60 p-7 sm:p-9 lg:border-b-0 lg:border-r">
                <h3 className="font-display text-xl font-bold tracking-tight text-navy">
                  Book Appointment
                </h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Search by location and specialty to find the right doctor.
                </p>

                <form
                  className="mt-6 space-y-3"
                  onSubmit={(e) => e.preventDefault()}
                  role="search"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SelectField icon={MapPin} label="Governorate" options={GOVERNORATES} />
                    <SelectField icon={MapPin} label="District" options={DISTRICTS} />
                  </div>

                  <SelectField
                    icon={Stethoscope}
                    label="Specialty"
                    options={SPECIALTIES.map((s) => s.label)}
                  />

                  <div className="flex items-center gap-3 rounded-2xl border border-border-soft bg-white px-4">
                    <Search className="h-5 w-5 shrink-0 text-ink-muted" />
                    <input
                      type="text"
                      placeholder="Doctor or clinic name..."
                      aria-label="Search doctor or clinic"
                      className="h-12 w-full bg-transparent text-[15px] text-navy placeholder:text-ink-muted focus:outline-none"
                    />
                  </div>

                  <Link
                    href="/doctors"
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-white shadow-[0_10px_28px_-8px_rgba(59,130,246,0.55)] transition-all hover:-translate-y-0.5 hover:bg-[#2f6fe0]"
                  >
                    <Search className="h-5 w-5" /> Search doctors
                  </Link>
                </form>
              </div>

              {/* ---------- Right: Online Consultation ---------- */}
              <div className="bg-gradient-to-br from-white/40 to-primary-soft/20 p-7 sm:p-9">
                <h3 className="font-display text-xl font-bold tracking-tight text-navy">
                  Online Consultation
                </h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Skip the commute — consult a doctor from home.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {CONSULTATION_CARDS.map(
                    ({ icon: Icon, title, desc, cta, href, iconGradient, iconColor }) => (
                      <Link
                        key={title}
                        href={href}
                        className="group flex h-full flex-col rounded-[var(--radius-card)] border border-border-soft bg-white p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[var(--shadow-large)]"
                      >
                        <span
                          className={cn(
                            "inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-[var(--shadow-soft)] transition-transform duration-300 group-hover:scale-105",
                            iconGradient
                          )}
                        >
                          <Icon className={cn("h-7 w-7", iconColor)} strokeWidth={1.6} />
                        </span>
                        <h4 className="mt-4 font-display text-lg font-semibold text-navy">
                          {title}
                        </h4>
                        <p className="mt-1.5 flex-1 text-sm leading-6 text-ink-soft">
                          {desc}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                          {cta}
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </span>
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/** Lightweight native select styled to match the booking form. */
function SelectField({
  icon: Icon,
  label,
  options,
}: {
  icon: typeof MapPin;
  label: string;
  options: string[];
}) {
  return (
    <div className="relative flex items-center gap-3 rounded-2xl border border-border-soft bg-white px-4">
      <Icon className="h-5 w-5 shrink-0 text-primary" />
      <select
        aria-label={label}
        defaultValue=""
        className="h-12 w-full appearance-none bg-transparent pr-6 text-[15px] text-navy focus:outline-none"
      >
        <option value="" disabled>
          {label}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 h-4 w-4 text-ink-muted" />
    </div>
  );
}
