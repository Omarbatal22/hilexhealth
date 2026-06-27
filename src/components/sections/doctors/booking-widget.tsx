"use client";

import { CalendarCheck, Check, Video, MapPin } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { AVAILABILITY_DAYS, type Doctor } from "@/lib/doctors";
import { cn } from "@/lib/utils";
import { BRANCHES, getScheduleForDoctorAtBranch } from "@/lib/clinics";

export function BookingWidget({ doctor }: { doctor: Doctor }) {
  // Find branches this doctor practices at
  const doctorBranches = React.useMemo(() => {
    return BRANCHES.filter((b) => b.doctorIds.includes(doctor.slug));
  }, [doctor]);

  const [selectedBranchId, setSelectedBranchId] = React.useState(
    doctorBranches[0]?.id || ""
  );

  const activeBranch = React.useMemo(() => {
    return doctorBranches.find((b) => b.id === selectedBranchId);
  }, [doctorBranches, selectedBranchId]);



  const schedule = React.useMemo(() => {
    if (!activeBranch) return null;
    return getScheduleForDoctorAtBranch(doctor.slug, activeBranch.id);
  }, [doctor, activeBranch]);

  const slots = React.useMemo(() => {
    return schedule?.slots || ["9:00 AM", "10:30 AM", "2:15 PM", "4:30 PM"];
  }, [schedule]);

  const fee = schedule?.feeUsd || doctor.feeUsd;

  const firstOpen = AVAILABILITY_DAYS.findIndex((d) => d.slots > 0);
  const [dayIdx, setDayIdx] = React.useState(firstOpen === -1 ? 0 : firstOpen);
  const [slot, setSlot] = React.useState<string | null>(null);



  const selectedDateStr = `${AVAILABILITY_DAYS[dayIdx].day}, ${AVAILABILITY_DAYS[dayIdx].date}`;

  // Build redirection link to the wizard
  const confirmHref = activeBranch
    ? `/book?doctor=${doctor.slug}&clinic=${activeBranch.facilityId}&branch=${
        activeBranch.slug
      }&date=${encodeURIComponent(selectedDateStr)}&time=${encodeURIComponent(slot || "")}`
    : "#";

  return (
    <div className="rounded-[var(--radius-card)] border border-border-soft bg-white p-6 shadow-[var(--shadow-medium)]">
      {/* Branch Selector */}
      {doctorBranches.length > 1 && (
        <div className="mb-5">
          <label htmlFor="widget-branch" className="mb-2.5 block text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
            Select Clinic Branch
          </label>
          <select
            id="widget-branch"
            value={selectedBranchId}
            onChange={(e) => {
              setSelectedBranchId(e.target.value);
              setSlot(null);
            }}
            className="w-full rounded-xl border border-border-soft bg-surface px-3 py-2 text-sm text-ink-soft focus:border-primary focus:outline-none"
          >
            {doctorBranches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeBranch && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-surface/50 border border-border-soft/60 p-2.5 text-xs text-ink-soft">
          <MapPin className="h-4 w-4 text-ink-muted shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-navy">{activeBranch.name}</p>
            <p className="mt-0.5 text-ink-muted line-clamp-1">
              {activeBranch.address.street}, {activeBranch.address.area}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-xs text-ink-muted">Consultation fee</p>
          <p className="font-display text-3xl font-bold text-navy">
            ${fee}
          </p>
        </div>
        {doctor.videoVisit && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft/70 px-3 py-1 text-xs font-semibold text-primary">
            <Video className="h-3.5 w-3.5" /> Video available
          </span>
        )}
      </div>

      {/* Day picker */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
          Select a day
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {AVAILABILITY_DAYS.map((d, i) => {
            const disabled = d.slots === 0;
            const active = i === dayIdx;
            return (
              <button
                key={d.date}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setDayIdx(i);
                  setSlot(null);
                }}
                className={cn(
                  "flex flex-col items-center rounded-xl border px-1 py-2 text-center transition-all",
                  active
                    ? "border-primary bg-primary text-white shadow-[0_6px_16px_-6px_rgba(59,130,246,0.6)]"
                    : disabled
                      ? "cursor-not-allowed border-border-soft bg-surface text-ink-muted/50"
                      : "border-border-soft bg-white text-navy hover:border-primary/50 hover:bg-primary-bg"
                )}
              >
                <span className="text-[11px] font-medium opacity-80">
                  {d.day}
                </span>
                <span className="text-sm font-bold">
                  {d.date.split(" ")[1]}
                </span>
                <span
                  className={cn(
                    "mt-0.5 text-[10px]",
                    active ? "text-white/80" : "text-ink-muted"
                  )}
                >
                  {disabled ? "Full" : `${d.slots} open`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
          Available times
        </p>
        <div className="grid grid-cols-3 gap-2">
          {slots.map((t) => {
            const active = slot === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSlot(t)}
                className={cn(
                  "rounded-xl border px-2 py-2 text-sm font-medium transition-all",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-border-soft bg-white text-ink-soft hover:border-primary/50 hover:bg-primary-bg hover:text-primary"
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selection summary + CTA */}
      <div className="mt-6 space-y-3">
        {slot && (
          <p className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-sm font-medium text-success animate-fade-in">
            <Check className="h-4 w-4" />
            {selectedDateStr} at {slot}
          </p>
        )}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!slot}
          asChild={!!slot}
        >
          {slot ? (
            <Link href={confirmHref}>
              <CalendarCheck className="h-5 w-5" /> Confirm booking
            </Link>
          ) : (
            <span>
              <CalendarCheck className="h-5 w-5" /> Select a time
            </span>
          )}
        </Button>
        <p className="text-center text-xs text-ink-muted">
          Free cancellation up to 24h before your visit
        </p>
      </div>
    </div>
  );
}
