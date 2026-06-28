# HelixHealth — Global Layout Architecture

> **Type:** Foundational architecture document (Design Systems).
> **Scope:** Layout system only — width, grid, spacing, density, templates, responsive
> behavior, and the integration plan. **Not** a visual redesign: colors, typography, components,
> and motion stay exactly as they are. This document defines the *frame* every page renders into.
> **Status:** Architecture & decisions. No implementation code here.

---

## 0. Executive summary

HelixHealth's design language is strong; its **layout system is the weak link**. The root cause
is concrete and singular:

- **One fixed content cap for everything.** `Container` (`src/components/ui/container.tsx`) caps
  at `max-w-[1280px]` with gutters `px-6 sm:px-8 lg:px-12`.
- **A second, narrower cap stacked on top for app pages.** `AppPage`
  (`src/components/app/page-heading.tsx`) wraps content in `mx-auto max-w-6xl` (**1152px**)
  *inside* an already-sidebar-reduced area. Provider/patient dashboards therefore render their
  content into ~1152px even on a 4K display, producing the large dead margins described.

The fix is **not** "make the container wider." It is to replace a single global width with a
**tiered, intent-based layout system**: a small set of named layout categories, each with its own
max-width, grid, density, and responsive contract. Every page declares which category it belongs
to; it never hand-rolls widths. This is how Stripe, Linear, Notion, Framer, and Vercel keep
hundreds of screens coherent.

The system is delivered as **design tokens + a typed `Container` with variants + a handful of
layout shell/template components**, all in Tailwind v4's CSS-first `@theme` (already in use in
`globals.css`). It is additive and backward-compatible: existing pages keep working as we migrate
category by category.

---

## 1. Global Layout Philosophy

### 1.1 Layout is a function of intent, not a constant
A marketing landing page and a clinical dashboard have opposite goals. Marketing **persuades**:
it wants generous negative space, a measured reading width, and rhythm that guides the eye down a
narrative. A dashboard **operates**: it wants density, peripheral information, and full use of the
glass so the user's tools are within reach. Forcing both into one 1280px column makes marketing
feel cramped and dashboards feel like a website trapped in a tube. **Therefore width, grid, and
density are chosen per page *category*, not set once globally.**

### 1.2 Reference philosophies (what we borrow, precisely)
- **Stripe** — *measured marketing, wide docs/dashboard.* Marketing content sits on a calm
  ~1080–1200px reading measure with strong vertical rhythm; the dashboard expands far wider with
  a persistent sidebar. Two different widths, same brand. → We adopt **category-specific caps**.
- **Linear** — *the app is not a website.* Full-viewport app shell, collapsible sidebar, content
  that breathes edge-to-edge with internal padding rather than a centered column. → We adopt
  **fluid dashboard canvas with internal gutters, no second inner cap.**
- **Notion / Arc** — *content width follows content type.* A reading page is narrow and centered
  for legibility; a database/board view goes full-width. Width is a property of the *view*. →
  We adopt **a "reading" density with a hard measure cap (~720–800px) for prose-like surfaces.**
- **Framer / Apple** — *whitespace as a premium signal, asymmetry as interest.* Large, deliberate
  negative space; hero compositions that are intentionally asymmetric (45/55) rather than a
  single centered column. → We adopt **an 8px spatial system with generous section rhythm and
  sanctioned asymmetric splits**, fixing the "everything centered in one narrow column" problem.
- **Vercel** — *one container primitive, many widths via tokens.* A single `<Container>` that
  takes a size variant, never bespoke `max-w-*` per page. → We adopt **one typed `Container` with
  variants** as the only width authority.

### 1.3 How spacing shapes perception
- **Negative space reads as quality.** More padding around fewer elements signals confidence and
  premium positioning (marketing, detail heroes).
- **Density reads as power.** Tighter spacing and more elements per row signals capability and
  efficiency (dashboards, tables, search results).
- **Consistent rhythm reads as craft.** A single spatial scale (multiples of 8px, with 4px
  half-steps) applied to section gaps, card padding, and stack spacing makes unrelated pages feel
  like one product. Arbitrary one-off margins are the enemy.
- **Measure (line length) governs readability.** Prose beyond ~75–90 characters fatigues the
  reader; long-form/medical text must be capped regardless of viewport.

