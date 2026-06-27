"use client";

import { MapPin, Search, Video, User } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  PATIENT_ROSTER,
  type PatientStatus,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

type StatusFilter = "All" | PatientStatus;
const STATUS_OPTIONS: StatusFilter[] = ["All", "Active", "Needs review", "Stable", "New"];

const STATUS_TONES: Record<PatientStatus, Parameters<typeof Badge>[0]["tone"]> = {
  Active: "primary",
  "Needs review": "warning",
  Stable: "success",
  New: "neutral",
};

export function PatientRoster() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("All");

  const filteredPatients = PATIENT_ROSTER.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.primaryCondition.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "All" || p.status === status;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input */}
        <div className="w-full max-w-md">
          <Input
            placeholder="Search patients by name or condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-1.5 rounded-full border border-border-soft bg-white p-1 self-start">
          {STATUS_OPTIONS.map((opt) => {
            const active = status === opt;
            const count = opt === "All"
              ? PATIENT_ROSTER.length
              : PATIENT_ROSTER.filter((p) => p.status === opt).length;

            return (
              <button
                key={opt}
                type="button"
                onClick={() => setStatus(opt)}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold capitalize transition-colors",
                  active
                    ? "bg-primary text-white shadow-[0_4px_12px_-4px_rgba(59,130,246,0.6)]"
                    : "text-ink-soft hover:text-primary"
                )}
              >
                {opt}{" "}
                <span className={active ? "text-white/85" : "text-ink-muted/80"}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Roster list */}
      {filteredPatients.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {filteredPatients.map((p) => (
            <li key={p.id}>
              <Card interactive className="p-5 h-full flex flex-col justify-between">
                <div className="flex items-start gap-4">
                  <Avatar name={p.name} size="lg" ring />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/provider/patients/${p.id}`}
                        className="font-display text-lg font-bold text-navy hover:text-primary transition-colors"
                      >
                        {p.name}
                      </Link>
                      <Badge tone={STATUS_TONES[p.status]} size="sm">
                        {p.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-ink-soft mt-0.5">{p.age} y/o · {p.gender}</p>
                    <p className="text-sm font-semibold text-navy mt-2">
                      Condition: <span className="font-normal text-ink-soft">{p.primaryCondition}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border-soft flex flex-wrap items-center justify-between gap-3 text-xs text-ink-soft">
                  <div className="flex flex-col gap-1">
                    <span className="text-ink-muted">Last Visit</span>
                    <span className="font-medium text-navy">{p.lastVisit}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-ink-muted">Next Visit</span>
                    <span className="font-medium text-navy flex items-center gap-1">
                      {p.nextVisit !== "—" && p.mode === "Video visit" ? (
                        <Video className="h-3.5 w-3.5 text-primary shrink-0" />
                      ) : p.nextVisit !== "—" ? (
                        <MapPin className="h-3.5 w-3.5 text-ink-muted shrink-0" />
                      ) : null}
                      {p.nextVisit}
                    </span>
                  </div>
                  <Link
                    href={`/provider/patients/${p.id}`}
                    className="inline-flex h-8 items-center justify-center rounded-lg bg-primary-bg px-3 font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    Open Chart
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-dashed border-border-soft bg-white/60 p-12 text-center">
          <User className="h-10 w-10 text-ink-muted mx-auto mb-3" />
          <p className="font-display text-lg font-bold text-navy">No patients found</p>
          <p className="mt-2 text-sm text-ink-soft">
            Try adjusting your search query or status filter.
          </p>
        </div>
      )}
    </div>
  );
}
