# Build Spec — Global Layout Architecture (for Antigravity)

> **Audience:** the Antigravity coding agent. Execute this end-to-end, **phase by phase**.
> Companion doc `global-layout-architecture.md` holds the *why*; THIS file holds the *what to do*.
>
> **This is a layout/architecture change, NOT a visual redesign.** Do not change colors,
> typography, component internals, motion, or copy. You are changing **widths, the container
> primitive, layout shells, spacing tokens, and breakpoints** — nothing else.
>
> After **every phase**: run `npm run build`, `npm run lint`, `npx tsc --noEmit` — all must stay
> clean. The app must render and look correct after each phase. Do not commit or push.

---

## 0. Ground rules (read first)

- **Repo:** Next.js 16 (App Router) + React 19 + **Tailwind v4 (CSS-first `@theme` in
  `src/app/globals.css`)** + TypeScript. No backend.
- **AGENTS.md:** this Next.js may differ from training data; skim
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` before touching
  layouts. Ignore doc "decoy" APIs (e.g. `unstable_instant`).
- **Backward compatible:** the `Container` default must reproduce today's behavior so nothing
  breaks mid-migration. Ship phase by phase; each phase leaves the app working.
- **Do not break** `(marketing)`, `(auth)`, `(app)` patient dashboard, or `provider/` portal.

### Locked decisions (do not re-litigate)
| Token | Width | Use |
|---|---|---|
| `prose` | **760px** | long-form reading (blog/legal/medical narrative) |
| `content` | **1200px** | marketing/sections — **default** |
| `app` | **1440px** | application pages: search, detail, booking |
| `wide` | **1600px** | wide heroes / gallery-heavy detail |
| `dashboard` | **1760px** | ultra-wide safety cap for dashboards |
| `fluid` | none (gutters only) | dashboard canvas + full-canvas |

- **Dashboards go fluid** (remove the inner `max-w-6xl` cap), bounded by gutters + a `dashboard`
  (1760px) ultra-wide safety cap.
- **Detail pages** use **~64/36** main/aside.
- **`Container` is the only width authority.** No page may hardcode `max-w-*` after migration.
- Add a **`3xl` (1920px)** breakpoint.

### Current state you are changing
- `src/components/ui/container.tsx` — caps at `max-w-[1280px]`, gutters `px-6 sm:px-8 lg:px-12`.
- `src/components/app/page-heading.tsx` — `AppPage` wraps content in `mx-auto max-w-6xl` (1152px).
  **This double-cap is the bug.**
- `src/app/(app)/layout.tsx`, `src/app/provider/layout.tsx` — sidebar + `flex-1` content.
- `src/app/(marketing)/layout.tsx` — navbar + `main` + footer.

---

## PHASE 1 — Tokens & breakpoint (foundation, no visible change)

Edit the `@theme` block in `src/app/globals.css`. **Add** (do not remove existing tokens):

```css
/* ---- Layout width scale ---- */
--container-prose: 760px;
--container-content: 1200px;
--container-app: 1440px;
--container-wide: 1600px;
--container-dashboard: 1760px;

/* ---- Gutter scale ---- */
--gutter-sm: 1.25rem;   /* 20px */
--gutter-md: 2rem;      /* 32px */
--gutter-lg: 3rem;      /* 48px */

/* ---- Vertical rhythm / spacing (8px base, 4px half-steps) ---- */
--section-y: 5rem;          /* 80px  — default section padding (lg bumps to ~112px in template) */
--stack-gap: 1.5rem;        /* 24px  — default vertical stack gap */
--card-pad-comfortable: 1.75rem;  /* 28px */
--card-pad-compact: 1.25rem;      /* 20px */

/* ---- Sticky offset (under the navbar) ---- */
--sticky-top: 6rem;     /* 96px */

