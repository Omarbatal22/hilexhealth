"use client";

import { Bell, Calendar, User } from "lucide-react";
import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PROVIDER } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

interface ToggleSetting {
  key: string;
  label: string;
  desc: string;
  group: "availability" | "notifications";
}

const TOGGLES: ToggleSetting[] = [
  {
    key: "accept-new",
    label: "Accepting new patients",
    desc: "Allow patients to book initial intakes directly",
    group: "availability",
  },
  {
    key: "video-visits",
    label: "Enable video consultations",
    desc: "Conduct virtual follow-ups and care reviews",
    group: "availability",
  },
  {
    key: "appt-alerts",
    label: "Appointment updates",
    desc: "Alerts on new bookings, reschedules, or cancellations",
    group: "notifications",
  },
  {
    key: "msg-alerts",
    label: "Patient messages",
    desc: "Instant notification for unread patient queries",
    group: "notifications",
  },
  {
    key: "task-alerts",
    label: "Clinical task reminders",
    desc: "Checklist alert warnings for overdue tasks",
    group: "notifications",
  },
];

const DEFAULTS: Record<string, boolean> = {
  "accept-new": true,
  "video-visits": true,
  "appt-alerts": true,
  "msg-alerts": true,
  "task-alerts": false,
};

export function ProviderSettingsForm() {
  const [toggles, setToggles] = React.useState(DEFAULTS);

  const set = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Profile Details
          </CardTitle>
        </CardHeader>
        <CardBody className="-mt-2">
          <div className="flex items-center gap-4">
            <Avatar name={PROVIDER.name} size="xl" ring />
            <div>
              <Button variant="outline" size="sm">
                Change photo
              </Button>
              <p className="mt-2 text-xs text-ink-muted">
                JPG or PNG, up to 4MB
              </p>
            </div>
          </div>

          <form
            className="mt-6 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <LabeledInput label="Full name" defaultValue={PROVIDER.name} />
            <LabeledInput label="Specialty" defaultValue={PROVIDER.specialty} />
            <LabeledInput label="Email address" type="email" defaultValue="sarah.johnson@helixhealth.com" />
            <LabeledInput label="Office location" defaultValue={PROVIDER.location} />
          </form>

          <div className="mt-5 flex gap-3">
            <Button variant="primary" size="md">
              Save changes
            </Button>
            <Button variant="ghost" size="md">
              Cancel
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Availability Settings */}
      <ToggleCard
        icon={Calendar}
        title="Availability & Booking"
        settings={TOGGLES.filter((t) => t.group === "availability")}
        toggles={toggles}
        onToggle={set}
      />

      {/* Notifications Settings */}
      <ToggleCard
        icon={Bell}
        title="Notification Settings"
        settings={TOGGLES.filter((t) => t.group === "notifications")}
        toggles={toggles}
        onToggle={set}
      />
    </div>
  );
}

function LabeledInput({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy">
        {label}
      </span>
      <Input {...props} />
    </label>
  );
}

function ToggleCard({
  icon: Icon,
  title,
  settings,
  toggles,
  onToggle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  settings: ToggleSetting[];
  toggles: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardBody className="-mt-2 divide-y divide-border-soft">
        {settings.map((s) => (
          <div
            key={s.key}
            className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy">{s.label}</p>
              <p className="text-sm text-ink-muted">{s.desc}</p>
            </div>
            <button
              type="button"
              aria-label={s.label}
              onClick={() => onToggle(s.key)}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                toggles[s.key] ? "bg-primary" : "bg-border-soft"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                  toggles[s.key] ? "translate-x-[22px]" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
