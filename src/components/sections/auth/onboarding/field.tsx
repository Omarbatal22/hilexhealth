import * as React from "react";

export function Field({
  label,
  htmlFor,
  aside,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  aside?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-navy">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error && (
        <p className="text-xs text-error font-medium animate-fade-in" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
