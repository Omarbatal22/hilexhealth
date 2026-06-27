import {
  ArrowRight,
  Bell,
  CalendarCheck,
  ChevronRight,
  Search,
  TrendingUp,
  Video,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import {
  HEALTH_STATS,
  MEDICATIONS,
  PATIENT,
  QUICK_ACTIONS,
  UPCOMING_APPOINTMENTS,
  WEEKLY_GOALS,
} from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard | HelixHealth",
  description: "Your health at a glance — appointments, vitals, and quick actions.",
};

const TONE_MAP = {
  primary: "from-primary to-primary-light",
  ai: "from-ai to-ai-light",
  teal: "from-teal to-cyan",
  warning: "from-[#f59e0b] to-[#fbbf24]",
} as const;

export default function DashboardPage() {
  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink-muted">Welcome back,</p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-navy">
              {PATIENT.name.split(" ")[0]} 👋
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
            <Avatar name={PATIENT.name} size="md" ring />
          </div>
        </div>

        {/* Health stat tiles */}
        <Reveal className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {HEALTH_STATS.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} interactive className="p-5">
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      "inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white",
                      s.tile
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <Badge tone="success" size="sm">
                    <TrendingUp className="h-3 w-3" /> {s.trend}
                  </Badge>
                </div>
                <p className="mt-4 font-display text-2xl font-bold text-navy">
                  {s.value}
                  <span className="ml-1 text-sm font-medium text-ink-muted">
                    {s.unit}
                  </span>
                </p>
                <p className="text-sm text-ink-soft">{s.label}</p>
              </Card>
            );
          })}
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* ---- Left column ---- */}
          <div className="space-y-6">
            {/* Upcoming appointments */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Upcoming appointments</CardTitle>
                <Link
                  href="/dashboard/appointments"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  View all <ChevronRight className="h-4 w-4" />
                </Link>
              </CardHeader>
              <CardBody className="-mt-2 space-y-3">
                {UPCOMING_APPOINTMENTS.map((a) => (
                  <div
                    key={`${a.doctorSlug}-${a.date}`}
                    className="flex flex-wrap items-center gap-4 rounded-2xl border border-border-soft bg-surface/50 p-4 transition-colors hover:border-primary/30"
                  >
                    <Avatar name={a.doctorName} size="md" ring />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/doctors/${a.doctorSlug}`}
                        className="font-semibold text-navy hover:text-primary"
                      >
                        {a.doctorName}
                      </Link>
                      <p className="text-sm text-ink-soft">{a.specialty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={a.mode === "Video visit" ? "primary" : "neutral"} size="sm">
                        {a.mode === "Video visit" ? (
                          <Video className="h-3.5 w-3.5" />
                        ) : (
                          <CalendarCheck className="h-3.5 w-3.5" />
                        )}
                        {a.mode}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-navy">{a.time}</p>
                      <p className="text-xs text-ink-muted">{a.date}</p>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            {/* Quick actions */}
            <div>
              <h2 className="mb-3 font-display text-lg font-bold tracking-tight text-navy">
                Quick actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {QUICK_ACTIONS.map((q) => {
                  const Icon = q.icon;
                  return (
                    <Link key={q.label} href={q.href} className="group">
                      <Card interactive className="h-full p-5">
                        <span
                          className={cn(
                            "inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white",
                            TONE_MAP[q.tone]
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <p className="mt-4 flex items-center gap-1 font-semibold text-navy">
                          {q.label}
                          <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                        </p>
                        <p className="text-sm text-ink-soft">{q.desc}</p>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ---- Right column ---- */}
          <div className="space-y-6">
            {/* AI assistant promo */}
            <Card className="overflow-hidden border-ai/20">
              <CardBody className="bg-gradient-to-br from-ai/8 to-transparent">
                <span className="ai-glow inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-ai to-ai-light text-white">
                  <Search className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-navy">
                  Ask your AI assistant
                </h3>
                <p className="mt-1 text-sm leading-6 text-ink-soft">
                  Get instant insights on symptoms, labs, and your health
                  trends.
                </p>
                <Link
                  href="/assistant"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-ai px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6d2fd6]"
                >
                  Start chatting <ArrowRight className="h-4 w-4" />
                </Link>
              </CardBody>
            </Card>

            {/* Weekly goals */}
            <Card>
              <CardHeader>
                <CardTitle>This week&apos;s goals</CardTitle>
              </CardHeader>
              <CardBody className="-mt-2 space-y-4">
                {WEEKLY_GOALS.map((g) => {
                  const Icon = g.icon;
                  const pct = Math.min(
                    100,
                    Math.round((g.current / g.target) * 100)
                  );
                  return (
                    <div key={g.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-2 font-medium text-navy">
                          <Icon className={cn("h-4 w-4", g.color)} />
                          {g.label}
                        </span>
                        <span className="text-ink-muted">
                          {g.current.toLocaleString()} / {g.target.toLocaleString()}{" "}
                          {g.unit}
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardBody>
            </Card>

            {/* Medications */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Medications</CardTitle>
                <Link
                  href="/dashboard/medications"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  Manage <ChevronRight className="h-4 w-4" />
                </Link>
              </CardHeader>
              <CardBody className="-mt-2 space-y-3">
                {MEDICATIONS.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface/50 p-3"
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
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
