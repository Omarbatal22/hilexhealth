"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X, User, Building, Landmark, MapPin } from "lucide-react";
import { DOCTORS } from "@/lib/doctors";
import { CLINICS } from "@/lib/clinics";
import { CITIES, AREAS } from "@/lib/site-data";


interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input when search opens
  React.useEffect(() => {
    if (open) {
      window.setTimeout(() => {
        setQuery("");
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Keyboard accessibility
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  // Derive matching items
  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { doctors: [], clinics: [], specialties: [], locations: [] };

    // Doctors (match name, specialty, bio)
    const matchedDoctors = DOCTORS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.focusAreas.some((fa) => fa.toLowerCase().includes(q))
    ).slice(0, 4);

    // Clinics (match name, type, tagline)
    const matchedClinics = CLINICS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
    ).slice(0, 4);

    // Specialties (match name/slug)
    const matchedSpecialties = Array.from(
      new Set(DOCTORS.map((d) => d.specialty))
    )
      .filter((spec) => spec.toLowerCase().includes(q))
      .slice(0, 3);

    // Cities / Areas (match Cairo/Giza/etc.)
    const matchedLocations = [
      ...CITIES.filter((c) => c.toLowerCase().includes(q)).map((c) => ({
        name: c,
        type: "City",
        href: `/clinics?governorate=${encodeURIComponent(c)}`,
      })),
      ...AREAS.filter((a) => a.toLowerCase().includes(q)).map((a) => ({
        name: a,
        type: "Area",
        href: `/clinics?area=${encodeURIComponent(a)}`,
      })),
    ].slice(0, 3);

    return {
      doctors: matchedDoctors,
      clinics: matchedClinics,
      specialties: matchedSpecialties,
      locations: matchedLocations,
    };
  }, [query]);

  const hasResults =
    results.doctors.length > 0 ||
    results.clinics.length > 0 ||
    results.specialties.length > 0 ||
    results.locations.length > 0;

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center bg-navy/60 backdrop-blur-sm p-4 pt-[10vh] animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-3xl border border-border-soft bg-white shadow-2xl overflow-hidden animate-scale-in">
        {/* Search header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-soft bg-surface/30">
          <Search className="h-5 w-5 text-ink-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doctors, medical centers, specialties, or areas..."
            className="flex-1 bg-transparent text-[15px] font-medium text-navy placeholder:text-ink-muted focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-ink-muted bg-surface border border-border-soft rounded-lg shrink-0">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1 rounded-full text-ink-muted hover:bg-surface hover:text-navy transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-6">
          {!query ? (
            <div className="py-6 text-center text-sm text-ink-muted">
              <Landmark className="h-8 w-8 text-ink-muted/50 mx-auto mb-2.5" />
              <p>Type to search HelixHealth directory</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuery("Cardiology")}
                  className="px-3 py-1 rounded-full bg-surface border border-border-soft text-xs text-ink-soft hover:border-primary hover:text-primary transition-colors"
                >
                  Cardiology
                </button>
                <button
                  type="button"
                  onClick={() => setQuery("Helix Medical")}
                  className="px-3 py-1 rounded-full bg-surface border border-border-soft text-xs text-ink-soft hover:border-primary hover:text-primary transition-colors"
                >
                  Helix Medical Center
                </button>
                <button
                  type="button"
                  onClick={() => setQuery("Nasr City")}
                  className="px-3 py-1 rounded-full bg-surface border border-border-soft text-xs text-ink-soft hover:border-primary hover:text-primary transition-colors"
                >
                  Nasr City
                </button>
              </div>
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-sm text-ink-muted">
              <Search className="h-8 w-8 text-ink-muted/30 mx-auto mb-2.5" />
              <p>No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-ink-muted/70 mt-1">
                Try searching specialties like Cardiology, or areas like Dokki or Maadi.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Doctors group */}
              {results.doctors.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                    Doctors ({results.doctors.length})
                  </h3>
                  <div className="grid gap-2">
                    {results.doctors.map((doc) => (
                      <Link
                        key={doc.slug}
                        href={`/doctors/${doc.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-primary-bg group transition-colors"
                      >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft/50 text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                          <User className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-navy group-hover:text-primary transition-colors">
                            {doc.name}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {doc.specialty} &middot; {doc.experienceYears} yrs exp
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinics group */}
              {results.clinics.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                    Clinics & Centers ({results.clinics.length})
                  </h3>
                  <div className="grid gap-2">
                    {results.clinics.map((clinic) => (
                      <Link
                        key={clinic.slug}
                        href={`/clinics/${clinic.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-primary-bg group transition-colors"
                      >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-success-soft/50 text-success group-hover:bg-success group-hover:text-white transition-colors shrink-0">
                          <Building className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-navy group-hover:text-primary transition-colors">
                            {clinic.name}
                          </p>
                          <p className="text-xs text-ink-muted capitalize">
                            {clinic.type.replace("_", " ")} &middot; {clinic.tagline}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialties group */}
              {results.specialties.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                    Specialties
                  </h3>
                  <div className="grid gap-1.5">
                    {results.specialties.map((spec) => (
                      <Link
                        key={spec}
                        href={`/doctors?specialty=${spec.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-surface/80 text-sm font-semibold text-navy transition-colors"
                      >
                        <span>{spec}</span>
                        <span className="text-xs font-normal text-ink-muted">View doctors &rarr;</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Locations group */}
              {results.locations.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                    Locations
                  </h3>
                  <div className="grid gap-2">
                    {results.locations.map((loc) => (
                      <Link
                        key={loc.name}
                        href={loc.href}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-surface/80 group transition-colors"
                      >
                        <MapPin className="h-4.5 w-4.5 text-ink-muted shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-navy group-hover:text-primary transition-colors">
                            {loc.name}
                          </p>
                          <p className="text-xs text-ink-muted">
                            Cairo/Giza Region ({loc.type})
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
