import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { ClinicBadge } from "@/components/ui/clinic-badge";
import { type MedicalFacility, getRelatedClinics } from "@/lib/clinics";

export function RelatedClinics({ facility }: { facility: MedicalFacility }) {
  const related = getRelatedClinics(facility, 3);
  if (related.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-display font-bold text-navy text-sm">Similar Facilities</h3>
      <div className="space-y-3">
        {related.map((c) => (
          <Card key={c.id} interactive className="p-0 overflow-hidden">
            <Link href={`/clinics/${c.slug}`} className="flex flex-col gap-2 p-4 block">
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-semibold text-navy text-xs line-clamp-1">{c.name}</h4>
                <ClinicBadge type={c.type} size="sm" className="shrink-0" />
              </div>
              <p className="text-[11px] text-ink-soft line-clamp-1">{c.tagline}</p>
              <StarRating rating={c.rating} count={c.reviewCount} size="sm" />
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
