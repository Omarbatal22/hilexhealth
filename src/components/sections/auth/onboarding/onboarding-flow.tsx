"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RoleSelect } from "./role-select";
import { StepProgress } from "./step-progress";
import { StepBasic } from "./step-basic";
import { StepPersonal } from "./step-personal";
import { StepMedical } from "./step-medical";
import { StepPreferences } from "./step-preferences";
import { StepProfessional } from "./step-professional";
import { StepVerification } from "./step-verification";
import { StepLinks } from "./step-links";
import { StepAvailability } from "./step-availability";
import { SuccessOverlay } from "./success-overlay";
import { OnboardingData, ONBOARDING_STORAGE_KEY } from "@/lib/onboarding-data";

const PATIENT_LABELS = ["Account Type", "Credentials", "Personal Info", "Medical History", "Preferences"];
const DOCTOR_LABELS = ["Account Type", "Credentials", "Personal Info", "Professional", "Verification", "Links", "Availability"];

export function OnboardingFlow() {
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);
  const [role, setRole] = React.useState<"patient" | "doctor" | undefined>(undefined);
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState<OnboardingData>({});
  const [showSuccess, setShowSuccess] = React.useState(false);

  // Load from localStorage
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.role) setRole(parsed.role);
          if (parsed.step) setStep(parsed.step);
          if (parsed.formData) setFormData(parsed.formData);
        } catch (e) {
          console.error("Failed to parse onboarding autosave", e);
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage (debounced)
  React.useEffect(() => {
    if (!isMounted || showSuccess) return;
    const timer = setTimeout(() => {
      const dataToSave = { role, step, formData };
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(dataToSave));
    }, 300);
    return () => clearTimeout(timer);
  }, [role, step, formData, isMounted, showSuccess]);

  const handleRoleSelect = (selectedRole: "patient" | "doctor") => {
    setRole(selectedRole);
    setStep(2);
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  const updateFormData = (fields: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const goNext = () => setStep((s) => s + 1);
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = () => {
    setShowSuccess(true);
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setTimeout(() => {
      if (role === "patient") {
        router.push("/welcome");
      } else {
        router.push("/verification-pending");
      }
    }, 1500);
  };

  const stepLabels = role === "doctor" ? DOCTOR_LABELS : PATIENT_LABELS;
  const totalSteps = stepLabels.length;

  if (!isMounted) {
    return <div className="min-h-[400px] flex items-center justify-center text-ink-muted">Loading...</div>;
  }

  /** Render the active step component for the current role */
  const renderStep = () => {
    // Step 1 is always the role chooser
    if (step === 1) {
      return <RoleSelect onSelect={handleRoleSelect} selectedRole={role} />;
    }

    if (role === "patient") {
      switch (step) {
        case 2:
          return <StepBasic formData={formData} onChange={updateFormData} onNext={goNext} onBack={goBack} />;
        case 3:
          return <StepPersonal formData={formData} onChange={updateFormData} onNext={goNext} onBack={goBack} />;
        case 4:
          return <StepMedical formData={formData} onChange={updateFormData} onNext={goNext} onBack={goBack} />;
        case 5:
          return (
            <StepPreferences
              formData={formData}
              onChange={updateFormData}
              onNext={handleSubmit}
              onBack={goBack}
            />
          );
      }
    }

    if (role === "doctor") {
      switch (step) {
        case 2:
          return <StepBasic formData={formData} onChange={updateFormData} onNext={goNext} onBack={goBack} />;
        case 3:
          return <StepPersonal formData={formData} onChange={updateFormData} onNext={goNext} onBack={goBack} />;
        case 4:
          return <StepProfessional formData={formData} onChange={updateFormData} onNext={goNext} onBack={goBack} />;
        case 5:
          return <StepVerification formData={formData} onChange={updateFormData} onNext={goNext} onBack={goBack} />;
        case 6:
          return <StepLinks formData={formData} onChange={updateFormData} onNext={goNext} onBack={goBack} />;
        case 7:
          return (
            <StepAvailability
              formData={formData}
              onChange={updateFormData}
              onNext={handleSubmit}
              onBack={goBack}
            />
          );
      }
    }

    return null;
  };

  return (
    <div className="space-y-6 relative">
      {showSuccess && <SuccessOverlay />}
      {step > 1 && (
        <StepProgress currentStep={step} totalSteps={totalSteps} stepLabels={stepLabels} />
      )}
      {renderStep()}
    </div>
  );
}
