import * as React from "react";
import { cn } from "@/lib/utils";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export function StepProgress({ currentStep, totalSteps, stepLabels }: StepProgressProps) {
  return (
    <div className="w-full space-y-3">
      {/* Top indicator text */}
      <div className="flex items-center justify-between text-xs font-semibold text-ink-muted">
        <span className="uppercase tracking-wider text-primary">
          {stepLabels[currentStep - 1] || "Setup"}
        </span>
        <span className="font-mono text-navy">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Segmented bar */}
      <div className="flex gap-1.5 h-1.5 w-full">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepIndex = i + 1;
          const isCompleted = stepIndex < currentStep;
          const isActive = stepIndex === currentStep;

          return (
            <div
              key={i}
              className={cn(
                "h-full flex-1 rounded-full transition-all duration-300",
                isCompleted && "bg-primary",
                isActive && "bg-primary/90 shadow-[0_0_8px_rgba(37,99,235,0.4)]",
                !isCompleted && !isActive && "bg-border-soft"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
