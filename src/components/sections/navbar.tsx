"use client";

import { Globe, Menu, X, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { NAV_LINKS } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "@/components/sections/search/global-search";

/**
 * Sticky top navigation. Transparent over the hero, then settles into a
 * frosted-glass bar once the user scrolls. Collapses to a slide-down panel
 * on mobile.
 */
export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile panel is open.
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Bind Cmd+K and Ctrl+K globally
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
        scrolled
          ? "glass-strong shadow-[0_4px_20px_rgba(15,23,42,0.06)]"
          : "bg-transparent"
      )}
    >
      <Container className="flex h-18 items-center justify-between gap-6 py-3">
        <Link href="/" aria-label="HelixHealth home" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const active =
              link.href.startsWith("/") &&
              (link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative text-sm font-medium transition-colors hover:text-primary after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
                  active
                    ? "text-primary after:w-full"
                    : "text-ink-soft after:w-0"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border-soft bg-surface/50 px-3 py-1.5 text-xs text-ink-soft transition-all hover:bg-surface hover:text-navy"
          >
            <Search className="h-3.5 w-3.5 text-ink-muted" />
            <span>Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold text-ink-muted bg-white border border-border-soft rounded-md">
              ⌘K
            </kbd>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-primary"
          >
            <Globe className="h-4 w-4" />
            EN
          </button>
          <Button variant="outline" size="pill" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button variant="primary" size="pill" asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>

        {/* Mobile search & toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-navy transition-colors hover:bg-primary-bg"
          >
            <Search className="h-5.5 w-5.5" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-navy transition-colors hover:bg-primary-bg"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile panel */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <Container className="glass-strong flex flex-col gap-1 border-t border-border-soft py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-base font-medium text-ink-soft transition-colors hover:bg-primary-bg hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link href="/login" onClick={() => setOpen(false)}>
                Log in
              </Link>
            </Button>
            <Button variant="primary" size="lg" className="w-full" asChild>
              <Link href="/signup" onClick={() => setOpen(false)}>
                Sign up
              </Link>
            </Button>
          </div>
        </Container>
      </div>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
