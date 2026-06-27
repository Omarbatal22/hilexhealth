"use client";

import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import * as React from "react";
import { DoctorCard } from "@/components/sections/doctors/doctor-card";
import { FilterGroup, FilterRadio, FilterToggle } from "@/components/sections/search/filters";
import { Badge } from "@/components/ui/badge";
import { getClinicsForDoctor, getBranchesForClinic, INSURANCERS } from "@/lib/clinics";
import { GOVERNORATES } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { EASE } from "@/lib/motion";
import { DOCTORS, SPECIALTIES } from "@/lib/doctors";
import { cn } from "@/lib/utils";

type SortKey = "relevance" | "rating" | "fee" | "distance";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Best match" },
  { key: "rating", label: "Top rated" },
  { key: "fee", label: "Lowest fee" },
  { key: "distance", label: "Nearest" },
];

const RATING_OPTIONS = [4.9, 4.8, 4.5, 0] as const;

export function DoctorSearch() {
  const [query, setQuery] = React.useState("");
  const [specialty, setSpecialty] = React.useState<string | null>(null);
  const [governorate, setGovernorate] = React.useState("all");
  const [insurance, setInsurance] = React.useState("all");
  const [todayOnly, setTodayOnly] = React.useState(false);
  const [videoOnly, setVideoOnly] = React.useState(false);
  const [minRating, setMinRating] = React.useState(0);
  const [sort, setSort] = React.useState<SortKey>("relevance");
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = DOCTORS.filter((d) => {
      if (specialty && d.specialtySlug !== specialty) return false;
      if (todayOnly && !d.availableToday) return false;
      if (videoOnly && !d.videoVisit) return false;
      if (d.rating < minRating) return false;
      
      // Governorate Filter
      if (governorate !== "all") {
        const clinics = getClinicsForDoctor(d.slug);
        const hasBranchInGov = clinics.some(c => 
          getBranchesForClinic(c.id).some(b => b.address.governorate === governorate)
        );
        if (!hasBranchInGov) return false;
      }

      // Insurance Filter
      if (insurance !== "all") {
        const clinics = getClinicsForDoctor(d.slug);
        const acceptsInsurance = clinics.some(c => c.insuranceIds.includes(insurance));
        if (!acceptsInsurance) return false;
      }

      if (q) {
        const hay = `${d.name} ${d.specialty} ${d.title} ${d.focusAreas.join(
          " "
        )}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "fee") return a.feeUsd - b.feeUsd;
      if (sort === "distance") return a.distanceMi - b.distanceMi;
      return 0;
    });
    return list;
  }, [query, specialty, todayOnly, videoOnly, minRating, sort, governorate, insurance]);

  const activeFilterCount =
    (specialty ? 1 : 0) +
    (governorate !== "all" ? 1 : 0) +
    (insurance !== "all" ? 1 : 0) +
    (todayOnly ? 1 : 0) +
    (videoOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  function reset() {
    setSpecialty(null);
    setGovernorate("all");
    setInsurance("all");
    setTodayOnly(false);
    setVideoOnly(false);
    setMinRating(0);
  }

  const filterPanel = (
    <div className="space-y-7">
      <FilterGroup title="Specialty">
        <div className="flex flex-col gap-1">
          <FilterRadio
            label="All specialties"
            checked={specialty === null}
            onClick={() => setSpecialty(null)}
          />
          {SPECIALTIES.map((s) => (
            <FilterRadio
              key={s.slug}
              label={s.label}
              checked={specialty === s.slug}
              onClick={() => setSpecialty(s.slug)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <FilterToggle
          label="Available today"
          checked={todayOnly}
          onChange={setTodayOnly}
        />
        <FilterToggle
          label="Offers video visits"
          checked={videoOnly}
          onChange={setVideoOnly}
        />
      </FilterGroup>

      <FilterGroup title="Governorate">
        <select
          value={governorate}
          aria-label="Select Governorate"
          onChange={(e) => setGovernorate(e.target.value)}
          className="w-full rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm text-ink-soft focus:border-primary focus:outline-none"
        >
          <option value="all">All Governorates</option>
          {GOVERNORATES.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Accepted Insurance">
        <select
          value={insurance}
          aria-label="Select Insurance"
          onChange={(e) => setInsurance(e.target.value)}
          className="w-full rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm text-ink-soft focus:border-primary focus:outline-none"
        >
          <option value="all">All Insurances</option>
          {INSURANCERS.map(ins => (
            <option key={ins.id} value={ins.id}>{ins.label}</option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Patient rating">
        <div className="flex flex-col gap-1">
          {RATING_OPTIONS.map((r) => (
            <FilterRadio
              key={r}
              label={r === 0 ? "Any rating" : `${r} & up`}
              checked={minRating === r}
              onClick={() => setMinRating(r)}
            />
          ))}
        </div>
      </FilterGroup>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={reset} className="w-full">
          <X className="h-4 w-4" /> Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <section className="bg-gradient-to-b from-primary-bg via-soft-bg to-white pb-20 pt-10 lg:pt-14">
      <Container>
        {/* Heading */}
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            Find your doctor
          </h1>
          <p className="mt-3 text-lg text-ink-soft">
            Search {DOCTORS.length} verified specialists by name, specialty, or
            condition.
          </p>
        </div>

        {/* Search bar */}
        <div className="glass-strong mt-7 flex flex-col gap-2 rounded-[var(--radius-xl2)] p-3 shadow-[var(--shadow-large)] sm:flex-row sm:items-center">
          <Input
            icon={Search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doctors, specialties, conditions..."
            aria-label="Search doctors"
            className="border-transparent shadow-none focus:ring-0"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              className="lg:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeFilterCount > 0 && (
                <Badge tone="primary" size="sm">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <Button variant="primary" size="md" className="flex-1 sm:flex-none">
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </div>

        {/* Quick specialty chips */}
        <div className="mt-5 flex flex-wrap gap-2">
          {SPECIALTIES.slice(0, 6).map((s) => {
            const Icon = s.icon;
            const active = specialty === s.slug;
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => setSpecialty(active ? null : s.slug)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  active
                    ? "border-primary bg-primary text-white shadow-[0_6px_16px_-6px_rgba(59,130,246,0.6)]"
                    : "border-border-soft bg-white text-ink-soft hover:border-primary/50 hover:bg-primary-bg hover:text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Body: sidebar + results */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-[var(--radius-card)] border border-border-soft bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-bold text-navy">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                Filters
              </h2>
              {filterPanel}
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink-soft">
                <span className="font-semibold text-navy">
                  {results.length}
                </span>{" "}
                {results.length === 1 ? "doctor" : "doctors"} found
              </p>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-ink-muted">Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-xl border border-border-soft bg-white px-3 py-2 text-sm font-medium text-navy focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {results.length === 0 ? (
              <div className="rounded-[var(--radius-card)] border border-dashed border-border-soft bg-white/60 p-12 text-center">
                <p className="font-display text-lg font-bold text-navy">
                  No doctors match your filters
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  Try broadening your search or clearing some filters.
                </p>
                <Button variant="outline" size="md" onClick={reset} className="mt-5">
                  Clear filters
                </Button>
              </div>
            ) : (
              <ul className="space-y-4">
                {results.map((doctor, i) => (
                  <motion.li
                    key={doctor.slug}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
                  >
                    <DoctorCard doctor={doctor} />
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Container>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[var(--radius-xl2)] bg-white p-6 shadow-[var(--shadow-floating)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-navy">Filters</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setFiltersOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-primary-bg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterPanel}
            <Button
              variant="primary"
              size="lg"
              className="mt-6 w-full"
              onClick={() => setFiltersOpen(false)}
            >
              Show {results.length} results
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}


