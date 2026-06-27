"use client";

import * as React from "react";
import { type Branch } from "@/lib/clinics";
import { getDoctor } from "@/lib/doctors";
import { BranchSelector } from "@/components/sections/clinics/branch-selector";
import { DoctorAvailabilityCard } from "@/components/sections/clinics/doctor-availability-card";

export function ClinicDoctorsSection({ branches }: { branches: Branch[] }) {
  const [selectedBranchId, setSelectedBranchId] = React.useState(branches[0]?.id || "");

  const activeBranch = branches.find((b) => b.id === selectedBranchId);
  const branchDoctors = React.useMemo(() => {
    if (!activeBranch) return [];
    return activeBranch.doctorIds.map((slug) => getDoctor(slug)).filter(Boolean);
  }, [activeBranch]);

  if (branches.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display font-bold text-navy text-lg">Doctors Practicing Here</h3>
        <BranchSelector
          branches={branches}
          selectedBranchId={selectedBranchId}
          onChange={setSelectedBranchId}
        />
      </div>

      <div className="space-y-4">
        {branchDoctors.length > 0 ? (
          branchDoctors.map((doc) => (
            <DoctorAvailabilityCard
              key={doc!.slug}
              doctor={doc!}
              branch={activeBranch!}
            />
          ))
        ) : (
          <div className="text-center py-8 border border-dashed border-border-soft rounded-2xl bg-surface">
            <p className="text-sm text-ink-muted">No doctors currently scheduled at this branch.</p>
          </div>
        )}
      </div>
    </div>
  );
}
