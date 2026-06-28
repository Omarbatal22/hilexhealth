import { ArrowRight, Lock, ShieldCheck, ShieldPlus } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { FOOTER_COLUMNS } from "@/lib/site-data";

/* Brand glyphs — lucide dropped its brand set, so these ship inline. */
type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

const FacebookGlyph: Glyph = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
  </svg>
);

const TwitterGlyph: Glyph = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M18.9 2h3.3l-7.2 8.23L23.7 22h-6.6l-5.18-6.77L5.99 22H2.68l7.7-8.8L2.3 2h6.77l4.68 6.19L18.9 2Zm-1.16 18h1.83L8.34 3.9H6.38L17.74 20Z" />
  </svg>
);

const InstagramGlyph: Glyph = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.62c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.24-2.18.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.18-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.24 1.77.4 2.18.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.18.4 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.24 2.18-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.18.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.24-1.77-.4-2.18a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.18-.4-1.24-.06-1.61-.07-4.76-.07Zm0 2.76a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6Zm0 1.62a3.68 3.68 0 1 0 0 7.36 3.68 3.68 0 0 0 0-7.36Zm5.48-2.9a1.24 1.24 0 1 1 0 2.48 1.24 1.24 0 0 1 0-2.48Z" />
  </svg>
);

const LinkedinGlyph: Glyph = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0Z" />
  </svg>
);

const SOCIALS: { icon: Glyph; label: string }[] = [
  { icon: FacebookGlyph, label: "Facebook" },
  { icon: TwitterGlyph, label: "Twitter" },
  { icon: InstagramGlyph, label: "Instagram" },
  { icon: LinkedinGlyph, label: "LinkedIn" },
];

/** Small App Store / Google Play style badge. */
function StoreBadge({ store, sub }: { store: string; sub: string }) {
  return (
    <button
      type="button"
      className="inline-flex w-full items-center gap-3 rounded-xl bg-navy px-4 py-2.5 text-left text-white transition-colors hover:bg-navy-light sm:w-auto"
    >
      <span className="text-2xl leading-none">{store === "apple" ? "" : "▶"}</span>
      <span className="leading-tight">
        <span className="block text-[10px] uppercase tracking-wide text-white/60">
          {sub}
        </span>
        <span className="block text-sm font-semibold">
          {store === "apple" ? "App Store" : "Google Play"}
        </span>
      </span>
    </button>
  );
}

/**
 * Footer — a soft-blue panel carrying the closing CTA, link columns, and app
 * badges, capped by a dark bottom bar with compliance marks and socials.
 */
export function Footer() {
  return (
    <footer className="mt-auto">
      <Container size="content" className="pb-10">
        <div className="rounded-[var(--radius-xl3)] bg-gradient-to-b from-primary-bg to-primary-soft/50 p-8 sm:p-10 lg:p-12">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
            {/* CTA block */}
            <div className="flex items-start gap-5">
              <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white shadow-[var(--shadow-medium)] sm:inline-flex">
                <ShieldPlus className="h-8 w-8" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-navy">
                  Your Health, Our Priority
                </h2>
                <p className="mt-2 max-w-xs text-[15px] leading-7 text-ink-soft">
                  Join millions who trust us for their healthcare needs.
                </p>
                <Button variant="primary" size="lg" className="mt-5">
                  Get Started Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Link columns + app badges */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {FOOTER_COLUMNS.map((col) => (
                <div key={col.title}>
                  <h3 className="text-sm font-bold text-navy">{col.title}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="text-sm text-ink-soft transition-colors hover:text-primary"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                    {col.title === "Company" && (
                      <li>
                        <Link
                          href="/provider/dashboard"
                          className="text-sm text-ink-soft transition-colors hover:text-primary"
                        >
                          For providers
                        </Link>
                      </li>
                    )}
                  </ul>
                  {col.title === "Top Specialties" && (
                    <a
                      href="#"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                    >
                      View all specialties
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}

              <div>
                <h3 className="text-sm font-bold text-navy">Download Our App</h3>
                <p className="mt-4 text-sm leading-6 text-ink-soft">
                  Get the best experience on mobile.
                </p>
                <div className="mt-4 flex flex-col gap-2.5">
                  <StoreBadge store="apple" sub="Download on the" />
                  <StoreBadge store="google" sub="Get it on" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Dark bottom bar */}
      <div className="bg-navy">
        <Container size="content" className="flex flex-col items-center gap-6 py-6 text-sm text-white/70 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-6">
            <Logo invert />
            <span className="text-white/55">
              © 2026 HelixHealth. All rights reserved.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-success" />
              HIPAA Compliant
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-primary-light" />
              Secure &amp; Encrypted
            </span>
            <ul className="flex items-center gap-2">
              {SOCIALS.map(({ icon: Icon, label }) => (
                <li key={label}>
                  <a
                    href="#"
                    aria-label={label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-primary hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </div>
    </footer>
  );
}
