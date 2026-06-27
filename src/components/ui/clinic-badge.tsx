import * as React from "react";
import {
  Stethoscope,
  HeartPulse,
  Building2,
  ClipboardCheck,
  FlaskConical,
  ScanLine,
  Smile,
  Eye,
  Accessibility,
} from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { type FacilityType } from "@/lib/clinics";

interface ClinicBadgeProps extends Omit<BadgeProps, "children"> {
  type: FacilityType;
}

const CONFIG: Record<
  FacilityType,
  {
    label: string;
    tone: "primary" | "navy" | "success" | "warning" | "error" | "ai" | "neutral" | "teal";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  clinic: { label: "Clinic", tone: "neutral", icon: Stethoscope },
  medical_center: { label: "Medical Center", tone: "primary", icon: HeartPulse },
  hospital: { label: "Hospital", tone: "navy", icon: Building2 },
  diagnostic_center: { label: "Diagnostic Center", tone: "ai", icon: ClipboardCheck },
  laboratory: { label: "Laboratory", tone: "teal", icon: FlaskConical },
  radiology_center: { label: "Radiology Center", tone: "warning", icon: ScanLine },
  dental_center: { label: "Dental Center", tone: "teal", icon: Smile },
  eye_center: { label: "Eye Clinic", tone: "primary", icon: Eye },
  physiotherapy_clinic: { label: "Physiotherapy", tone: "success", icon: Accessibility },
};

export function ClinicBadge({ type, className, ...props }: ClinicBadgeProps) {
  const config = CONFIG[type] || { label: type, tone: "neutral", icon: Stethoscope };
  const Icon = config.icon;

  return (
    <Badge tone={config.tone} className={className} {...props}>
      <Icon className="h-3 w-3 shrink-0" />
      {config.label}
    </Badge>
  );
}
