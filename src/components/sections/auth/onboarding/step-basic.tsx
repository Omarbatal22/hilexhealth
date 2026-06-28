import * as React from "react";
import { Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field } from "./field";
import { StepShell } from "./step-shell";
import { PasswordStrength } from "./password-strength";
import { SocialAuth } from "./social-auth";
import { OnboardingData } from "@/lib/onboarding-data";

interface StepBasicProps {
  formData: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepBasic({ formData, onChange, onNext, onBack }: StepBasicProps) {
  const [showPw, setShowPw] = React.useState(false);
  const [showConfirmPw, setShowConfirmPw] = React.useState(false);

  // Validation errors state
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "fullName") {
      if (!value.trim()) {
        error = "Full name is required";
      } else if (value.trim().length < 3) {
        error = "Name must be at least 3 characters";
      }
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        error = "Email address is required";
      } else if (!emailRegex.test(value)) {
        error = "Please enter a valid email address";
      }
    } else if (name === "phone") {
      if (!value.trim()) {
        error = "Phone number is required";
      }
    } else if (name === "password") {
      if (!value) {
        error = "Password is required";
      } else if (value.length < 8) {
        error = "Password must be at least 8 characters";
      }
    } else if (name === "confirmPassword") {
      if (!value) {
        error = "Please confirm your password";
      } else if (value !== formData.password) {
        error = "Passwords do not match";
      }
    }
    return error;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Check if step is valid
  const isFormValid = React.useMemo(() => {
    const required = ["fullName", "email", "phone", "password", "confirmPassword"];
    const hasEmpty = required.some((field) => !formData[field as keyof OnboardingData]);
    if (hasEmpty) return false;

    // Check if any error exists
    const hasErrors = Object.values(errors).some((err) => !!err);
    return !hasErrors;
  }, [formData, errors]);

  const handleSubmit = () => {
    // Run final validation on all fields
    const newErrors: Record<string, string> = {};
    const fields = ["fullName", "email", "phone", "password", "confirmPassword"];
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
      title="Basic Account Info"
      description="Provide your account details to start your journey."
      onNext={handleSubmit}
      onBack={onBack}
      canContinue={isFormValid}
    >
      {/* Social options */}
      <SocialAuth />

      <div className="my-5 flex items-center gap-4">
        <span className="h-px flex-1 bg-border-soft" />
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Or sign up with email
        </span>
        <span className="h-px flex-1 bg-border-soft" />
      </div>

      <div className="space-y-4">
        <Field label="Full name" htmlFor="fullName" error={touched.fullName ? errors.fullName : undefined}>
          <Input
            id="fullName"
            name="fullName"
            icon={User}
            value={formData.fullName || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Alex Morgan"
            autoComplete="name"
          />
        </Field>

        <Field label="Email" htmlFor="email" error={touched.email ? errors.email : undefined}>
          <Input
            id="email"
            name="email"
            type="email"
            icon={Mail}
            value={formData.email || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Field>

        <Field label="Phone number" htmlFor="phone" error={touched.phone ? errors.phone : undefined}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            icon={Phone}
            value={formData.phone || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. +20 100 123 4567"
            autoComplete="tel"
          />
        </Field>

        <Field label="Password" htmlFor="password" error={touched.password ? errors.password : undefined}>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              icon={Lock}
              value={formData.password || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Create a password"
              autoComplete="new-password"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-primary"
            >
              {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <PasswordStrength password={formData.password} />
        </Field>

        <Field
          label="Confirm password"
          htmlFor="confirmPassword"
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
        >
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPw ? "text" : "password"}
              icon={Lock}
              value={formData.confirmPassword || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Confirm your password"
              autoComplete="new-password"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPw((v) => !v)}
              aria-label={showConfirmPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-primary"
            >
              {showConfirmPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </Field>
      </div>
    </StepShell>
  );
}
