"use client";

import { Bell, LogOut, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { PROVIDER_NAV, PROVIDER } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

/** Persistent provider sidebar (desktop) + slide-in drawer (mobile). */
export function ProviderSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const nav = (
    <nav className="flex-1 space-y-1" aria-label="Dashboard">
      {PROVIDER_NAV.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/provider/dashboard"
            ? pathname === "/provider/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-white shadow-[0_8px_20px_-8px_rgba(59,130,246,0.7)]"
                : "text-ink-soft hover:bg-primary-bg hover:text-primary"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarBody = (
    <div className="flex h-full flex-col gap-6 p-5">
      <Link href="/" aria-label="HelixHealth home" className="px-1">
        <Logo />
      </Link>
      {nav}
      {/* User card */}
      <div className="rounded-2xl border border-border-soft bg-surface/60 p-3">
        <div className="flex items-center gap-3">
          <Avatar name={PROVIDER.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-navy">
              {PROVIDER.name}
            </p>
            <p className="truncate text-xs text-ink-muted">{PROVIDER.specialty}</p>
          </div>
          <button
            type="button"
            aria-label="Log out"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-white hover:text-error"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border-soft bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/" aria-label="HelixHealth home">
          <Logo />
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-primary-bg"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-primary-bg"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-coral ring-2 ring-white" />
          </button>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-primary-bg"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border-soft bg-white lg:block">
        {sidebarBody}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-[var(--shadow-floating)]">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-primary-bg"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
}
