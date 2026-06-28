import * as React from "react";
import { Building2, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field } from "./field";
import { StepShell } from "./step-shell";
import { EXPERIENCE_RANGES, OnboardingData } from "@/lib/onboarding-data";
import { SPECIALTIES } from "@/lib/doctors";
import { GOVERNORATES } from "@/lib/site-data";

interface StepProfessionalProps {
  formData: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepProfessional({ formData, onChange, onNext, onBack }: StepProfessionalProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string) => {
    if (name === "specialty" && !value) return "Specialty is required";
    if (name === "experience" && !value) return "Experience range is required";
    return "";
  };

  const handleBlur = (name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (name: string, value: string) => {
    onChange({ [name]: value });
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const isFormValid = React.useMemo(() => {
    if (!formData.specialty || !formData.experience) return false;
    return !Object.values(errors).some((e) => !!e);
  }, [formData, errors]);

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    ["specialty", "experience"].forEach((f) => {
      const val = (formData[f as keyof OnboardingData] as string) || "";
      const err = validateField(f, val);
      if (err) newErrors[f] = err;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ specialty: true, experience: true });
      return;
    }
    onNext();
  };

  return (
    <StepShell
      title="Professional Details"
      description="Share your medical credentials to set up your provider profile."
      onNext={handleSubmit}
      onBack={onBack}
      canContinue={isFormValid}
    >
      <div className="space-y-4">
        <Field label="Specialty" htmlFor="specialty" error={touched.specialty ? errors.specialty : undefined}>
          <select
            id="specialty"
            title="Specialty"
            aria-label="Specialty"
            value={formData.specialty || ""}
            onChange={(e) => {
              handleChange("specialty", e.target.value);
              handleBlur("specialty", e.target.value);
            }}
            className="w-full rounded-xl border border-border-soft bg-surface px-3 py-3 text-sm text-ink-soft focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
          >
            <option value="" disabled>Select your specialty</option>
            {SPECIALTIES.map((s) => (
              <option key={s.slug} value={s.slug}>{s.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Subspecialty (optional)" htmlFor="subspecialty">
          <Input
            id="subspecialty"
            name="subspecialty"
            icon={Stethoscope}
            value={formData.subspecialty || ""}
            onChange={(e) => onChange({ subspecialty: e.target.value })}
            placeholder="e.g. Interventional Cardiology"
          />
        </Field>

        <Field label="Years of experience" htmlFor="experience" error={touched.experience ? errors.experience : undefined}>
          <select
            id="experience"
            title="Years of experience"
            aria-label="Years of experience"
            value={formData.experience || ""}
            onChange={(e) => {
              handleChange("experience", e.target.value);
              handleBlur("experience", e.target.value);
            }}
            className="w-full rounded-xl border border-border-soft bg-surface px-3 py-3 text-sm text-ink-soft focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
          >
            <option value="" disabled>Select experience range</option>
            {EXPERIENCE_RANGES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>

        <Field label="Clinic / Medical Center (optional)" htmlFor="clinic">
          <Input
            id="clinic"
            name="clinic"
            icon={Building2}
            value={formData.clinic || ""}
            onChange={(e) => onChange({ clinic: e.target.value })}
            placeholder="e.g. Helix Medical Center"
          />
        </Field>

        <Field label="Practice Governorate (optional)" htmlFor="docGovernorate">
          <select
            id="docGovernorate"
            title="Practice Governorate"
            aria-label="Practice Governorate"
            value={formData.governorate || ""}
            onChange={(e) => onChange({ governorate: e.target.value })}
            className="w-full rounded-xl border border-border-soft bg-surface px-3 py-3 text-sm text-ink-soft focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
          >
            <option value="">Select governorate</option>
            {GOVERNORATES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </Field>
      </div>
    </StepShell>
  );
}
