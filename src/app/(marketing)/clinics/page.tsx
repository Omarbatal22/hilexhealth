import type { Metadata } from "next";
import { ClinicSearch } from "@/components/sections/clinics/clinic-search";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Clinics & Medical Centers | HelixHealth",
  description:
    "Search verified clinics, medical centers, and hospitals. Filter by governorate, city, amenities, accepted insurance, and availability.",
};

export default function ClinicsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-ink-muted">Loading Directory...</div>}>
      <ClinicSearch />
    </Suspense>
  );
}
