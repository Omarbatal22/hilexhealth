import * as React from "react";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OpenNowPill } from "@/components/ui/open-now-pill";
import { type Branch } from "@/lib/clinics";

export function BranchCard({ branch, clinicSlug }: { branch: Branch; clinicSlug: string }) {
  return (
    <Card interactive className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-navy text-sm">{branch.name}</h4>
            <OpenNowPill branch={branch} />
          </div>
          <p className="text-xs text-ink-soft mt-1.5 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-ink-muted shrink-0" />
            <span className="line-clamp-1">
              {branch.address.street}, {branch.address.area}, {branch.address.governorate}
            </span>
          </p>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0 p-1" asChild>
          <Link href={`/clinics/${clinicSlug}/branches/${branch.slug}`} aria-label={`View details for ${branch.name}`}>
            <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