### 1.4 The core rule
> **No page sets its own width.** A page picks a **Layout Category**; the category owns max-width,
> gutters, grid, and default density. Width changes happen in tokens, once, and propagate everywhere.

---

## 2. Layout Categories

Four categories cover the product today and every roadmap module. Each maps to a route group and
a shell component (see §14).

### 2.1 Marketing Layout
**Pages:** Landing, About, Features, Pricing, Blog, Authentication, legal/help.
**Intent:** persuade, narrate, breathe. Currently `(marketing)` + `(auth)`.

| Property | Spec |
|---|---|
| Max width (content) | **`content` cap ≈ 1200px** for standard sections; **`prose` cap ≈ 760px** for long-form (blog/legal); hero may use `wide` (1360px) for asymmetric compositions |
| Gutters (padding) | `px-6` (mobile) → `sm:px-8` → `lg:px-12` (unchanged, good) |
| Grid | 12-col, 24px gutters; sections free to use asymmetric splits (e.g. 45/55 hero, already in `hero.tsx`) |
| Vertical rhythm | Section padding `py-20 lg:py-28` (matches `services.tsx`); inter-section seams via tokens |
| Sidebar | None |
| Footer | Global marketing footer |
| Responsive | Single-column stack on mobile; progressive multi-column from `md`/`lg` |

### 2.2 Application Layout
**Pages:** Doctor Search, Clinic Search, Doctor Profile, Clinic Details, Branch, Booking,
Appointment Details, Search Results, Health Tools, Settings (public), AI Recommendations.
**Intent:** task-focused but public-facing; wider than marketing reading width, still framed.

| Property | Spec |
|---|---|
| Max width | **`app` cap ≈ 1440px** (search/detail get real room; this is the headline fix for "detail pages look small") |
| Gutters | `px-6 → sm:px-8 → lg:px-12` |
| Grid | 12-col; **list/detail split** templates (sidebar + results; main + sticky aside) standardized — see §6 |
| Detail proportions | **~64/36** main/aside (better than 70/30 for our card-heavy asides) — see §9 |
| Search proportions | Fixed **`280px` filter rail + fluid results** (already used in `doctor-search.tsx`) |
| Sticky | Detail aside is sticky (`lg:sticky lg:top-24`); search filter rail sticky |
| Responsive | Filters/aside collapse to bottom-sheet or stack below on mobile |

### 2.3 Dashboard Layout
**Pages:** Patient Dashboard, Provider portal, AI Chat shell, future Doctor/Admin dashboards, Analytics.
**Intent:** an **application**, not a page. This is where the current double-cap hurts most.

| Property | Spec |
|---|---|
| Max width | **`fluid` — no centered content cap.** Content fills the area beside the sidebar, constrained only by gutters + an optional very-wide safety cap (`dashboard` ≈ 1760px) on ultra-wide so line lengths stay sane |
| Inner cap | **Remove the inner `max-w-6xl`.** Let widgets use the full canvas; cap *individual reading widgets*, not the page |
| Gutters | `px-5 → sm:px-8 → lg:px-10` (matches current dashboard pages) |
| Grid | **Adaptive widget grid** (auto-fit min-column, e.g. 12-col on desktop, 8 on laptop, 4 on tablet); explicit `lg:grid-cols-[1.6fr_1fr]` style splits allowed |
| Sidebar | Persistent left sidebar (desktop, `w-64`), collapsible to icon-rail (future), drawer on mobile — already implemented in `app-sidebar.tsx` / `provider-sidebar.tsx` |
| Footer | None (app chrome, not a website) |
| Responsive | Sidebar → top bar + drawer < `lg`; widgets reflow from N-col to single-col |

### 2.4 Full-Canvas Layout
**Pages (future):** AI Workspace, Medical Timeline, Maps, Medical Imaging, Telemedicine/Video.
**Intent:** immersive, edge-to-edge, app-takes-over-the-screen.

| Property | Spec |
|---|---|
| Max width | **100vw / 100dvh**, no caps; chrome is minimal/overlaid |
| Gutters | Component-managed (e.g. map controls float; video fills) |
| Grid | Panel-based (resizable/expandable panels), not a content grid |
| Sidebar | Contextual, collapsible, often overlay |
| Scroll | Inner panels scroll independently; the page itself does not scroll |
| Responsive | Panels stack / become tabs on small screens; bottom sheets for controls |

