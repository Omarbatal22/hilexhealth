import * as React from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepShellProps {
  title: string;
  description?: string;
  onNext: () => void;
  onBack?: () => void;
  canContinue?: boolean;
  nextLabel?: string;
  isOptional?: boolean;
  onSkip?: () => void;
  children: React.ReactNode;
}

export function StepShell({
  title,
  description,
  onNext,
  onBack,
  canContinue = true,
  nextLabel = "Continue",
  isOptional = false,
  onSkip,
  children,
}: StepShellProps) {
  return (
    <div className="space-y-6 flex flex-col justify-between h-full min-h-[420px]">
      <div className="space-y-5">
        {/* Step Header */}
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold tracking-tight text-navy">
            {title}
          </h2>
          {description && <p className="text-sm text-ink-soft leading-relaxed">{description}</p>}
        </div>

        {/* Step Content */}
        <div className="space-y-4">{children}</div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-6 border-t border-border-soft flex flex-col sm:flex-row items-center gap-3 bg-soft-bg mt-8">
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full sm:w-auto order-2 sm:order-1 justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        )}
        
        <div className="flex w-full sm:w-auto sm:ml-auto items-center gap-3 order-1 sm:order-2">
          {isOptional && onSkip && (
            <Button
              type="button"
              variant="outline"
              onClick={onSkip}
              className="flex-1 sm:flex-initial justify-center"
            >
              Skip for now
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            disabled={!canContinue}
            onClick={onNext}
            className={cn(
              "flex-1 sm:flex-initial justify-center gap-2 font-medium min-w-[120px]"
            )}
          >
            {nextLabel}
            {nextLabel.toLowerCase().includes("submit") ? (
              <Check className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
