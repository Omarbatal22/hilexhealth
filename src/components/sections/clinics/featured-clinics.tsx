import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ClinicCard } from "@/components/sections/clinics/clinic-card";
import { CLINICS } from "@/lib/clinics";

export function FeaturedClinics() {
  // Filter featured clinics
  const featured = CLINICS.filter((c) => c.featured).slice(0, 3);

  if (featured.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-white to-soft-bg py-16 sm:py-20 border-t border-border-soft/60">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2.5">
              <Sparkles className="h-4 w-4 shrink-0 text-ai" />
              <span>HelixHealth Recommendations</span>
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl">
              Featured Clinics & Medical Centers
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Discover top-rated, certified healthcare centers and clinics offering multi-specialty care in Cairo and Giza.
            </p>
          </div>
          <Link
            href="/clinics"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-light transition-colors group shrink-0"
          >
            View all clinics
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-1">
          {featured.map((clinic) => (
            <ClinicCard key={clinic.id} facility={clinic} />
          ))}
        </div>
      </Container>
    </section>
  );
}
