import * as React from "react";
import { Globe } from "lucide-react";
import { LinkedinGlyph } from "@/components/brand/social-glyphs";
import { Input } from "@/components/ui/input";
import { Field } from "./field";
import { StepShell } from "./step-shell";
import { OnboardingData } from "@/lib/onboarding-data";

interface StepLinksProps {
  formData: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepLinks({ formData, onChange, onNext, onBack }: StepLinksProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateUrl = (name: string, value: string) => {
    if (!value.trim()) return ""; // optional
    try {
      new URL(value);
      return "";
    } catch {
      return "Please enter a valid URL (e.g. https://...)";
    }
  };

  const handleBlur = (name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateUrl(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: string) => {
    onChange({ [name]: value });
    if (touched[name]) {
      const error = validateUrl(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const hasErrors = Object.values(errors).some((e) => !!e);

  return (
    <StepShell
      title="Professional Links"
      description="Optionally share your online profiles so patients can learn more about you."
      onNext={onNext}
      onBack={onBack}
      canContinue={!hasErrors}
      isOptional
      onSkip={onNext}
    >
      <div className="space-y-4">
        <Field label="LinkedIn profile" htmlFor="linkedin" error={touched.linkedin ? errors.linkedin : undefined}>
          <Input
            id="linkedin"
            name="linkedin"
            icon={LinkedinGlyph}
            aria-label="LinkedIn profile URL"
            value={formData.linkedin || ""}
            onChange={(e) => handleChange("linkedin", e.target.value)}
            onBlur={(e) => handleBlur("linkedin", e.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </Field>

        <Field label="Personal website" htmlFor="website" error={touched.website ? errors.website : undefined}>
          <Input
            id="website"
            name="website"
            icon={Globe}
            aria-label="Personal website URL"
            value={formData.website || ""}
            onChange={(e) => handleChange("website", e.target.value)}
            onBlur={(e) => handleBlur("website", e.target.value)}
            placeholder="https://drsmith.com"
          />
        </Field>
      </div>
    </StepShell>
  );
}
