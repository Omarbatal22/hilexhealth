"use client";

import {
  CalendarCheck,
  CalendarX,
  Clock,
  MapPin,
  RefreshCw,
  Video,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PAST_APPOINTMENTS,
  UPCOMING_APPOINTMENTS,
  type Appointment,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

type Tab = "upcoming" | "past";

export function AppointmentsList() {
  const [tab, setTab] = React.useState<Tab>("upcoming");
  const list = tab === "upcoming" ? UPCOMING_APPOINTMENTS : PAST_APPOINTMENTS;

  return (
    <div>
      {/* Tabs */}
      <div className="inline-flex rounded-full border border-border-soft bg-white p-1">
        {(["upcoming", "past"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors",
              tab === t
                ? "bg-primary text-white shadow-[0_6px_16px_-6px_rgba(59,130,246,0.6)]"
                : "text-ink-soft hover:text-primary"
            )}
          >
            {t}{" "}
            <span className={tab === t ? "text-white/80" : "text-ink-muted"}>
              (
              {t === "upcoming"
                ? UPCOMING_APPOINTMENTS.length
                : PAST_APPOINTMENTS.length}
              )
            </span>
          </button>
        ))}
      </div>

      <ul className="mt-6 space-y-4">
        {list.map((a) => (
          <AppointmentRow
            key={`${a.doctorSlug}-${a.date}`}
            appt={a}
            past={tab === "past"}
          />
        ))}
      </ul>
    </div>
  );
}

function AppointmentRow({
  appt,
  past,
}: {
  appt: Appointment;
  past: boolean;
}) {
  return (
    <li className="rounded-[var(--radius-card)] border border-border-soft bg-white p-5 shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-medium)]">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={appt.doctorName} size="lg" ring />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/doctors/${appt.doctorSlug}`}
              className="font-display text-lg font-bold text-navy hover:text-primary"
            >
              {appt.doctorName}
            </Link>
            {!past && (
              <Badge
                tone={appt.status === "Confirmed" ? "success" : "warning"}
                size="sm"
              >
                {appt.status}
              </Badge>
            )}
          </div>
          <p className="text-sm text-ink-soft">{appt.specialty}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck className="h-4 w-4 text-ink-muted" />
              {appt.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-ink-muted" />
              {appt.time}
            </span>
            <span className="inline-flex items-center gap-1.5">
              {appt.mode === "Video visit" ? (
                <Video className="h-4 w-4 text-ink-muted" />
              ) : (
                <MapPin className="h-4 w-4 text-ink-muted" />
              )}
              {appt.mode}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 gap-2">
          {past ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/book/${appt.doctorSlug}`}>
                <RefreshCw className="h-4 w-4" /> Book again
              </Link>
            </Button>
          ) : (
            <>
              {appt.mode === "Video visit" && appt.status === "Confirmed" && (
                <Button variant="primary" size="sm">
                  <Video className="h-4 w-4" /> Join
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/book/${appt.doctorSlug}`}>Reschedule</Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-error hover:bg-error/10 hover:text-error"
              >
                <CalendarX className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Cancel</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
