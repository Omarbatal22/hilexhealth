import * as React from "react";
import { Field } from "./field";
import { StepShell } from "./step-shell";
import { GENDERS, OnboardingData } from "@/lib/onboarding-data";
import { GOVERNORATES } from "@/lib/site-data";

interface StepPersonalProps {
  formData: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Dependent cities/areas mapping helper
const LOCATION_MAP: Record<string, { cities: string[]; areas: string[] }> = {
  Cairo: {
    cities: ["Cairo", "New Cairo"],
    areas: ["Nasr City", "Maadi", "Heliopolis", "Zamalek", "New Cairo"],
  },
  Giza: {
    cities: ["Giza", "6th of October"],
    areas: ["Dokki", "Mohandessin", "6th of October"],
  },
  Alexandria: {
    cities: ["Alexandria"],
    areas: ["Smouha", "Roushdy", "Sidi Gaber"],
  },
  Dakahlia: {
    cities: ["Mansoura"],
    areas: ["Mansoura Center", "Talkha"],
  },
  Sharqia: {
    cities: ["Zagazig", "10th of Ramadan"],
    areas: ["Zagazig Center", "10th of Ramadan City"],
  },
  Qalyubia: {
    cities: ["Banha", "Shubra El-Kheima"],
    areas: ["Banha Center", "Shubra Center"],
  },
  "Port Said": {
    cities: ["Port Said"],
    areas: ["El-Arab", "El-Sharq"],
  },
  Suez: {
    cities: ["Suez"],
    areas: ["El-Arbaeen", "Suez Center"],
  },
};

export function StepPersonal({ formData, onChange, onNext, onBack }: StepPersonalProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const activeGov = formData.governorate || "";
  const locationDetails = LOCATION_MAP[activeGov] || { cities: ["Select Governorate First"], areas: ["Select Governorate First"] };

  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "gender" && !value) {
      error = "Please select a gender preference";
    } else if (name === "dob" && !value) {
      error = "Date of birth is required";
    } else if (name === "governorate" && (!value || value === "all")) {
      error = "Governorate is required";
    } else if (name === "city" && (!value || value === "all" || value.includes("First"))) {
      error = "City is required";
    } else if (name === "area" && (!value || value === "all" || value.includes("First"))) {
      error = "Area is required";
    }
    return error;
  };

  const handleBlur = (name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSelectChange = (name: string, value: string) => {
    // If governorate changes, reset city and area
    if (name === "governorate") {
      const details = LOCATION_MAP[value] || { cities: [], areas: [] };
      onChange({
        governorate: value,
        city: details.cities[0] || "",
        area: details.areas[0] || "",
      });
    } else {
      onChange({ [name]: value });
    }

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const isFormValid = React.useMemo(() => {
    const required = ["gender", "dob", "governorate", "city", "area"];
    const hasEmpty = required.some((field) => !formData[field as keyof OnboardingData]);
    if (hasEmpty) return false;

    const hasErrors = Object.values(errors).some((err) => !!err);
    return !hasErrors;
  }, [formData, errors]);

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    const fields = ["gender", "dob", "governorate", "city", "area"];
    fields.forEach((field) => {
      const val = (formData[field as keyof OnboardingData] as string) || "";
      const err = validateField(field, val);
      if (err) newErrors[field] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(fields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
      return;
    }

    onNext();
  };

  return (
    <StepShell
      title="Personal Information"
      description="Tell us more about yourself to customize your profile."
      onNext={handleSubmit}
      onBack={onBack}
      canContinue={isFormValid}
    >
      <div className="space-y-4">
        {/* Gender Selection */}
        <Field label="Gender" htmlFor="gender" error={touched.gender ? errors.gender : undefined}>
          <div className="grid grid-cols-3 gap-2">
            {GENDERS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  handleSelectChange("gender", g);
                  handleBlur("gender", g);
                }}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl border transition-all duration-200 ${
                  formData.gender === g
                    ? "border-primary bg-primary-soft text-primary font-bold shadow-[0_2px_8px_rgba(37,99,235,0.08)]"
                    : "border-border-soft bg-surface text-ink-soft hover:border-primary/30"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </Field>

        {/* Date of Birth */}
        <Field label="Date of birth" htmlFor="dob" error={touched.dob ? errors.dob : undefined}>
          <input
            id="dob"
            name="dob"
            type="date"
            title="Date of Birth"
            aria-label="Date of Birth"
            placeholder="YYYY-MM-DD"
            max={new Date().toISOString().split("T")[0]}
            value={formData.dob || ""}
            onChange={(e) => handleSelectChange("dob", e.target.value)}
            onBlur={(e) => handleBlur("dob", e.target.value)}
            className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm text-ink-soft focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
          />
        </Field>

        {/* Location Selects */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Governorate"
            htmlFor="governorate"
            error={touched.governorate ? errors.governorate : undefined}
          >
            <select
              id="governorate"
              title="Governorate"
              aria-label="Governorate"
              value={formData.governorate || "all"}
              onChange={(e) => {
                handleSelectChange("governorate", e.target.value);
                handleBlur("governorate", e.target.value);
              }}
              onBlur={(e) => handleBlur("governorate", e.target.value)}
              className="w-full rounded-xl border border-border-soft bg-surface px-3 py-3 text-sm text-ink-soft focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
            >
              <option value="all" disabled>Select Gov...</option>
              {GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </Field>

          <Field label="City" htmlFor="city" error={touched.city ? errors.city : undefined}>
            <select
              id="city"
              title="City"
              aria-label="City"
              value={formData.city || "all"}
              disabled={!formData.governorate}
              onChange={(e) => {
                handleSelectChange("city", e.target.value);
                handleBlur("city", e.target.value);
              }}
              onBlur={(e) => handleBlur("city", e.target.value)}
              className="w-full rounded-xl border border-border-soft bg-surface px-3 py-3 text-sm text-ink-soft focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {!formData.governorate ? (
                <option value="all">Choose Gov first...</option>
              ) : (
                locationDetails.cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))
              )}
            </select>
          </Field>

          <Field label="Area" htmlFor="area" error={touched.area ? errors.area : undefined}>
            <select
              id="area"
              title="Area"
              aria-label="Area"
              value={formData.area || "all"}
              disabled={!formData.governorate}
              onChange={(e) => {
                handleSelectChange("area", e.target.value);
                handleBlur("area", e.target.value);
              }}
              onBlur={(e) => handleBlur("area", e.target.value)}
              className="w-full rounded-xl border border-border-soft bg-surface px-3 py-3 text-sm text-ink-soft focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {!formData.governorate ? (
                <option value="all">Choose Gov first...</option>
              ) : (
                locationDetails.areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))
              )}
            </select>
          </Field>
        </div>
      </div>
    </StepShell>
  );
}
