import * as React from "react";
import { FileText, ShieldCheck, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field } from "./field";
import { StepShell } from "./step-shell";
import { OnboardingData } from "@/lib/onboarding-data";
import { cn } from "@/lib/utils";

interface StepVerificationProps {
  formData: OnboardingData;
  onChange: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function FileDropzone({
  label,
  fileName,
  onFileSelect,
  onClear,
}: {
  label: string;
  fileName?: string;
  onFileSelect: (name: string) => void;
  onClear: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className={cn(
        "group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200",
        fileName
          ? "border-primary/30 bg-primary-soft/5"
          : "border-border-soft bg-surface hover:border-primary/40 hover:bg-primary-soft/3"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        title={label}
        aria-label={label}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file.name);
        }}
      />

      {fileName ? (
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-navy truncate max-w-[200px]">{fileName}</span>
          <button
            type="button"
            title="Remove file"
            aria-label="Remove file"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-ink-muted hover:bg-error/10 hover:text-error transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <>
          <Upload className="h-8 w-8 text-ink-muted transition-colors group-hover:text-primary" />
          <p className="mt-2 text-sm font-medium text-ink-soft">
            {label}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            PDF, JPG, or PNG (max 5 MB)
          </p>
        </>
      )}
    </div>
  );
}

export function StepVerification({ formData, onChange, onNext, onBack }: StepVerificationProps) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string) => {
    if (name === "licenseNumber" && !value.trim()) return "License number is required";
    return "";
  };

  const isFormValid = React.useMemo(() => {
    if (!formData.licenseNumber?.trim()) return false;
    return !Object.values(errors).some((e) => !!e);
  }, [formData, errors]);

  const handleSubmit = () => {
    const err = validateField("licenseNumber", formData.licenseNumber || "");
    if (err) {
      setErrors({ licenseNumber: err });
      setTouched({ licenseNumber: true });
      return;
    }
    onNext();
  };

  return (
    <StepShell
      title="Verification Documents"
      description="Upload your credentials so our team can verify your medical license."
      onNext={handleSubmit}
      onBack={onBack}
      canContinue={isFormValid}
    >
      <div className="space-y-5">
        <Field
          label="Medical License Number"
          htmlFor="licenseNumber"
          error={touched.licenseNumber ? errors.licenseNumber : undefined}
        >
          <Input
            id="licenseNumber"
            name="licenseNumber"
            icon={ShieldCheck}
            value={formData.licenseNumber || ""}
            onChange={(e) => {
              onChange({ licenseNumber: e.target.value });
              if (touched.licenseNumber) {
                const err = validateField("licenseNumber", e.target.value);
                setErrors((prev) => ({ ...prev, licenseNumber: err }));
              }
            }}
            onBlur={(e) => {
              setTouched((prev) => ({ ...prev, licenseNumber: true }));
              const err = validateField("licenseNumber", e.target.value);
              setErrors((prev) => ({ ...prev, licenseNumber: err }));
            }}
            placeholder="e.g. MD-12345678"
          />
        </Field>

        <Field label="Syndicate Number (optional)" htmlFor="syndicateNumber">
          <Input
            id="syndicateNumber"
            name="syndicateNumber"
            value={formData.syndicateNumber || ""}
            onChange={(e) => onChange({ syndicateNumber: e.target.value })}
            placeholder="e.g. SYN-9876543"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-navy">Medical License</p>
            <FileDropzone
              label="Upload medical license"
              fileName={formData.licenseFile}
              onFileSelect={(name) => onChange({ licenseFile: name })}
              onClear={() => onChange({ licenseFile: undefined })}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-navy">National ID</p>
            <FileDropzone
              label="Upload national ID"
              fileName={formData.idFile}
              onFileSelect={(name) => onChange({ idFile: name })}
              onClear={() => onChange({ idFile: undefined })}
            />
          </div>
        </div>
      </div>
    </StepShell>
  );
}
