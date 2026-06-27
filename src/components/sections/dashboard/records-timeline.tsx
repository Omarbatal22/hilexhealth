"use client";

import { motion } from "framer-motion";
import {
  Download,
  FlaskConical,
  ScanLine,
  Stethoscope,
  Syringe,
  Pill,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EASE } from "@/lib/motion";
import { RECORDS, type RecordEntry } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

type RecordType = RecordEntry["type"];

const TYPE_META: Record<
  RecordType,
  { icon: LucideIcon; tile: string; badge: Parameters<typeof Badge>[0]["tone"] }
> = {
  Visit: { icon: Stethoscope, tile: "bg-primary", badge: "primary" },
  Lab: { icon: FlaskConical, tile: "bg-teal", badge: "teal" },
  Imaging: { icon: ScanLine, tile: "bg-ai", badge: "ai" },
  Prescription: { icon: Pill, tile: "bg-warning", badge: "warning" },
  Vaccine: { icon: Syringe, tile: "bg-success", badge: "success" },
};

const FILTERS: ("All" | RecordType)[] = [
  "All",
  "Visit",
  "Lab",
  "Imaging",
  "Vaccine",
];

export function RecordsTimeline() {
  const [filter, setFilter] = React.useState<"All" | RecordType>("All");

  const records =
    filter === "All" ? RECORDS : RECORDS.filter((r) => r.type === filter);

  return (
    <div>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                active
                  ? "border-primary bg-primary text-white shadow-[0_6px_16px_-6px_rgba(59,130,246,0.6)]"
                  : "border-border-soft bg-white text-ink-soft hover:border-primary/50 hover:bg-primary-bg hover:text-primary"
              )}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <ol className="relative mt-8 space-y-6 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border-soft sm:before:left-[23px]">
        {records.map((r, i) => {
          const meta = TYPE_META[r.type];
          const Icon = meta.icon;
          return (
            <motion.li
              key={`${r.title}-${r.date}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
              className="relative flex gap-4 sm:gap-5"
            >
              <span
                className={cn(
                  "relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ring-4 ring-soft-bg sm:h-12 sm:w-12",
                  meta.tile
                )}
              >
                <Icon className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1 rounded-[var(--radius-card)] border border-border-soft bg-white p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-medium)]">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-bold text-navy">
                        {r.title}
                      </h3>
                      <Badge tone={meta.badge} size="sm">
                        {r.type}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {r.doctor} · {r.date}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Download ${r.title}`}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-primary-bg hover:text-primary"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6 text-ink-soft">
                  {r.summary}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ol>

      {records.length === 0 && (
        <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-border-soft bg-white/60 p-12 text-center">
          <p className="font-display text-lg font-bold text-navy">
            No {filter.toLowerCase()} records yet
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Records will appear here after your visits.
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button variant="outline" size="md">
          <Download className="h-4 w-4" /> Export full history
        </Button>
      </div>
    </div>
  );
}
