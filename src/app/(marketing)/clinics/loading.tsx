import * as React from "react";
import { Container } from "@/components/ui/container";

export default function ClinicsLoading() {
  return (
    <section className="bg-gradient-to-b from-primary-bg via-soft-bg to-white pb-20 pt-10 lg:pt-14">
      <Container>
        <div className="h-16 w-full animate-pulse rounded-[var(--radius-xl2)] bg-surface shadow-soft border border-border-soft/60" />

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="h-[500px] rounded-[var(--radius-card)] border border-border-soft bg-surface p-6 shadow-soft animate-pulse" />
          </aside>

          <main className="space-y-4 flex-1">
            <div className="h-6 w-32 bg-surface rounded animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-44 w-full rounded-[var(--radius-card)] border border-dashed border-border-soft bg-surface/50 animate-pulse"
              />
            ))}
          </main>
        </div>
      </Container>
    </section>
  );
}
