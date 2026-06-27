"use client";

import {
  Download,
  FileText,
  FlaskConical,
  Pill,
  ScanLine,
  Stethoscope,
  Syringe,
} from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { getRosterPatient, type RecordEntry } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

type Tab = "overview" | "records" | "medications" | "notes";
const TABS: Tab[] = ["overview", "records", "medications", "notes"];

const RECORD_META: Record<
  RecordEntry["type"],
  { icon: React.ComponentType<{ className?: string }>; tile: string; badge: Parameters<typeof Badge>[0]["tone"] }
> = {
  Visit: { icon: Stethoscope, tile: "bg-primary", badge: "primary" },
  Lab: { icon: FlaskConical, tile: "bg-teal", badge: "teal" },
  Imaging: { icon: ScanLine, tile: "bg-ai", badge: "ai" },
  Prescription: { icon: Pill, tile: "bg-warning", badge: "warning" },
  Vaccine: { icon: Syringe, tile: "bg-success", badge: "success" },
};

export function PatientDetail({ patientId }: { patientId: string }) {
  const patient = getRosterPatient(patientId)!;
  const params = useSearchParams();
  const requested = params.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = React.useState<Tab>(
    requested && TABS.includes(requested) ? requested : "overview"
  );
  const [noteText, setNoteText] = React.useState("");

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="inline-flex rounded-full border border-border-soft bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors",
              activeTab === t
                ? "bg-primary text-white shadow-[0_6px_16px_-6px_rgba(59,130,246,0.6)]"
                : "text-ink-soft hover:text-primary"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-4">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Vitals tiles */}
            {patient.vitals && patient.vitals.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {patient.vitals.map((v) => {
                  const Icon = v.icon;
                  return (
                    <Card key={v.label} className="p-5">
                      <span
                        className={cn(
                          "inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white",
                          v.tile
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <p className="mt-4 font-display text-2xl font-bold text-navy">
                        {v.value}
                        <span className="ml-1 text-sm font-medium text-ink-muted">
                          {v.unit}
                        </span>
                      </p>
                      <p className="text-sm text-ink-soft">{v.label}</p>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-6 text-center text-ink-soft">
                No recent vitals logged for this patient.
              </Card>
            )}

            {/* Quick summary */}
            <Card>
              <CardHeader>
                <CardTitle>Clinical Summary</CardTitle>
              </CardHeader>
              <CardBody className="-mt-2">
                <p className="text-[15px] leading-7 text-ink-soft">
                  Patient is a {patient.age}-year-old {patient.gender.toLowerCase()} diagnosed with{" "}
                  <span className="font-semibold text-navy">{patient.primaryCondition}</span>. Their last clinical visit was on{" "}
                  <span className="font-medium text-navy">{patient.lastVisit}</span>, and their next scheduled visit is on{" "}
                  <span className="font-medium text-navy">{patient.nextVisit}</span> ({patient.mode}).
                </p>
                {patient.notes && (
                  <div className="mt-4 rounded-xl bg-soft-bg p-4 border border-border-soft">
                    <p className="text-sm font-bold text-navy mb-1">Latest Clinical Note</p>
                    <p className="text-sm leading-6 text-ink-soft italic">&ldquo;{patient.notes}&rdquo;</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        )}

        {activeTab === "records" && (
          <div className="space-y-6">
            {patient.records && patient.records.length > 0 ? (
              <ol className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border-soft sm:before:left-[23px]">
                {patient.records.map((r, i) => {
                  const meta = RECORD_META[r.type] || { icon: FileText, tile: "bg-primary", badge: "primary" };
                  const Icon = meta.icon;
                  return (
                    <li key={i} className="relative flex gap-4 sm:gap-5">
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
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="rounded-[var(--radius-card)] border border-dashed border-border-soft bg-white/60 p-12 text-center">
                <FileText className="h-10 w-10 text-ink-muted mx-auto mb-3" />
                <p className="font-display text-lg font-bold text-navy">No records found</p>
                <p className="mt-2 text-sm text-ink-soft">
                  There are no documented health records or lab files for this patient.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "medications" && (
          <Card>
            <CardHeader>
              <CardTitle>Active Medications</CardTitle>
            </CardHeader>
            <CardBody className="-mt-2">
              {patient.medications && patient.medications.length > 0 ? (
                <div className="space-y-3">
                  {patient.medications.map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface/50 p-3.5"
                    >
                      <span
                        className={cn(
                          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                          m.taken
                            ? "bg-success/12 text-success"
                            : "bg-warning/14 text-[#b45309]"
                        )}
                      >
                        {m.taken ? "✓" : "!"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-navy">
                          {m.name}{" "}
                          <span className="font-normal text-ink-muted">
                            {m.dose}
                          </span>
                        </p>
                        <p className="text-xs text-ink-muted">{m.schedule}</p>
                      </div>
                      <span className="text-right text-xs text-ink-muted">
                        Refill in
                        <br />
                        <span className="font-semibold text-navy">
                          {m.refillIn}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-ink-soft">
                  Patient is not currently prescribed any active medications.
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {activeTab === "notes" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Notes</CardTitle>
              </CardHeader>
              <CardBody className="-mt-2 space-y-4">
                <div className="rounded-xl border border-border-soft bg-surface/50 p-4">
                  <p className="text-sm font-semibold text-navy mb-1">Existing Notes</p>
                  <p className="text-sm leading-6 text-ink-soft">
                    {patient.notes || "No general notes recorded for this patient."}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="add-note-textarea" className="block text-sm font-semibold text-navy">
                    Add new note
                  </label>
                  <textarea
                    id="add-note-textarea"
                    rows={4}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter clinical observations, visit details, or instructions..."
                    className="w-full rounded-2xl border border-border-soft bg-white p-4 text-[15px] text-navy placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 transition-all resize-none"
                  />
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        setNoteText("");
                      }}
                    >
                      Save note
                    </Button>
                    <Button variant="ghost" size="md" onClick={() => setNoteText("")}>
                      Clear
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