---

## 3. Responsive Container System

Replace the single 1280px cap with a **named width scale** (tokens). Each width exists for a
reason; pages reference the *name*, never the pixel value.

| Token | Width | Purpose / who uses it |
|---|---|---|
| `--container-prose` | **760px** | Long-form reading (blog, legal, medical record narrative). Caps *measure* for legibility. |
| `--container-content` | **1200px** | Default marketing/section width. Calm, premium, narrative. |
| `--container-app` | **1440px** | Application pages (search, detail, booking). The "feels like a modern SaaS" width. |
| `--container-wide` | **1600px** | Wide marketing heroes, comparison/pricing tables, dense detail pages that want more room. |
| `--container-dashboard` | **1760px** | Ultra-wide safety cap for dashboards so content uses big monitors without lines becoming unreadably long. |
| `fluid` | none (gutters only) | Dashboard canvas + full-canvas; constrained only by padding and the optional `dashboard` cap. |

**Why a scale instead of one width:**
- **1280 alone** under-uses ≥1440px monitors (the current complaint) yet is fine for prose.
- **Reading vs. operating** need opposite widths; a single value can't serve both.
- **Big displays:** without an upper *safety* cap, fluid dashboards on 4K produce 200-char lines;
  `--container-dashboard` prevents that while still feeling immersive.
- **Tokenized widths** make a future global adjustment a one-line change, product-wide.

**Gutter scale (responsive padding), tokenized too:** `--gutter-sm: 1.25rem` (20) /
`--gutter-md: 2rem` (32) / `--gutter-lg: 3rem` (48). Gutters grow with viewport so content never
kisses the edge on large screens and never wastes space on mobile.

---

## 4. Grid System

A single **12-column** logical grid underpins everything; categories use subsets.

- **Columns / gutters / margins:** 12 columns, **24px gutter** (`gap-6`) at desktop, **16px**
  (`gap-4`) at tablet, single-column at mobile. Outer margin = the container gutter (§3).
- **Section grids (marketing):** content blocks span 12; split heroes use asymmetric fractions
  (`lg:grid-cols-[45fr_55fr]`, already in `hero.tsx`) — sanctioned, not ad-hoc.
- **Card grids:** responsive auto-flow — `1 → sm:2 → lg:3/4/5` depending on card size
  (services use 5, roster uses 2, clinic results use 2–3). Standardize via a `CardGrid` template
  (§6) rather than re-declaring `grid-cols-*` per page.
- **Dashboard grids:** **adaptive** — prefer `auto-fit, minmax(min, 1fr)` so widgets reflow by
  available space, with explicit fraction splits (`[1.6fr_1fr]`, `[2fr_1fr]`) where a fixed
  relationship is intended (matches current dashboards).
- **List layouts:** single-column stacks with internal 12-col rows (e.g. appointment rows,
  schedule rows) — vertical rhythm via a shared `Stack` spacing token.
- **Search layouts:** `[filterRail 280px] [results fluid]`; rail becomes a drawer < `lg`.
- **Detail layouts:** `[main ~64%] [aside ~36%]`; aside sticky; collapses below main on mobile.
- **Nested grids:** allowed one level deep inside a widget/card (e.g. vitals tiles inside a
  patient overview), using the same gutter tokens so rhythm stays consistent.

---

## 5. Content Density Rules

Density is a **named property of a region**, selectable per template, expressed through the
spacing scale (card padding, row height, stack gap, font step).

| Density | Card padding | Row/stack gap | Used by | Rationale |
|---|---|---|---|---|
| **Comfortable** | `p-6 / p-7` | `gap-6` | Marketing, detail pages, settings | Premium calm; few elements, lots of air. |
| **Compact** | `p-4 / p-5` | `gap-3/4` | Search results, card grids | More results visible without feeling cramped. |
| **Dashboard** | `p-5` + tiles | `gap-4/6` | Patient/provider dashboards | Balance of glanceability and breathing room (current dashboards are here). |
| **Reading** | `p-0`, measure-capped | line-height 1.7 | Blog, legal, long medical narratives | Optimized for sustained reading; width capped at `prose`. |
| **Medical-record** | `p-3/4`, table-like | tight rows, clear dividers | Records timeline, lab tables, history | Maximize scannable data per screen; dividers over cards for long lists. |

