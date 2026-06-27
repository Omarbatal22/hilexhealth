import {
  Bell,
  CalendarCheck,
  ChevronRight,
  MessageSquare,
  Search,
  Video,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import {
  PROVIDER,
  PROVIDER_STATS,
  TODAY_VISITS,
  PROVIDER_TASKS,
  PATIENT_ROSTER,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard | HelixHealth",
  description: "Clinician portal dashboard — schedule, tasks, and patient overview.",
};

export default function ProviderDashboardPage() {
  const providerShortName = PROVIDER.name.split(" ").slice(0, 2).join(" "); // Keep "Dr. Sarah"
  const recentPatients = PATIENT_ROSTER.slice(0, 3);

  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink-muted">Welcome back,</p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-navy">
              {providerShortName} 👋
            </h1>
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              aria-label="Search"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-soft bg-white text-ink-soft transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border-soft bg-white text-ink-soft transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-coral ring-2 ring-white" />
            </button>
            <Avatar name={PROVIDER.name} size="md" ring />
          </div>
        </div>

        {/* Stats tiles */}
        <Reveal className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {PROVIDER_STATS.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} interactive className="p-5">
                <span
                  className={cn(
                    "inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white",
                    s.tile
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 font-display text-2xl font-bold text-navy">
                  {s.value}
                  {s.unit && (
                    <span className="ml-1 text-sm font-medium text-ink-muted">
                      {s.unit}
                    </span>
                  )}
                </p>
                <p className="text-sm text-ink-soft">{s.label}</p>
              </Card>
            );
          })}
        </Reveal>

        {/* Two column layout */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Today&apos;s Schedule</CardTitle>
                <Link
                  href="/provider/schedule"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  Full schedule <ChevronRight className="h-4 w-4" />
                </Link>
              </CardHeader>
              <CardBody className="-mt-2 space-y-3">
                {TODAY_VISITS.length > 0 ? (
                  TODAY_VISITS.map((visit, i) => (
                    <div
                      key={`${visit.patientId}-${i}`}
                      className="flex flex-wrap items-center gap-4 rounded-2xl border border-border-soft bg-surface/50 p-4 transition-colors hover:border-primary/30"
                    >
                      <Avatar name={visit.patientName} size="md" ring />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/provider/patients/${visit.patientId}`}
                          className="font-semibold text-navy hover:text-primary"
                        >
                          {visit.patientName}
                        </Link>
                        <p className="text-sm text-ink-soft">{visit.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          tone={visit.mode === "Video visit" ? "primary" : "neutral"}
                          size="sm"
                        >
                          {visit.mode === "Video visit" ? (
                            <Video className="h-3.5 w-3.5" />
                          ) : (
                            <CalendarCheck className="h-3.5 w-3.5" />
                          )}
                          {visit.mode}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-navy">{visit.time}</p>
                        <p className="text-xs text-ink-muted">{visit.date}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-ink-soft py-4 text-center">
                    No visits scheduled for today.
                  </p>
                )}
              </CardBody>
            </Card>

            {/* Recent Patients */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Recent Patients</CardTitle>
                <Link
                  href="/provider/patients"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  All patients <ChevronRight className="h-4 w-4" />
                </Link>
              </CardHeader>
              <CardBody className="-mt-2 space-y-3">
                {recentPatients.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-2xl border border-border-soft bg-surface/50 p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={p.name} size="sm" ring />
                      <div>
                        <Link
                          href={`/provider/patients/${p.id}`}
                          className="text-sm font-semibold text-navy hover:text-primary"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-ink-muted">
                          {p.age} y/o · {p.primaryCondition}
                        </p>
                      </div>
                    </div>
                    <Badge tone={p.status === "Stable" ? "success" : p.status === "Needs review" ? "warning" : "primary"} size="sm">
                      {p.status}
                    </Badge>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Messages Promo */}
            <Card className="overflow-hidden border-ai/20">
              <CardBody className="bg-gradient-to-br from-ai/8 to-transparent">
                <span className="ai-glow inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-ai to-ai-light text-white">
                  <MessageSquare className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-navy">
                  Unread Patient Messages
                </h3>
                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  You have unread queries from your patient panel. Keep response times low to optimize clinic satisfaction metrics.
                </p>
                <Link
                  href="/provider/messages"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-ai px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6d2fd6]"
                >
                  Open Inbox <ArrowRight className="h-4 w-4" />
                </Link>
              </CardBody>
            </Card>

            {/* Provider Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Overdue & Pending Tasks</CardTitle>
              </CardHeader>
              <CardBody className="-mt-2 space-y-3">
                {PROVIDER_TASKS.map((task, i) => {
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface/50 p-3"
                    >
                      <span
                        className={cn(
                          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                          task.done
                            ? "bg-success/12 text-success"
                            : "bg-warning/14 text-[#b45309]"
                        )}
                      >
                        {task.done ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-navy leading-snug">
                          {task.label}
                        </p>
                        <p className="text-xs text-ink-muted">
                          Patient: {task.patientName}
                        </p>
                      </div>
                      <Badge tone={task.done ? "neutral" : "warning"} size="sm">
                        {task.due}
                      </Badge>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
