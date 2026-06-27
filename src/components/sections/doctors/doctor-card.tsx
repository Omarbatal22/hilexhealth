import {
  BadgeCheck,
  CalendarCheck,
  MapPin,
  Video,
} from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import type { Doctor } from "@/lib/doctors";

/**
 * Doctor result card used on the search page. Left: avatar + verified mark.
 * Middle: identity, rating, meta. Right: fee + booking CTAs.
 */
export function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <Card interactive className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row">
        {/* Avatar */}
        <div className="relative shrink-0">
          <Link href={`/doctors/${doctor.slug}`}>
            <Avatar name={doctor.name} size="xl" ring />
          </Link>
          <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center rounded-full bg-white p-0.5">
            <BadgeCheck className="h-6 w-6 text-primary" />
          </span>
        </div>

        {/* Identity + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/doctors/${doctor.slug}`}
                className="font-display text-xl font-bold tracking-tight text-navy transition-colors hover:text-primary"
              >
                {doctor.name}
              </Link>
              <p className="mt-0.5 text-sm text-ink-soft">{doctor.title}</p>
            </div>
            {doctor.availableToday && (
              <Badge tone="success" size="sm">
                Available today
              </Badge>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <StarRating rating={doctor.rating} count={doctor.reviewCount} />
            <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
              <MapPin className="h-4 w-4 text-ink-muted" />
              {doctor.location} · {doctor.distanceMi} mi
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="neutral" size="sm">
              {doctor.specialty}
            </Badge>
            <Badge tone="neutral" size="sm">
              {doctor.experienceYears} yrs exp
            </Badge>
            {doctor.videoVisit && (
              <Badge tone="primary" size="sm">
                <Video className="h-3.5 w-3.5" /> Video visit
              </Badge>
            )}
          </div>
        </div>

        {/* Fee + actions */}
        <div className="flex shrink-0 flex-col items-stretch justify-between gap-3 border-border-soft sm:w-48 sm:border-l sm:pl-6">
          <div className="text-right sm:text-left">
            <p className="text-xs text-ink-muted">Consultation fee</p>
            <p className="font-display text-2xl font-bold text-navy">
              ${doctor.feeUsd}
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-success">
              <CalendarCheck className="h-3.5 w-3.5" />
              {doctor.nextAvailable}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="primary" size="md" asChild>
              <Link href={`/book/${doctor.slug}`}>Book now</Link>
            </Button>
            <Button variant="outline" size="md" asChild>
              <Link href={`/doctors/${doctor.slug}`}>View profile</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