**Selection guidance:** start every template at **Comfortable**; step to **Compact** when the
primary job is *scanning many items*; use **Dashboard** for widget canvases; force **Reading** for
prose; reserve **Medical-record** for dense clinical data lists where row-scanning beats card
spacing.

---

## 6. Page Templates

Reusable templates compose a Layout Category + grid + density + slots. Pages fill slots; they
don't lay out from scratch. Each template names: Header / Content / Sidebar(Aside) / Footer /
Sticky / Scroll / Cards / Spacing.

1. **Landing Template** — Cat: Marketing(`content`/`wide` hero). Header: global navbar (transparent→glass). Content: stacked sections, asymmetric heroes, `py-20 lg:py-28` rhythm. Footer: global. Sticky: navbar. Density: Comfortable.
2. **Doctor Profile / Clinic Details / Appointment / Branch (Detail Template)** — Cat: Application(`app`/`wide`). Header: breadcrumb + cover. Content: **main ~64%** (about, services, doctors, reviews, tabs). Aside: **~36% sticky** booking/CTA. Gallery: full content-width on clinic. Cards: Comfortable. Scroll: page scroll; aside sticky. (Generalizes today's `doctors/[slug]` + the planned clinic pages.)
3. **Search Results Template** — Cat: Application(`app`). Header: search bar + quick chips. Sidebar: `280px` filter rail (drawer on mobile). Content: fluid results list/grid + sort + pagination + AI/Featured rails + map toggle. Density: Compact. (Generalizes `doctor-search.tsx` → reused by clinic/hospital/lab search.)
4. **Dashboard Template** — Cat: Dashboard(`fluid`, capped `dashboard`). Sidebar: persistent/collapsible. Header: greeting + actions row. Content: **adaptive widget grid**, expandable panels. Footer: none. Sticky: sidebar + (mobile) top bar. Density: Dashboard. **No inner content cap.**
5. **Booking Flow Template** — Cat: Application(`app`, but **stepper-centered** `content` for focus). Header: stepper. Content: one step per view (mobile) / stepper + body (desktop); sticky bottom CTA on mobile. Density: Comfortable.
6. **AI Chat Template** — Cat: Dashboard-class but **viewport-locked** (see §11). Content: conversation column + capabilities/history aside; composer pinned bottom; messages scroll. Density: Comfortable→Compact bubbles.
7. **Settings Template** — Cat: Application/Dashboard(`content`-capped within fluid). Content: section cards (profile, toggles), `content`-width even inside a fluid dashboard for readability. Density: Comfortable.
8. **Reading Template** — Cat: Marketing(`prose`). Content: single centered measure-capped column, generous line-height. Density: Reading.

---

## 7. Responsive Strategy (adaptive, not scaling)

Breakpoints (Tailwind defaults, named by device intent): `sm 640` (large phone) · `md 768`
(tablet) · `lg 1024` (laptop) · `xl 1280` (desktop) · `2xl 1536` (large desktop) · **add
`3xl 1920`** (ultra-wide) via `@theme` for explicit ultra-wide rules.

| Device | Behavior (adaptive — layout *changes*, not just shrinks) |
|---|---|
| **Mobile (<640)** | Single column. Sidebars → drawers/bottom sheets. Filters/branch-pickers → bottom sheets. Sticky bottom CTA on detail/booking. Cards full-width. |
| **Foldables** | Treat unfolded as small tablet (`md`); respect `dvh`/safe-area; avoid fixed heights — use `min-h-dvh`. Two-pane (list+detail) may appear when width allows. |
| **Tablet (768–1024)** | 2-column card grids; detail aside drops *below* main (not squeezed); search filters become a drawer; dashboard widgets 2-up. |
| **Laptop (1024–1440)** | Full templates engage: sidebar persistent, detail split active, dashboard multi-col. This is the design "anchor" width. |
| **Desktop (1440–1920)** | Application pages hit `app` cap (1440); dashboards go fluid; marketing holds `content` with growing gutters. |
| **Ultra-wide (>1920)** | Marketing/app stay capped (centered, large gutters — intentional negative space, *not* a bug). Dashboards expand to `dashboard` cap then center; full-canvas truly fills. Never let dashboard line length run unbounded. |

**Principle:** at each breakpoint we choose the *right composition* (drawer vs rail, stacked vs
split, tabs vs panels), never merely scale the laptop layout up or down.

---

## 8. Dashboard Philosophy — "an application, not a website"

- **Full-width usage:** delete the inner `max-w-6xl`; content uses the full canvas beside the
  sidebar, bounded only by gutters and the ultra-wide `dashboard` safety cap.
- **Widget placement:** an adaptive grid (auto-fit + intentional fraction splits like the current
  `[1.6fr_1fr]`); primary widgets lead, secondary widgets fill the rail.
- **Adaptive grids:** widgets declare a *minimum* width and reflow by available space rather than
  hard-coded column counts, so the same dashboard looks right on a laptop and a 4K panel.
- **Expandable panels:** widgets can expand to a focused/full view (e.g. a chart → full-width);
  reserve a panel-expansion pattern now even if used later.
- **Sticky navigation:** sidebar sticky full-height (already done); add a sticky page sub-header
  (greeting/actions) option for long dashboards.
- **Collapsible sidebar:** plan an icon-rail collapsed state (≈`w-16`) toggled by the user and
  auto-collapsing on laptop widths to reclaim canvas — the current `w-64` sidebar is the expanded
  state of this control.

---

## 9. Detail Pages Philosophy — immersive

For Doctor, Clinic, Appointment, Medical Center detail pages:

- **Main content width:** wide (`app`/`wide` category) so the page feels substantial, not a
  narrow card on a big screen — directly addresses "detail pages look small."
- **Proportions:** **~64/36** main/aside (not 70/30). Our asides carry interactive booking
  widgets, fees, and CTAs that need real width; 36% keeps them usable, 64% keeps the main
  immersive. On `wide`, allow **60/40** for gallery-heavy clinic pages.
- **Gallery sizing:** clinic cover spans the full content width; thumbnail strip below; lightbox
  for full view. Doctor pages keep the avatar+cover header.
- **Cards & tabs:** group secondary info (services, doctors, reviews, hours) into **tabs** when a
  detail page exceeds ~4 stacked sections, so the immersive main stays scannable.
- **Information hierarchy:** identity → trust (rating/verified) → primary action (book) →
  depth (about, services, doctors, reviews) → related. Sticky aside keeps the primary action in
  view through the whole scroll.

---

## 10. Search Pages

One template serves Doctor, Clinic, and future Hospital/Lab/Radiology search (the `FacilityType`
discriminator means search is type-agnostic):

- **Layout:** `[filter rail 280px sticky] [results fluid]` within the `app` cap; rail → bottom-sheet
  drawer < `lg` (pattern exists in `doctor-search.tsx`).
- **Filters:** shared filter atoms (`FilterGroup/Radio/Toggle` — to be extracted to
  `sections/search/filters.tsx`); per-entity filter sets plug in (specialty/location/insurance/
  open-now/type).
- **Results:** Compact-density cards; list or 2–3-col grid; **AI Recommendations** rail above
  results; **Featured** rail; **pagination/load-more** at the foot.
- **Map area (future):** a **list/map toggle** in the results header swaps the grid for a
  split `[results][map]` view; `MapPlaceholder` reserves the seam now (no map dependency yet).
- **Sorting:** sort control in the results header (relevance/rating/fee/distance), as today.
- **Empty/Loading:** standardized states (dashed-border empty; skeleton grid via `loading.tsx`).

---

## 11. AI Pages — a distinct layout philosophy

The AI Assistant is neither marketing nor a standard dashboard; it is a **focused conversation
surface**.

- **Viewport-locked, not page-scrolled:** the chat column is a fixed-height region
  (`h-[calc(100dvh-…)]`) with an internal scroll and a pinned composer — already implemented in
  `assistant-chat.tsx`. Use `dvh` for mobile browser chrome correctness.
- **Conversation area:** centered, capped at a comfortable reading measure (~760–820px) even on
  wide screens — long chat lines hurt readability (Notion/Arc reading principle).
- **Sidebar:** capabilities / **history** / saved prompts aside on desktop (`[1fr_320px]`, as
  built); collapses on mobile.
- **Prompt suggestions:** chips below the bubble / above the composer (exists) — the entry point
  from the Hero AI bar and `/ai-chat?q=` already feeds this.
- **Attachments & multimodal (future):** reserve composer space for attach controls and a message
  type that can render images/files/cards; recommendation cards (Doctor/Clinic) already render
  inline — the same slot extends to multimodal blocks.
- **Streaming:** the "thinking" bubble + incremental append pattern is the seam for real token
  streaming later; layout already accommodates variable-height growing messages.

---

## 12. Visual Balance Rules (global)

- **Whitespace / negative space:** treat as a *designed element*. Marketing sections use large
  vertical rhythm (`py-20 lg:py-28`); ultra-wide gutters are intentional framing, not waste.
- **Card spacing:** padding by density (§5); inter-card gap `gap-4` (compact) / `gap-6` (comfortable).
- **Section spacing:** standardized section paddings via tokens; never one-off margins between
  sections.
- **Container spacing:** content never touches the viewport edge (gutter scale §3) and never runs
  unbounded on large screens (width scale §3).
- **Alignment:** establish a consistent left edge per template; avoid mixing centered and
  left-aligned blocks within one region.
- **Sanctioned asymmetry:** hero/feature splits (45/55, 64/36) create visual interest and defeat
  the "single narrow centered column" problem — they are *rules*, not exceptions.
- **Visual rhythm & reading flow:** a single 8px spacing scale (with 4px half-steps) governs all
  gaps so the eye moves predictably; heading scale and section cadence reinforce the same beat.

---

## 13. Future Scalability

The category + token model absorbs every roadmap module **without redesign**:

| Future module | Category it slots into | New layout work |
|---|---|---|
| Hospitals / Labs / Radiology / Dental / Eye / Physio | **Application** (search + detail templates; `FacilityType` discriminator) | None structural — data + badges only |
| Insurance | Application (listing/detail) or Settings | Reuse templates |
| Telemedicine / Video calls | **Full-Canvas** | New shell, same tokens |
| Family Accounts | Dashboard (account switcher in sidebar) | Reuse dashboard template |
| Admin Panel | **Dashboard** (denser variant, tables) | New nav set, same shell |
| Doctor Dashboard | **Dashboard** (already exists as `provider/`) | Conforms to dashboard template |
| Analytics | Dashboard (chart widgets, expandable panels) | Reuse adaptive widget grid |
| Medical AI Workspace | **Full-Canvas** (panels) | New shell, same tokens |

Because pages reference **category + width token + density**, adding a module is "pick the
category, fill the template" — never "invent a new layout."

---

## 14. Frontend Integration Plan (architecture, no code)

### 14.1 Single source of width truth — upgrade `Container`
`src/components/ui/container.tsx` becomes a **variant-driven** primitive:
- Add a `size` prop mapping to the width tokens: `prose | content | app | wide | dashboard | fluid`
  (default `content` to preserve current behavior).
- Keep the existing responsive gutters; expose an optional `bleed`/`flush` for full-canvas.
- **Deprecate ad-hoc `max-w-*` on pages.** Pages set width by choosing a `Container size` (or a
  template that does). This is the one change that fixes the "too narrow" problem globally.

### 14.2 Remove the double-cap on app pages
`AppPage` (`src/components/app/page-heading.tsx`) currently forces `max-w-6xl` (1152px) inside the
sidebar area. Change it to render a **fluid** container (capped at `dashboard` on ultra-wide) so
dashboards become immersive. `PageHeading` stays as-is (it's good chrome).

### 14.3 Layout shell components (per category)
Formalize the four shells (most already exist; this names and aligns them):
- `MarketingLayout` — navbar + `Container(content)` slot + footer (today: `(marketing)/layout.tsx`).
- `AppLayout` *(public application)* — navbar + `Container(app)` content frame + footer. **New
  thin wrapper** so search/detail/booking stop hand-rolling `Container`.
- `DashboardLayout` — sidebar + fluid content (today: `(app)/layout.tsx`, `provider/layout.tsx`);
  unify both on the same shell with a `nav` prop.
- `CanvasLayout` *(future)* — minimal/overlay chrome, 100dvh, panel host.

### 14.4 Page templates
Build the §6 templates as composition components (`DetailTemplate`, `SearchTemplate`,
`DashboardTemplate`, `BookingTemplate`, `ReadingTemplate`) that wire category + grid + density +
slots. Pages become declarative ("this is a Detail page with these slots").

### 14.5 Responsive utilities
- Add the `3xl (1920)` breakpoint in `@theme`.
- Provide spacing/section tokens (`--section-y`, `--stack-gap`, `--card-pad-{comfortable,compact}`)
  and density helper classes so templates select density by name, not by scattered padding values.
- Standardize sticky offsets (`--sticky-top: 6rem`) so every sticky aside/rail aligns under the navbar.

### 14.6 Design tokens (extend the existing `@theme` in `globals.css`)
Add, alongside the current color/radius/shadow tokens:
- **Width scale:** `--container-prose|content|app|wide|dashboard` (§3).
- **Gutter scale:** `--gutter-sm|md|lg` (§3).
- **Spacing/rhythm:** 8px base with 4px half-steps; `--section-y`, `--stack-gap`.
- **Density:** padding tokens per density (§5).
- **Breakpoint:** `3xl`. **Sticky:** `--sticky-top`.
All CSS-first (matches the existing Tailwind v4 `@theme` approach) — no JS config, themeable later.

### 14.7 Tailwind strategy
- **CSS-first tokens** (as today) → tokens are available as utilities (`max-w-app`, `px-gutter-lg`)
  and as `var(--…)` for arbitrary values, keeping one source of truth.
- Prefer **semantic utility compositions inside templates** over repeating raw classes per page.
- Keep arbitrary `[var(--…)]` usage (already common, e.g. `rounded-[var(--radius-xl2)]`) for
  shadows/radii so design changes stay centralized.

### 14.8 Theme consistency & migration
- **Backward compatible:** `Container` default = `content` (current behavior) → nothing breaks.
- **Migration order (low-risk → high-impact):** (1) add tokens + `Container` variants + `3xl`;
  (2) flip `AppPage`/dashboards to fluid (biggest visible win, fixes the complaint); (3) wrap
  search/detail/booking in `AppLayout`+templates at `app` width; (4) marketing adopts `content`/
  `prose`/`wide` explicitly; (5) introduce `CanvasLayout` when the first full-canvas feature lands.
- **Guardrail:** a lint/review rule discouraging raw `max-w-*` / bespoke container widths in
  `app/**/page.tsx` — width must come from `Container size` or a template.

---

## 15. Decision log (the load-bearing choices)
1. **One width → a width *scale*.** Tokenized, named by intent. (§3)
2. **Per-category layouts.** Marketing / Application / Dashboard / Full-Canvas. (§2)
3. **Kill the dashboard double-cap.** `AppPage` goes fluid; dashboards become immersive. (§14.2)
4. **Detail = 64/36, wide-capped.** Bigger main, usable sticky aside. (§9)
5. **Density is a named, selectable property.** Not improvised per page. (§5)
6. **`Container` is the only width authority.** No page-level `max-w-*`. (§14.1)
7. **Additive, staged migration.** Zero-break rollout; biggest win first. (§14.8)

---

## 16. Acceptance criteria for the eventual implementation
- A single `Container` with `size` variants is the only place widths are defined; no
  `app/**/page.tsx` hardcodes `max-w-*`.
- Dashboards (patient + provider) render content edge-to-edge beside the sidebar (no `max-w-6xl`
  inner cap), with an ultra-wide safety cap; they feel like applications on 1440–4K.
- Application detail/search/booking pages render at the `app` (1440) width and feel substantial on
  large monitors; detail pages use ~64/36 with a sticky aside.
- Marketing uses `content`/`prose`/`wide` deliberately; long-form is measure-capped at `prose`.
- The `3xl` breakpoint and the width/gutter/spacing/density tokens exist in `@theme`; templates
  select density and width by name.
- Adding a future module = pick a category + template; no new bespoke layout code.
- Migration is staged and backward-compatible; `npm run build`/`lint` stay clean at each step;
  visual identity (colors, type, components, motion) is unchanged.
```
