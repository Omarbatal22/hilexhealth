import * as React from "react";
import { cn } from "@/lib/utils";

export function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2.5 text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function FilterRadio({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...{ "aria-pressed": checked }}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors w-full",
        checked
          ? "bg-primary-bg font-semibold text-primary"
          : "text-ink-soft hover:bg-surface"
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
          checked ? "border-primary" : "border-border-soft"
        )}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      {label}
    </button>
  );
}

export function FilterToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-surface"
    >
      {label}
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-border-soft"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  );
}
