"use client";

import * as React from "react";
import { type Branch } from "@/lib/clinics";
import { cn } from "@/lib/utils";

export function BranchSelector({
  branches,
  selectedBranchId,
  onChange,
}: {
  branches: Branch[];
  selectedBranchId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl bg-surface p-1.5 border border-border-soft/60">
      {branches.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onChange(b.id)}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
            b.id === selectedBranchId
              ? "bg-white text-navy shadow-sm"
              : "text-ink-soft hover:bg-white/40"
          )}
        >
          {b.name}
        </button>
      ))}
    </div>
  );
}