/* ---- Breakpoint: ultra-wide ---- */
--breakpoint-3xl: 1920px;
```

> In Tailwind v4 CSS-first, `--breakpoint-3xl` enables `3xl:` variants, and the `--container-*`
> tokens are available as `max-w-[var(--container-app)]` etc. Verify `3xl:` compiles by adding a
> temporary `3xl:hidden` somewhere, building, then removing it.

**Phase 1 done when:** build/lint/tsc clean; **no visual change** anywhere (tokens are unused yet).

---

## PHASE 2 — Variant-driven `Container` (the single width authority)

Rewrite `src/components/ui/container.tsx` to accept a `size` prop. **Keep the default behavior
equivalent to today** so existing usages are unaffected.

Requirements:
- Props: `size?: "prose" | "content" | "app" | "wide" | "dashboard" | "fluid"` (default
  `"content"`), plus existing `className`/children passthrough.
- Map each size to its `max-w-[var(--container-…)]`; `fluid` applies **no** max-width (only gutters).
- Keep current responsive gutters: `px-6 sm:px-8 lg:px-12` (these are the gutter scale in practice).
- `mx-auto w-full` stays.
- **Compatibility check:** default `content` = `max-w-[1200px]`. Today's cap is `1280px`. This is a
  deliberate, small change (calmer marketing measure). It is acceptable and intended — do **not**
  add a `legacy` size; just confirm marketing pages still look right (they will).

Keep the JSDoc; document the `size` prop. Do not change any consumer yet.

**Phase 2 done when:** `Container` compiles with variants; default-size pages look essentially
unchanged; build/lint/tsc clean.

---

## PHASE 3 — Kill the dashboard double-cap (biggest visible win)

Make the patient + provider dashboards immersive.

### 3.1 `src/components/app/page-heading.tsx` → `AppPage`
Replace the inner `mx-auto max-w-6xl` with a **fluid, ultra-wide-capped** frame:
- Outer padding stays (`px-5 py-6 sm:px-8 lg:px-10 lg:py-8`).
- Inner wrapper changes from `max-w-6xl` to `max-w-[var(--container-dashboard)]` (1760) so content
  fills the canvas on large monitors but doesn't run unbounded on 4K. Keep `mx-auto`.
- `PageHeading` is unchanged.

### 3.2 Patient dashboard home `src/app/(app)/dashboard/page.tsx`
It currently hardcodes `mx-auto max-w-6xl` directly (not via `AppPage`). Change that inner cap to
`max-w-[var(--container-dashboard)]` to match. Leave the rest (greeting, tiles, `[1.6fr_1fr]` grid)
as-is — those already work and should now simply have more room.

### 3.3 Verify provider pages
Provider pages use `AppPage`, so they inherit the fix automatically. Spot-check
`provider/dashboard` and `provider/patients` fill the canvas with the sidebar present.

**Phase 3 done when:** at ≥1440px, patient + provider dashboards use the full width beside the
sidebar (no ~1152px column), and at >1920px they cap at 1760 and center. Build/lint/tsc clean.

---

## PHASE 4 — Application pages to `app` width (search / detail / booking feel substantial)

Audit every page under `src/app/(marketing)/` that is an **application** surface (not marketing
prose) and ensure its top-level width comes from `Container size="app"` (or `wide` where noted).
These pages currently render their own `Container` at the default cap.

Targets and the intended size:
- **Doctor search** `src/components/sections/doctors/doctor-search.tsx` → its `Container` becomes
  `size="app"`. Keep the `[280px_1fr]` filter/results grid.
- **Doctor profile** `src/app/(marketing)/doctors/[slug]/page.tsx` → `Container size="app"`. Keep
  the split but standardize it to **~64/36**: change `lg:grid-cols-[1fr_360px]` to
  `lg:grid-cols-[1.78fr_1fr]` (≈64/36) **or** keep a fixed aside but widen main — pick the
  fraction form for responsiveness. Aside stays sticky; bump sticky offset to `top-[var(--sticky-top)]`.
- **Booking** `src/app/(marketing)/book/[slug]/page.tsx` (and the `/book` wizard if the clinics
  module landed) → keep the **focused** centered measure: use `Container size="content"` with the
  existing `max-w-3xl` inner **removed** in favor of a `content`-capped, centered flow. (Booking is
  intentionally narrower than search/detail — focus over width.)
- **Clinics pages** (if present from the clinics module): listing/detail → `size="app"`,
  gallery-heavy clinic detail may use `size="wide"`.
- **Assistant** `src/app/(marketing)/assistant/*` and `/ai-chat` → leave the chat shell as-is
  (it's viewport-locked by design); only ensure its outer `Container` isn't narrower than the
  chat needs. Do **not** widen the conversation measure.

**Rule:** after this phase, **no application `page.tsx` or section hardcodes `max-w-[1280px]` /
`max-w-6xl` / `max-w-3xl`** for its top-level frame — width comes from `Container size`.
(Inner reading caps inside a card, e.g. a paragraph measure, are fine.)

**Phase 4 done when:** search/detail/clinics render at 1440 and feel substantial on large
monitors; detail pages are ~64/36 with a sticky aside; booking stays focused; chat unchanged.
Build/lint/tsc clean.

---

## PHASE 5 — Marketing widths explicit + layout shells named

### 5.1 Marketing pages declare width intent
- Landing sections (`hero`, `services`, `stats`, `feature-bar`, `booking-search`,
  `featured-clinics` if present) → `Container size="content"` (default; make it explicit where a
  hero wants more room, use `size="wide"`).
- Any long-form/reading page (about/legal/blog when they exist) → `size="prose"`.
- Keep section vertical rhythm as-is (`py-20 lg:py-28`).

### 5.2 Introduce an `AppLayout` wrapper (thin, optional but recommended)
Application pages currently sit directly in `(marketing)` with the marketing navbar+footer. That's
fine to keep. **Do not create a new route group.** Instead, ensure application pages consistently
use `Container size="app"` (done in Phase 4). If you want a single seam, add a small
`src/components/layout/app-frame.tsx` that renders `<Container size="app">{children}</Container>`
and have application pages use it — optional; only if it reduces repetition.

### 5.3 Unify dashboard shells
`src/app/(app)/layout.tsx` and `src/app/provider/layout.tsx` are near-identical. Leave them as two
files (different nav), but confirm both produce the same fluid content frame via `AppPage`. No
behavior change — just verify consistency.

**Phase 5 done when:** every marketing/app page's width is set by a `Container size`, not a raw
`max-w-*`; build/lint/tsc clean; visuals match intent (marketing calm, app wide, dashboards fluid).

---

## PHASE 6 — Guardrail + docs

- Add a short note to `AGENTS.md` (or a new `src/components/ui/README` comment in `container.tsx`):
  **"Page width is set via `<Container size=…>` only. Do not hardcode `max-w-*` for page-level
  frames. Sizes: prose/content/app/wide/dashboard/fluid."**
- Optionally add an ESLint rule or a grep-based check in review notes flagging
  `max-w-[` / `max-w-6xl` / `max-w-3xl` inside `src/app/**/page.tsx`. (If adding an ESLint rule is
  heavy, just document the guardrail.)

**Phase 6 done when:** the guardrail is documented; a grep for raw page-level `max-w-*` in
`src/app/**/page.tsx` returns only intentional inner-content caps (none for top-level frames).

---

## Files touched (summary)
```
src/app/globals.css                          # Phase 1: tokens + 3xl breakpoint
src/components/ui/container.tsx              # Phase 2: size variants
src/components/app/page-heading.tsx          # Phase 3: AppPage fluid (max-w-dashboard)
src/app/(app)/dashboard/page.tsx             # Phase 3: inner cap → dashboard
src/components/sections/doctors/doctor-search.tsx   # Phase 4: size="app"
src/app/(marketing)/doctors/[slug]/page.tsx  # Phase 4: size="app" + 64/36 split + sticky-top
src/app/(marketing)/book/[slug]/page.tsx     # Phase 4: content-capped focused flow
src/app/(marketing)/clinics/**               # Phase 4: app/wide (if clinics module present)
src/components/sections/* (marketing)        # Phase 5: explicit size="content"/"wide"
src/components/layout/app-frame.tsx          # Phase 5: optional thin wrapper
AGENTS.md or container.tsx doc               # Phase 6: guardrail note
```
> Do NOT touch: colors/typography/motion tokens, component internals, the AI chat conversation
> measure, the auth pages' visual design, or any copy.

---

## Acceptance criteria (reviewer checklist)

**Build/quality** — `npm run build`, `npm run lint`, `npx tsc --noEmit` clean after every phase;
no visual regressions in colors/type/motion.

**Tokens** — width scale (`prose/content/app/wide/dashboard`), gutter scale, spacing/rhythm,
`--sticky-top`, and `--breakpoint-3xl` exist in `@theme`; `3xl:` variants compile.

**Container** — `Container` takes `size` (default `content`); `fluid` applies no max-width; it is
the only place page-level widths are defined.

**Dashboards** — patient + provider dashboards have **no `max-w-6xl` inner cap**; they fill the
canvas beside the sidebar at 1440, and cap at 1760 (centered) beyond 1920. They feel like
applications, not a narrow website column.

**Application pages** — doctor search, doctor profile, clinics (if present), render at `app`
(1440) width; detail pages use ~64/36 with a sticky aside aligned to `--sticky-top`; booking stays
focused (`content`); AI chat conversation measure unchanged.

**Marketing** — sections set `Container size` explicitly (`content`/`wide`/`prose`); long-form is
`prose`-capped; vertical rhythm unchanged.

**Guardrail** — no top-level `max-w-*` hardcoded in `src/app/**/page.tsx`; width comes from
`Container size` (or the optional `AppFrame`). Guardrail documented.

**Backward compatibility** — migration was staged; the app worked after each phase; existing
routes (`(marketing)`, `(auth)`, `(app)`, `provider/`) all still function.

---

## Notes for the executing agent
- Ship phase by phase; verify visually at **375px (mobile), 1024px (laptop), 1440px (desktop),
  and 1920px+ (ultra-wide)** after Phases 3–5 — the win is most visible at ≥1440px.
- The `content` cap moves 1280→1200 by design (calmer measure); if any marketing section looks
  too tight, switch that section to `size="wide"` rather than reverting the token.
- If a spec instruction conflicts with a real repo convention you discover, follow the repo and
  leave a short code comment noting the deviation.
- Do not add tests (project has none) unless asked. Do not commit/push.
```
