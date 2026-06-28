import * as React from "react";
import { Bell, Bot, Megaphone } from "lucide-react";
import { StepShell } from "./step-shell";
import { OnboardingData } from "@/lib/onboarding-data";
import { cn } from "@/lib/utils";

interface StepPreferencesProps {
  formData: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PREFS = [
  {
    key: "prefReminders" as const,
    icon: Bell,
    title: "Appointment reminders",
    desc: "Get SMS and email reminders before your upcoming visits.",
  },
  {
    key: "prefAiRecs" as const,
    icon: Bot,
    title: "AI health recommendations",
    desc: "Receive personalized insights based on your profile and medical history.",
  },
  {
    key: "prefUpdates" as const,
    icon: Megaphone,
    title: "Product updates",
    desc: "Stay updated with new features, providers, and special health campaigns.",
  },
];

export function StepPreferences({ formData, onChange, onNext, onBack }: StepPreferencesProps) {
  return (
    <StepShell
      title="Your Preferences"
      description="Decide what updates and insights you'd like from HelixHealth."
      onNext={onNext}
      onBack={onBack}
      canContinue={true}
      nextLabel="Submit registration"
    >
      <div className="space-y-3">
        {PREFS.map(({ key, icon: Icon, title, desc }) => {
          const isActive = !!formData[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ [key]: !isActive })}
              className={cn(
                "w-full flex items-start gap-4 rounded-[var(--radius-card)] border p-4 text-left transition-all duration-200",
                isActive
                  ? "border-primary bg-primary-soft/5 shadow-[0_2px_8px_rgba(37,99,235,0.06)]"
                  : "border-border-soft bg-surface hover:border-primary/30 hover:bg-primary-soft/3"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
                  isActive
                    ? "bg-primary text-white"
                    : "bg-primary-soft text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-navy">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{desc}</p>
              </div>
              {/* Toggle indicator */}
              <div
                className={cn(
                  "mt-1 h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
                  isActive ? "bg-primary" : "bg-border-soft"
                )}
              >
                <div
                  className={cn(
                    "h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 border border-border-soft/50",
                    isActive ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </div>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}
