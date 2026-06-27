import * as React from "react";
import Link from "next/link";
import { Video, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { type Doctor } from "@/lib/doctors";
import { type Branch, getScheduleForDoctorAtBranch } from "@/lib/clinics";

export function DoctorAvailabilityCard({
  doctor,
  branch,
}: {
  doctor: Doctor;
  branch: Branch;
}) {
  const schedule = getScheduleForDoctorAtBranch(doctor.slug, branch.id);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link href={`/doctors/${doctor.slug}`} className="shrink-0">
          <Avatar name={doctor.name} size="lg" ring />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/doctors/${doctor.slug}`}
            className="font-semibold text-navy text-base hover:text-primary transition-colors block"
          >
            {doctor.name}
          </Link>
          <p className="text-xs text-ink-soft mt-0.5">{doctor.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <StarRating rating={doctor.rating} count={doctor.reviewCount} />
            {doctor.videoVisit && (
              <Badge tone="primary" size="sm" className="gap-1">
                <Video className="h-3 w-3 shrink-0" />
                Video visit
              </Badge>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start sm:items-end justify-center gap-2 border-t border-border-soft pt-3 sm:border-t-0 sm:pt-0 sm:pl-4 sm:border-l sm:min-w-[160px]">
          {schedule ? (
            <>
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">Consultation fee</span>
              <span className="text-lg font-bold text-navy">${schedule.feeUsd}</span>
              <span className="text-xs text-success flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                {schedule.slots[0] ? `Today, ${schedule.slots[0]}` : "Tomorrow"}
              </span>
              <Button variant="primary" size="sm" className="w-full mt-1" asChild>
                <Link href={`/book?doctor=${doctor.slug}&clinic=${branch.facilityId}&branch=${branch.slug}`}>
                  Book Appointment
                </Link>
              </Button>
            </>
          ) : (
            <span className="text-xs text-ink-muted">No scheduled slots</span>
          )}
        </div>
      </div>
    </Card>
  );
}
