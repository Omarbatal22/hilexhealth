import * as React from "react";
import Link from "next/link";
import { MapPin, Building } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { ClinicBadge } from "@/components/ui/clinic-badge";
import { OpenNowPill } from "@/components/ui/open-now-pill";
import { type MedicalFacility, getBranchesForClinic } from "@/lib/clinics";
import { SPECIALTIES } from "@/lib/doctors";

export function ClinicCard({ facility }: { facility: MedicalFacility }) {
  const branches = getBranchesForClinic(facility.id);
  const primaryBranch = branches[0];
  const branchCount = branches.length;

  // Resolve top 3 specialty labels
  const resolvedSpecialties = facility.specialtySlugs
    .map((slug) => SPECIALTIES.find((s) => s.slug === slug))
    .filter(Boolean)
    .slice(0, 3);

  // Address text (Governorate, City or Area of the primary branch)
  const locationText = primaryBranch 
    ? `${primaryBranch.address.area}, ${primaryBranch.address.governorate}`
    : "Egypt";

  return (
    <Card interactive className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row">
        {/* Left icon box or gallery indicator */}
        <div className="shrink-0 flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-soft to-primary-soft/40 text-primary shadow-inner">
          <Building className="h-10 w-10 text-primary" />
        </div>

        {/* Identity & metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/clinics/${facility.slug}`}
                  className="font-display text-xl font-bold tracking-tight text-navy transition-colors hover:text-primary"
                >
                  {facility.name}
                </Link>
                <ClinicBadge type={facility.type} size="sm" />
              </div>
              <p className="mt-1 text-sm text-ink-soft line-clamp-1">{facility.tagline}</p>
            </div>
            {facility.featured && (
              <Badge tone="ai" size="sm">
                AI Recommended
              </Badge>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <StarRating rating={facility.rating} count={facility.reviewCount} />
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
              <MapPin className="h-4 w-4 text-ink-muted" />
              {locationText}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {resolvedSpecialties.map((spec) => (
              <Badge key={spec!.slug} tone="neutral" size="sm">
                {spec!.label}
              </Badge>
            ))}
            <span className="text-xs text-ink-muted ml-1">
              ({branchCount} {branchCount === 1 ? "branch" : "branches"})
            </span>
          </div>
        </div>

        {/* Branch / Action panel */}
        <div className="flex shrink-0 flex-col items-stretch justify-between gap-3 border-border-soft sm:w-48 sm:border-l sm:pl-6">
          <div className="text-right sm:text-left flex flex-col justify-center min-h-[50px]">
            {primaryBranch && (
              <div className="flex flex-col gap-1 items-start sm:items-stretch">
                <p className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">Primary Branch</p>
                <p className="text-sm font-semibold text-navy line-clamp-1">{primaryBranch.name}</p>
                <div className="mt-1">
                  <OpenNowPill branch={primaryBranch} />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="primary" size="md" asChild>
              <Link href={`/book?clinic=${facility.slug}`}>Book Appointment</Link>
            </Button>
            <Button variant="outline" size="md" asChild>
              <Link href={`/clinics/${facility.slug}`}>View Clinic</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
