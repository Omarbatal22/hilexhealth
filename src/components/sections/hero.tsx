"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Calendar,
  ChevronDown,
  MapPin,
  Search,
  ShieldPlus,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { HeroDecorations } from "@/components/decor/hero-decorations";
import { EASE } from "@/lib/motion";
import { TRUST_ITEMS } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const FILTERS = [
  { icon: Stethoscope, label: "Specialty" },
  { icon: MapPin, label: "Location" },
  { icon: Calendar, label: "Availability" },
] as const;

/**
 * Hero band — the first screen. Left column carries the message + search;
 * right column the layered medical illustration with floating AI cards.
 * The four-item trust strip sits beneath, closing the band (the dark
 * feature bar that follows lives in its own section).
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-bg via-soft-bg to-white pb-12 pt-10 lg:pb-20 lg:pt-16">
      <HeroDecorations />

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* ---------- Left: message + search ---------- */}
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft/70 px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <Eyebrow>AI-Powered Healthcare</Eyebrow>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
              className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-navy sm:text-6xl lg:text-7xl"
            >
              Healthcare,
              <br />
              <span className="brand-text-gradient">Reimagined</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.16 }}
              className="mt-5 text-lg leading-8 text-ink-soft"
            >
              AI-powered care that understands you.
              <br className="hidden sm:block" />
              Find the right doctor. Get answers. Feel better.
            </motion.p>

            {/* Search card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.24 }}
              className="glass-strong mt-8 rounded-[var(--radius-xl2)] p-3 shadow-[var(--shadow-large)]"
            >
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => e.preventDefault()}
                role="search"
              >
                <div className="flex flex-1 items-center gap-3 rounded-2xl px-4">
                  <Search className="h-5 w-5 shrink-0 text-ink-muted" />
                  <input
                    type="text"
                    placeholder="Search doctors, specialties, conditions..."
                    aria-label="Search doctors, specialties, conditions"
                    className="h-12 w-full bg-transparent text-[15px] text-navy placeholder:text-ink-muted focus:outline-none"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="icon"
                  aria-label="Search"
                  className="h-12 w-12"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </form>

              {/* Filter chips */}
              <div className="mt-2 flex flex-wrap gap-2 px-1 pb-1">
                {FILTERS.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-white px-4 py-2 text-sm font-medium text-ink-soft transition-all hover:border-primary/50 hover:bg-primary-bg hover:text-primary"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ---------- Right: illustration ---------- */}
          <HeroIllustration />
        </div>

        {/* ---------- Trust strip ---------- */}
        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
          className="mt-14 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4 lg:mt-16"
        >
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft/70 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-navy">
                  {title}
                </span>
                <span className="block text-xs text-ink-muted">{desc}</span>
              </span>
            </li>
          ))}
        </motion.ul>
      </Container>
    </section>
  );
}

/**
 * Layered medical illustration. Asset-free: stacked organic blue blobs
 * (the reference's signature look) frame a portrait slot, with floating
 * AI badges. Drop a real portrait into /public and swap the slot for
 * next/image when available.
 */
function HeroIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
      className="relative mx-auto aspect-square w-full max-w-[520px]"
    >
      {/* Stacked organic blobs */}
      <div className="absolute inset-0 animate-blob-morph bg-gradient-to-br from-primary-light/35 to-primary/25 blur-sm" />
      <div className="absolute inset-6 animate-blob-morph rounded-full bg-gradient-to-br from-cyan/30 to-primary-soft/60 [animation-delay:-4s]" />
      <div className="absolute inset-12 animate-[blob-morph_16s_ease-in-out_infinite] rounded-full bg-gradient-to-tr from-primary/40 to-primary-light/30 [animation-delay:-2s]" />

      {/* Portrait slot */}
      <div className="absolute inset-10 overflow-hidden rounded-[44%_56%_60%_40%/50%_44%_56%_50%] bg-gradient-to-b from-white/70 to-primary-soft/40 shadow-[var(--shadow-floating)] backdrop-blur-sm">
        <div className="flex h-full w-full items-center justify-center">
          <ShieldPlus className="h-28 w-28 text-primary/25" strokeWidth={1.2} />
        </div>
      </div>

      {/* Floating: activity pulse badge (top-left) */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="glass-strong absolute left-2 top-12 flex h-12 w-12 items-center justify-center rounded-2xl text-primary shadow-[var(--shadow-medium)]"
      >
        <Activity className="h-5 w-5" />
      </motion.div>

      {/* Floating: shield badge (mid-left) */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        className="absolute bottom-24 left-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[var(--shadow-medium)]"
      >
        <ShieldPlus className="h-5 w-5" />
      </motion.div>

      {/* Floating: AI Symptom Check card (bottom-right) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
        className={cn(
          "glass-strong ai-glow absolute -bottom-4 -right-2 w-60 rounded-[var(--radius-card)] p-4 sm:-right-6"
        )}
      >
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ai to-ai-light text-white">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy">AI Symptom Check</p>
            <p className="mt-0.5 text-xs leading-5 text-ink-soft">
              Describe your symptoms and get AI insights
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Start AI symptom check"
          className="mt-3 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-ai text-white transition-transform hover:translate-x-0.5"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}
