import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { type Amenity } from "@/lib/clinics";

export function FacilityBadge({ amenity }: { amenity: Amenity }) {
  const Icon = amenity.icon;
  return (
    <Badge tone="neutral" className="border border-border-soft/60">
      <Icon className="h-3.5 w-3.5 text-ink-muted shrink-0" />
      <span>{amenity.label}</span>
    </Badge>
  );
}
