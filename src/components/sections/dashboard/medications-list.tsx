"use client";

import { Bell, Check, Clock, Pill, RefreshCw } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MEDICATIONS } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export function MedicationsList() {
  // Local "taken" state seeded from mock data — no backend.
  const [taken, setTaken] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(MEDICATIONS.map((m) => [m.name, m.taken]))
  );

  const takenCount = Object.values(taken).filter(Boolean).length;

  function refillIsSoon(refill: string) {
    const days = parseInt(refill, 10);
    return !Number.isNaN(days) && days <= 7;
  }

  return (
    <div>
      {/* Summary strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryTile
          icon={Pill}
          label="Active medications"
          value={`${MEDICATIONS.length}`}
          tile="bg-primary"
        />
        <SummaryTile
          icon={Check}
          label="Taken today"
          value={`${takenCount} / ${MEDICATIONS.length}`}
          tile="bg-success"
        />
        <SummaryTile
          icon={RefreshCw}
          label="Refills due soon"
          value={`${MEDICATIONS.filter((m) => refillIsSoon(m.refillIn)).length}`}
          tile="bg-warning"
        />
      </div>

      {/* List */}
      <ul className="mt-6 space-y-4">
        {MEDICATIONS.map((m) => {
          const isTaken = taken[m.name];
          const soon = refillIsSoon(m.refillIn);
          return (
            <li
              key={m.name}
              className="rounded-[var(--radius-card)] border border-border-soft bg-white p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-bg text-primary">
                  <Pill className="h-6 w-6" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-lg font-bold text-navy">
                      {m.name}
                    </h3>
                    <Badge tone="neutral" size="sm">
                      {m.dose}
                    </Badge>
                    {soon && (
                      <Badge tone="warning" size="sm">
                        Refill soon
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-soft">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-ink-muted" />
                      {m.schedule}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <RefreshCw className="h-4 w-4 text-ink-muted" />
                      Refill in {m.refillIn}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant={isTaken ? "outline" : "primary"}
                    size="sm"
                    onClick={() =>
                      setTaken((prev) => ({ ...prev, [m.name]: !prev[m.name] }))
                    }
                  >
                    <Check className="h-4 w-4" />
                    {isTaken ? "Taken" : "Mark taken"}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">Refill</span>
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Reminder banner */}
      <div className="mt-6 flex items-center gap-3 rounded-[var(--radius-card)] border border-primary/20 bg-primary-bg/60 p-4">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
          <Bell className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-navy">Medication reminders</p>
          <p className="text-sm text-ink-soft">
            Get a notification when it&apos;s time to take your medication.
          </p>
        </div>
        <Button variant="white" size="sm">
          Enable
        </Button>
      </div>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  tile,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tile: string;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border-soft bg-white p-5 shadow-[var(--shadow-soft)]">
      <span
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white",
          tile
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 font-display text-2xl font-bold text-navy">{value}</p>
      <p className="text-sm text-ink-soft">{label}</p>
    </div>
  );
}
