import * as React from "react";
import { Video } from "lucide-react";
import { StepShell } from "./step-shell";
import { OnboardingData } from "@/lib/onboarding-data";
import { cn } from "@/lib/utils";

interface StepAvailabilityProps {
  formData: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepAvailability({ formData, onChange, onNext, onBack }: StepAvailabilityProps) {
  const isOn = !!formData.onlineConsults;

  return (
    <StepShell
      title="Availability"
      description="Configure how patients can reach you on HelixHealth."
      onNext={onNext}
      onBack={onBack}
      canContinue={true}
      nextLabel="Submit registration"
    >
      <div className="space-y-6">
        {/* Online consultations toggle */}
        <button
          type="button"
          onClick={() => onChange({ onlineConsults: !isOn })}
          className={cn(
            "w-full flex items-start gap-4 rounded-[var(--radius-card)] border p-5 text-left transition-all duration-200",
            isOn
              ? "border-primary bg-primary-soft/5 shadow-[0_2px_8px_rgba(37,99,235,0.06)]"
              : "border-border-soft bg-surface hover:border-primary/30"
          )}
        >
          <span
            className={cn(
              "mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
              isOn ? "bg-primary text-white" : "bg-primary-soft text-primary"
            )}
          >
            <Video className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold text-navy">Available for Online Consultations</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">
              Allow patients to book video consultations with you through HelixHealth. You can change this at any time from your provider dashboard settings.
            </p>
          </div>
          {/* Toggle */}
          <div
            className={cn(
              "mt-1.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
              isOn ? "bg-primary" : "bg-border-soft"
            )}
          >
            <div
              className={cn(
                "h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 border border-border-soft/50",
                isOn ? "translate-x-5" : "translate-x-0"
              )}
            />
          </div>
        </button>

        <div className="rounded-xl bg-primary-soft/5 border border-primary/10 p-4">
          <p className="text-xs leading-relaxed text-ink-soft">
            <span className="font-semibold text-navy">What happens next?</span> After submitting, our team will review your medical license and credentials. This typically takes 1–3 business days. You&apos;ll receive an email when your account is verified.
          </p>
        </div>
      </div>
    </StepShell>
  );
}
