"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Map, LayoutGrid, Star, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EASE } from "@/lib/motion";
import { FilterGroup, FilterRadio, FilterToggle } from "@/components/sections/search/filters";
import { ClinicCard } from "@/components/sections/clinics/clinic-card";
import { MapPlaceholder } from "@/components/ui/map-placeholder";
import Link from "next/link";
import {
  CLINICS,
  type FacilityType,
  isOpenNow,
  recommendClinics,
  getBranchesForClinic,
} from "@/lib/clinics";
import { GOVERNORATES, CITIES, AREAS } from "@/lib/site-data";

const TYPE_OPTIONS: { label: string; value: FacilityType | "all" }[] = [
  { label: "All Types", value: "all" },
  { label: "Medical Center", value: "medical_center" },
  { label: "Clinic", value: "clinic" },
  { label: "Dental Center", value: "dental_center" },
  { label: "Laboratory", value: "laboratory" },
  { label: "Hospital", value: "hospital" },
];

const RATING_OPTIONS = [
  { label: "Any Rating", value: 0 },
  { label: "4.8 & up", value: 4.8 },
  { label: "4.5 & up", value: 4.5 },
  { label: "4.0 & up", value: 4.0 },
];

const INSURANCE_OPTIONS = [
  { label: "All Insurances", value: "all" },
  { label: "AXA Insurance", value: "axa" },
  { label: "Allianz", value: "allianz" },
  { label: "MetLife", value: "metlife" },
  { label: "Bupa", value: "bupa" },
  { label: "Misr Insurance", value: "misr-insurance" },
  { label: "Self-Pay / Cash", value: "self-pay" },
];

type SortKey = "rating" | "branches" | "name";

