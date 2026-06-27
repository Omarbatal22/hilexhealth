import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { type Insurance } from "@/lib/clinics";

export function InsuranceBadge({ insurance }: { insurance: Insurance }) {
  return (
    <Badge tone="neutral" className="bg-[#f8fafc] text-slate-600 border border-slate-200/50">
      {insurance.label}
    </Badge>
  );
}
