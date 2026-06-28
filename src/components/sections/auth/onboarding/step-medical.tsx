import * as React from "react";
import { Field } from "./field";
import { StepShell } from "./step-shell";
import { ChipInput } from "./chip-input";
import { BLOOD_TYPES, OnboardingData } from "@/lib/onboarding-data";

interface StepMedicalProps {
  formData: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepMedical({ formData, onChange, onNext, onBack }: StepMedicalProps) {
  return (
    <StepShell
      title="Medical History"
      description="This helps us personalize your health recommendations. All fields are optional."
      onNext={onNext}
      onBack={onBack}
      canContinue={true}
      isOptional
      onSkip={onNext}
    >
      <div className="space-y-5">
        {/* Blood Type */}
        <Field label="Blood type" htmlFor="bloodType">
          <select
            id="bloodType"
            title="Blood type"
            aria-label="Blood type"
            value={formData.bloodType || ""}
            onChange={(e) => onChange({ bloodType: e.target.value })}
            className="w-full rounded-xl border border-border-soft bg-surface px-3 py-3 text-sm text-ink-soft focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
          >
            <option value="">Select blood type (optional)</option>
            {BLOOD_TYPES.map((bt) => (
              <option key={bt} value={bt}>
                {bt}
              </option>
            ))}
          </select>
        </Field>

        {/* Chronic Conditions */}
        <Field label="Chronic conditions" htmlFor="chronic">
          <ChipInput
            placeholder="Type a condition and press Enter..."
            values={formData.chronic || []}
            onChange={(newValues) => onChange({ chronic: newValues })}
          />
        </Field>

        {/* Allergies */}
        <Field label="Allergies" htmlFor="allergies">
          <ChipInput
            placeholder="Type an allergy and press Enter..."
            values={formData.allergies || []}
            onChange={(newValues) => onChange({ allergies: newValues })}
          />
        </Field>
      </div>
    </StepShell>
  );
}