export function ClinicSearch() {
  const searchParams = useSearchParams();

  // Load initial states from URL params if present
  const [query, setQuery] = React.useState(searchParams.get("query") || "");
  const [governorate, setGovernorate] = React.useState(searchParams.get("governorate") || "all");
  const [city, setCity] = React.useState(searchParams.get("city") || "all");
  const [area, setArea] = React.useState(searchParams.get("area") || "all");
  const [type, setType] = React.useState<FacilityType | "all">((searchParams.get("type") as FacilityType) || "all");
  const [minRating, setMinRating] = React.useState(Number(searchParams.get("rating")) || 0);
  const [insurance, setInsurance] = React.useState(searchParams.get("insurance") || "all");
  const [openOnly, setOpenOnly] = React.useState(searchParams.get("open") === "true");
  
  const [sort, setSort] = React.useState<SortKey>("rating");
  const [showMap, setShowMap] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  // Sync params helper
  const updateUrlParams = React.useCallback(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const params = {
        query,
        governorate,
        city,
        area,
        type,
        rating: minRating > 0 ? String(minRating) : null,
        insurance,
        open: openOnly ? "true" : null,
      };

      Object.entries(params).forEach(([key, val]) => {
        if (val && val !== "all" && val !== "") {
          url.searchParams.set(key, val);
        } else {
          url.searchParams.delete(key);
        }
      });
      window.history.pushState({}, "", url.toString());
    }
  }, [query, governorate, city, area, type, minRating, insurance, openOnly]);

  // Sync back to URL whenever states change
  React.useEffect(() => {
    updateUrlParams();
  }, [query, governorate, city, area, type, minRating, insurance, openOnly, updateUrlParams]);

  // Reset page synchronously during render when any filters change
  const filtersHash = `${query}-${governorate}-${city}-${area}-${type}-${minRating}-${insurance}-${openOnly}`;
  const [prevFiltersHash, setPrevFiltersHash] = React.useState(filtersHash);

  if (filtersHash !== prevFiltersHash) {
    setPrevFiltersHash(filtersHash);
    setCurrentPage(1);
  }

  // Compute active filter count
  const activeFilterCount =
    (governorate !== "all" ? 1 : 0) +
    (city !== "all" ? 1 : 0) +
    (area !== "all" ? 1 : 0) +
    (type !== "all" ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (insurance !== "all" ? 1 : 0) +
    (openOnly ? 1 : 0);

  const resetFilters = () => {
    setQuery("");
    setGovernorate("all");
    setCity("all");
    setArea("all");
    setType("all");
    setMinRating(0);
    setInsurance("all");
    setOpenOnly(false);
  };

  // Filter & Sort Logic
  const filteredClinics = React.useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = CLINICS.filter((c) => {
      // 1. Search Query
      if (q) {
        const text = `${c.name} ${c.tagline} ${c.description} ${c.specialtySlugs.join(" ")}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      // 2. Type Filter
      if (type !== "all" && c.type !== type) return false;

      // 3. Rating Filter
      if (c.rating < minRating) return false;

      // 4. Insurance Filter
      if (insurance !== "all" && !c.insuranceIds.includes(insurance)) return false;

      // 5. Governorate / City / Area / Open now filters (Requires branch lookup)
      const branches = getBranchesForClinic(c.id);
      
      if (governorate !== "all") {
        const matchesGov = branches.some(b => b.address.governorate === governorate);
        if (!matchesGov) return false;
      }

      if (city !== "all") {
        const matchesCity = branches.some(b => b.address.city === city);
        if (!matchesCity) return false;
      }

      if (area !== "all") {
        const matchesArea = branches.some(b => b.address.area === area);
        if (!matchesArea) return false;
      }

      if (openOnly) {
        const hasOpenBranch = branches.some(b => isOpenNow(b, new Date()));
        if (!hasOpenBranch) return false;
      }

      return true;
    });

    // Sort Logic
    return list.sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "branches") return b.branchIds.length - a.branchIds.length;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [query, type, minRating, insurance, governorate, city, area, openOnly, sort]);

  // AI Recommended rail clinics
  const aiRecommended = React.useMemo(() => {
    return recommendClinics({ limit: 4 });
  }, []);



  // Pagination (6 items per page)
  const pageSize = 6;
  const paginatedClinics = React.useMemo(() => {
    return filteredClinics.slice(0, currentPage * pageSize);
  }, [filteredClinics, currentPage]);

  const hasMore = filteredClinics.length > paginatedClinics.length;

  const filterPanel = (
    <div className="space-y-6">
      <FilterGroup title="Governorate">
        <select
          value={governorate}
          aria-label="Select Governorate"
          onChange={(e) => {
            setGovernorate(e.target.value);
            setCity("all");
            setArea("all");
          }}
          className="w-full rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm text-ink-soft focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Governorates</option>
          {GOVERNORATES.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </FilterGroup>

      {governorate !== "all" && (
        <FilterGroup title="City">
          <select
            value={city}
            aria-label="Select City"
            onChange={(e) => {
              setCity(e.target.value);
              setArea("all");
            }}
            className="w-full rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm text-ink-soft focus:border-primary focus:outline-none"
          >
            <option value="all">All Cities</option>
            {CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </FilterGroup>
      )}

      {city !== "all" && (
        <FilterGroup title="Area">
          <select
            value={area}
            aria-label="Select Area"
            onChange={(e) => setArea(e.target.value)}
            className="w-full rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm text-ink-soft focus:border-primary focus:outline-none"
          >
            <option value="all">All Areas</option>
            {AREAS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </FilterGroup>
      )}

      <FilterGroup title="Clinic Type">
        <div className="flex flex-col gap-1">
          {TYPE_OPTIONS.map((opt) => (
            <FilterRadio
              key={opt.value}
              label={opt.label}
              checked={type === opt.value}
              onClick={() => setType(opt.value)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Minimum Rating">
        <div className="flex flex-col gap-1">
          {RATING_OPTIONS.map((opt) => (
            <FilterRadio
              key={opt.value}
              label={opt.label}
              checked={minRating === opt.value}
              onClick={() => setMinRating(opt.value)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Accepted Insurance">
        <div className="flex flex-col gap-1">
          {INSURANCE_OPTIONS.map((opt) => (
            <FilterRadio
              key={opt.value}
              label={opt.label}
              checked={insurance === opt.value}
              onClick={() => setInsurance(opt.value)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <FilterToggle
          label="Open Now"
          checked={openOnly}
          onChange={setOpenOnly}
        />
      </FilterGroup>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="w-full gap-2">
          <X className="h-4 w-4" /> Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <section className="bg-gradient-to-b from-primary-bg via-soft-bg to-white pb-20 pt-10 lg:pt-14">
      <Container size="app">
        {/* Search bar & map toggle */}
        <div className="glass-strong flex flex-col gap-3 rounded-[var(--radius-xl2)] p-3 shadow-[var(--shadow-large)] sm:flex-row sm:items-center">
          <div className="flex-1 relative">
            <Input
              icon={Search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search medical centers, clinics, specialties..."
              aria-label="Search clinics"
              className="border-transparent shadow-none focus:ring-0 w-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowMap(!showMap)}
              className="gap-2"
            >
              {showMap ? (
                <>
                  <LayoutGrid className="h-4 w-4" /> List View
                </>
              ) : (
                <>
                  <Map className="h-4 w-4" /> Map View
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="md"
              className="lg:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeFilterCount > 0 && (
                <Badge tone="primary" size="sm" className="ml-1.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* AI recommended slider */}
        {activeFilterCount === 0 && !query && (
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-ai" />
              <h2 className="font-display text-xl font-bold text-navy">AI Recommended Clinics</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-2">
              {aiRecommended.map((facility) => (
                <div key={facility.id} className="border border-border-soft bg-white p-4 rounded-2xl flex flex-col justify-between hover:border-primary/40 transition-all duration-200 shadow-soft">
                  <div>
                    <h3 className="font-semibold text-navy line-clamp-1">{facility.name}</h3>
                    <p className="text-xs text-ink-soft mt-1 line-clamp-2">{facility.tagline}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-ink-soft">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      <span>{facility.rating} ({facility.reviewCount})</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                    <Link href={`/clinics/${facility.slug}`}>View Profile</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-[var(--radius-card)] border border-border-soft bg-white p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between border-b border-border-soft pb-4 mb-5">
                <span className="font-display font-bold text-navy text-base">Filters</span>
                {activeFilterCount > 0 && (
                  <Badge tone="primary" size="sm">
                    {activeFilterCount} active
                  </Badge>
                )}
              </div>
              {filterPanel}
            </div>
          </aside>

          {/* Results column */}
          <main className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-ink-soft">
                Found <span className="font-bold text-navy">{filteredClinics.length}</span>{" "}
                {filteredClinics.length === 1 ? "facility" : "facilities"}
              </p>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-muted">Sort by</span>
                <select
                  value={sort}
                  aria-label="Sort clinics by"
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-xl border border-border-soft bg-white px-2.5 py-1.5 text-xs font-semibold text-navy focus:outline-none"
                >
                  <option value="rating">Top Rated</option>
                  <option value="branches">Most Branches</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {showMap ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {filteredClinics.map((clinic) => {
                  const branches = getBranchesForClinic(clinic.id);
                  return branches.map((b) => (
                    <MapPlaceholder
                      key={b.id}
                      lat={b.geo.lat}
                      lng={b.geo.lng}
                      address={`${b.name} - ${b.address.street}, ${b.address.area}, ${b.address.governorate}`}
                    />
                  ));
                })}
                {filteredClinics.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-ink-muted">No branch locations match your active filters.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedClinics.map((clinic) => (
                  <ClinicCard key={clinic.id} facility={clinic} />
                ))}

                {filteredClinics.length === 0 && (
                  <div className="text-center py-16 bg-white border border-border-soft rounded-2xl p-6 shadow-soft">
                    <p className="text-lg font-semibold text-navy">No clinics found</p>
                    <p className="text-sm text-ink-soft mt-1">Try clearing some filters or searching for something else.</p>
                    <Button variant="primary" className="mt-4" onClick={resetFilters}>
                      Reset All Filters
                    </Button>
                  </div>
                )}

                {hasMore && (
                  <div className="flex justify-center pt-6">
                    <Button variant="outline" size="md" onClick={() => setCurrentPage(p => p + 1)}>
                      Load More Clinics
                    </Button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </Container>

      {/* Mobile Drawer (Filters) */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ ease: EASE, duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6 shadow-floating"
            >
              <div className="flex items-center justify-between border-b border-border-soft pb-4 mb-4">
                <span className="font-display font-bold text-navy text-lg">Filters</span>
                <button
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                  className="rounded-full bg-soft-bg p-2 text-ink-soft hover:bg-border-soft"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {filterPanel}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
