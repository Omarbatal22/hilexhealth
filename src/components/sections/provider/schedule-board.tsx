"use client";

import { Calendar, Clock, MapPin, Video } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TODAY_VISITS,
  UPCOMING_VISITS,
  PAST_VISITS,
  type ScheduleVisit,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

type Tab = "today" | "upcoming" | "past";
const TABS: Tab[] = ["today", "upcoming", "past"];

const STATUS_TONES: Record<ScheduleVisit["status"], Parameters<typeof Badge>[0]["tone"]> = {
  Confirmed: "success",
  Pending: "warning",
  "Checked in": "primary",
  Completed: "neutral",
};

export function ScheduleBoard() {
  const [activeTab, setActiveTab] = React.useState<Tab>("today");

  const getList = () => {
    switch (activeTab) {
      case "today":
        return TODAY_VISITS;
      case "upcoming":
        return UPCOMING_VISITS;
      case "past":
        return PAST_VISITS;
    }
  };

  const list = getList();

  const getCount = (tab: Tab) => {
    switch (tab) {
      case "today":
        return TODAY_VISITS.length;
      case "upcoming":
        return UPCOMING_VISITS.length;
      case "past":
        return PAST_VISITS.length;
    }
  };

  return (
    <div>
      {/* Tabs */}
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
            {t}{" "}
            <span className={activeTab === t ? "text-white/80" : "text-ink-muted"}>
              ({getCount(t)})
            </span>
          </button>
        ))}
      </div>

      {/* Roster / Rows */}
      {list.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {list.map((visit, i) => (
            <li
              key={`${visit.patientId}-${visit.date}-${visit.time}-${i}`}
              className="rounded-[var(--radius-card)] border border-border-soft bg-white p-5 shadow-[var(--shadow-soft)] transition-all hover:shadow-[var(--shadow-medium)]"
            >
              <div className="flex flex-wrap items-center gap-4">
                <Avatar name={visit.patientName} size="lg" ring />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/provider/patients/${visit.patientId}`}
                      className="font-display text-lg font-bold text-navy hover:text-primary"
                    >
                      {visit.patientName}
                    </Link>
                    <Badge tone={STATUS_TONES[visit.status]} size="sm">
                      {visit.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-ink-soft">{visit.reason}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-ink-soft">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-ink-muted" />
                      {visit.date}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-ink-muted" />
                      {visit.time}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      {visit.mode === "Video visit" ? (
                        <Video className="h-4 w-4 text-ink-muted" />
                      ) : (
                        <MapPin className="h-4 w-4 text-ink-muted" />
                      )}
                      {visit.mode}
                    </span>
                  </div>
                </div>

                {/* Contextual actions */}
                <div className="flex shrink-0 gap-2">
                  {activeTab === "today" && (
                    <>
                      {visit.status === "Checked in" ? (
                        <Button variant="primary" size="sm">
                          {visit.mode === "Video visit" ? (
                            <>
                              <Video className="h-4 w-4" /> Start video visit
                            </>
                          ) : (
                            "Start visit"
                          )}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          Check in
                        </Button>
                      )}
                    </>
                  )}
                  {activeTab === "upcoming" && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/provider/patients/${visit.patientId}`}>
                          View chart
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    </>
                  )}
                  {activeTab === "past" && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/provider/patients/${visit.patientId}?tab=notes`}>
                          View notes
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-border-soft bg-white/60 p-12 text-center">
          <Calendar className="h-10 w-10 text-ink-muted mx-auto mb-3" />
          <p className="font-display text-lg font-bold text-navy">
            No {activeTab} visits
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            There are no appointments listed for this section.
          </p>
        </div>
      )}
    </div>
  );
}
