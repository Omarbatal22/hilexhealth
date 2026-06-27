"use client";

import { Bell, Lock, ShieldCheck, Trash2, User } from "lucide-react";
import * as React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PATIENT } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

interface ToggleSetting {
  key: string;
  label: string;
  desc: string;
  group: "notifications" | "privacy";
}

const TOGGLES: ToggleSetting[] = [
  {
    key: "appt-reminders",
    label: "Appointment reminders",
    desc: "Email & push before each visit",
    group: "notifications",
  },
  {
    key: "med-reminders",
    label: "Medication reminders",
    desc: "Alerts when it's time for a dose",
    group: "notifications",
  },
  {
    key: "lab-results",
    label: "Lab result alerts",
    desc: "Notify me when results are ready",
    group: "notifications",
  },
  {
    key: "ai-tips",
    label: "AI health tips",
    desc: "Personalized weekly insights",
    group: "notifications",
  },
  {
    key: "share-records",
    label: "Share records with my care team",
    desc: "Doctors you book can view your history",
    group: "privacy",
  },
  {
    key: "data-research",
    label: "Anonymized research",
    desc: "Help improve care with de-identified data",
    group: "privacy",
  },
];

const DEFAULTS: Record<string, boolean> = {
  "appt-reminders": true,
  "med-reminders": true,
  "lab-results": true,
  "ai-tips": false,
  "share-records": true,
  "data-research": false,
};

export function SettingsForm() {
  const [toggles, setToggles] = React.useState(DEFAULTS);

  const set = (key: string) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Profile
          </CardTitle>
        </CardHeader>
        <CardBody className="-mt-2">
          <div className="flex items-center gap-4">
            <Avatar name={PATIENT.name} size="xl" ring />
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
            <LabeledInput label="Full name" defaultValue={PATIENT.name} />
            <LabeledInput label="Email" type="email" defaultValue="alex.morgan@example.com" />
            <LabeledInput label="Phone" type="tel" defaultValue="+1 (555) 012-3456" />
            <LabeledInput label="Date of birth" type="text" defaultValue="Mar 14, 1990" />
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

      {/* Notifications */}
      <ToggleCard
        icon={Bell}
        title="Notifications"
        settings={TOGGLES.filter((t) => t.group === "notifications")}
        toggles={toggles}
        onToggle={set}
      />

      {/* Privacy */}
      <ToggleCard
        icon={ShieldCheck}
        title="Privacy & Sharing"
        settings={TOGGLES.filter((t) => t.group === "privacy")}
        toggles={toggles}
        onToggle={set}
      />

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" /> Security
          </CardTitle>
        </CardHeader>
        <CardBody className="-mt-2 space-y-3">
          <Row
            title="Password"
            desc="Last changed 3 months ago"
            action={
              <Button variant="outline" size="sm">
                Change
              </Button>
            }
          />
          <Row
            title="Two-factor authentication"
            desc="Add an extra layer of security"
            action={
              <Button variant="outline" size="sm">
                Enable
              </Button>
            }
          />
        </CardBody>
      </Card>

      {/* Danger zone */}
      <Card className="border-error/25">
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-bold text-error">
                Delete account
              </h3>
              <p className="mt-1 text-sm text-ink-soft">
                Permanently remove your account and all associated data.
              </p>
            </div>
            <Button
              variant="outline"
              size="md"
              className="border-error/40 text-error hover:bg-error/10 hover:border-error"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </CardBody>
      </Card>
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
              role="switch"
              aria-checked={toggles[s.key]}
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

function Row({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-navy">{title}</p>
        <p className="text-sm text-ink-muted">{desc}</p>
      </div>
      {action}
    </div>
  );
}
