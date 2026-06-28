import * as React from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthProps {
  password?: string;
}

export function PasswordStrength({ password = "" }: PasswordStrengthProps) {
  if (!password) return null;

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = [
    "bg-error", // 0
    "bg-error", // 1
    "bg-warning", // 2
    "bg-primary", // 3
    "bg-success", // 4
  ];

  const label = labels[score];
  const colorClass = colors[score];

  return (
    <div className="space-y-1.5 mt-1.5">
      <div className="flex gap-1 h-1 w-full rounded-full bg-border-soft overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-full flex-1 transition-all duration-300",
              i < score ? colorClass : "bg-transparent"
            )}
          />
        ))}
      </div>
      <p className="text-[10px] font-semibold tracking-wide uppercase text-ink-soft">
        Strength: <span className={cn("font-bold", score < 2 ? "text-error" : score < 4 ? "text-warning" : "text-success")}>{label}</span>
      </p>
    </div>
  );
}
