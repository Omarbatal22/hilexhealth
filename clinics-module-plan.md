# Frontend Architecture — Clinics & Medical Centers Module

> **Status:** Planning document. No implementation in this file.
> **Author intent:** Introduce *Clinics & Medical Centers* as a first-class entity that
> connects doctors, locations, schedules, appointments, and patients.
> **Scope:** Frontend architecture only — UX, IA, navigation, pages, components, data
> models (frontend/mock), routing, responsive behavior, and future-proofing.
> Designed so a later backend swap (mock arrays → API) requires no structural rewrite.

---

## 0. Guiding principles & how this fits the current codebase

The platform today treats **`Doctor`** as the root entity (`src/lib/doctors.ts`), with these flows:

- **Search** → `src/components/sections/doctors/doctor-search.tsx` (client filters over `DOCTORS`)
- **Card** → `src/components/sections/doctors/doctor-card.tsx`
- **Profile** → `src/app/(marketing)/doctors/[slug]/page.tsx` + sticky `BookingWidget`
- **Booking** → `src/app/(marketing)/book/[slug]/page.tsx` (single-step confirm)
- **Nav** → `NAV_LINKS` in `src/lib/site-data.ts`, rendered by `src/components/sections/navbar.tsx`

This module **inverts the hierarchy**: a doctor now *belongs to* one or more facilities, and a
booking resolves to a **specific branch**. To avoid a rewrite later, we adopt four principles:

1. **One generic entity, many types.** Model a single **`MedicalFacility`** with a
   `type` discriminator (`clinic`, `medical_center`, and later `hospital`, `lab`, …).
   Adding "Hospitals" or "Labs" becomes a new enum value + optional type-specific fields —
   **not** a new page tree. (See §11.)
2. **Relationships by ID, never by nesting.** `Facility → Branch → Doctor → Schedule →
   Appointment` are linked with string IDs (`facilityId`, `branchId`, `doctorId`). This
   mirrors a relational backend and keeps mock data flat and API-ready.
3. **Mirror existing patterns, don't reinvent.** Reuse `Card`, `Badge`, `Button`, `Avatar`,
   `StarRating`, `Input`, `Reveal`, `Container`, the server-page + `"use client"`-section
   split, and the `PageProps<"…">` route helpers already in use.
4. **Data layer is the single source of truth.** All new entities live in `src/lib/*.ts`
   as typed consts with selector functions (`getClinic`, `getBranch`, …), exactly like
   `getDoctor`. UI never hardcodes data. When the backend lands, only these selectors change.

---

## 1. User Experience Flow

### 1.1 Primary journeys
**A. Browse facilities (new, parallel to doctor search)**
```
Landing / Nav "Clinics"
   ↓
Clinics Listing (search + location + type + rating + insurance + open-now)
   ↓
Clinic Details (services, doctors, branches, reviews, CTA)
   ↓
Branch Page (the specific location: hours, doctors, slots, directions)
   ↓
Booking Wizard (Doctor → Clinic → Branch → Date → Time → Confirm)
```

**B. Doctor-first (updated existing journey)**
```
Find Doctors → Doctor Profile
   ↓  (profile now shows Primary Clinic + Other Clinics + Branch selector)
Pick clinic + branch on the profile
   ↓
Booking Wizard (Clinic & Branch pre-selected)
```

**C. AI-assisted (updated)**
```
AI Assistant: "I have knee pain"
   ↓
Assistant returns: Orthopedic doctors + Nearby/Top-rated clinics (clinic cards inline)
   ↓
Tap a clinic → Clinic Details → Booking Wizard
```

### 1.2 Booking flow — the central UX change
Today: **Doctor → Time** (one confirm screen). New canonical flow:
```
Doctor → Clinic → Branch → Date → Time → Confirmation
```
Two **entry contexts** feed the same wizard with different pre-filled steps:

| Entry point | Pre-selected | User chooses |
|---|---|---|
| From a **doctor** profile/card | Doctor | Clinic → Branch → Date → Time |
| From a **clinic** details page | Facility | Doctor (filtered to this facility) → Branch → Date → Time |
| From a **branch** page | Facility + Branch | Doctor (at this branch) → Date → Time |

Design rule: **never dead-end a step.** If a doctor practices at only one clinic/branch,
auto-select and collapse that step (show it as a confirmed summary chip, skip the picker).

### 1.3 State, empty, and loading states (every async surface)
- **Loading:** skeleton cards (listing), skeleton profile blocks (details) — reuse the
  dashed-border placeholder pattern already used in `doctor-search.tsx` empty state.
- **Empty:** "No clinics match your filters" with a *Clear filters* action (mirror the
  existing doctor empty state at `doctor-search.tsx:233`).
- **Error/offline (future):** generic retry card — stubbed now, ready for API.

---

## 2. Information Architecture

```
HelixHealth
├── Find Doctors            (existing)
├── Clinics & Medical Centers   (NEW top-level)
│   ├── Clinics Listing     /clinics
│   ├── Clinic Details      /clinics/[clinicSlug]
│   └── Branch Page         /clinics/[clinicSlug]/branches/[branchSlug]
├── AI Assistant            (existing, gains clinic recommendations)
├── Health Tools            (existing)
└── About                   (existing)

Cross-cutting:
├── Global Search           (Doctors · Clinics · Centers · Specialties · Cities · Areas)
├── Booking Wizard          /book  (redesigned, multi-step)
└── Patient Dashboard       (appointments now show clinic + branch)
```

**Entity ownership map**
```
MedicalFacility (clinic / medical_center / … )
   └── owns → Branch[]            (locations)
                 └── hosts → Doctor[]        (via DoctorBranchSchedule)
                                └── has → Schedule (per branch)
                                              └── produces → Appointment
Doctor  ⇄  belongs to many Facilities (primaryClinicId + clinicIds[])
Insurance, Specialty, Service, Amenity = shared lookup tables
```

---

## 3. Navigation Changes

### 3.1 Primary nav (`NAV_LINKS` in `src/lib/site-data.ts`)
Insert **Clinics** immediately after **Find Doctors**:

| Order | Label | Href |
|---|---|---|
| 1 | Find Doctors | `/doctors` |
| 2 | **Clinics** *(new)* | `/clinics` |
| 3 | AI Assistant | `/assistant` |
| 4 | Health Tools | `#health-tools` |
| 5 | About Us | `#about` |

- `navbar.tsx` needs **no code change** — it maps `NAV_LINKS` and computes active state via
  `pathname.startsWith(link.href)`, which already works for `/clinics` and its children.
- The existing **Dashboard** link can move into the authenticated/user menu (it points to the
  patient app) to keep the public bar to five items — optional, called out for the designer.

### 3.2 Secondary nav touchpoints
- **Patient app sidebar** (`src/components/app/app-sidebar.tsx`, `APP_NAV`): add a "Clinics"
  item beside "Find Doctors" so logged-in patients can browse facilities too.
- **Footer** (`src/components/sections/footer.tsx`): add a "Top Medical Centers" column or
  links, mirroring the existing "Top Specialties" column.
- **Mobile:** Clinics appears in the existing slide-down panel automatically (driven by
  `NAV_LINKS`). See §10 for the optional bottom-nav proposal.

---

## 4. Required New Pages

### 4.1 Clinics Listing — `/clinics`
Server page renders shell + metadata; a `"use client"` `ClinicSearch` section owns filter state
(mirrors `DoctorSearch`).

- **Hero band** — heading + subcopy + primary search (reuse the hero gradient + `glass-strong`
  search shell from `doctor-search.tsx`).
- **Filters:** Search · Governorate · City · Area · Clinic Type · Rating · Insurance ·
  **Open Now** toggle. Desktop = sticky left sidebar; mobile = bottom-sheet drawer (same
  pattern as `doctor-search.tsx` filter drawer).
- **AI Recommended Clinics** strip (personalized rail, stub ranking now).
- **Featured Clinics** rail (curated `featured: true`).
- **Results grid** of `ClinicCard`s with **Pagination** (or load-more), **Empty State**,
  **Loading State**.
- **Map Toggle** — a list/map switch in the results header; renders `MapPlaceholder` now,
  ready for a real map later (future-ready, no map dependency yet).

### 4.2 Clinic Details — `/clinics/[clinicSlug]`
Equivalent to the doctor profile. Static-generated via `generateStaticParams` over all clinics;
`getClinic(slug)` + `notFound()` (same shape as `doctors/[slug]/page.tsx`).

Sections (top → bottom): **Cover** + **Gallery** → identity (name, type badge, rating,
verified) → **Description** → **Facilities/Amenities** → **Available Services** →
**Doctors Working There** (filterable by branch) → **Working Hours** → **Location Map** +
**Branches** list → **Insurance Accepted** → **Ratings & Reviews** → **Related Clinics** rail.
Sticky **Book Appointment CTA** (desktop aside; mobile sticky bar), launching the wizard with
the facility pre-selected.

### 4.3 Branch Page — `/clinics/[clinicSlug]/branches/[branchSlug]`
A single physical location. Nested under its clinic so the URL encodes the relationship and the
breadcrumb is natural (Clinic → Branch). `generateStaticParams` over branch combinations;
`getBranch(clinicSlug, branchSlug)` + `notFound()`.

Displays: **Address** · **Map** · **Working Hours** · **Doctors at this branch** ·
**Available Time Slots** · **Parking** · **Accessibility** · **Phone** · **Directions** ·
**Book Appointment** (wizard with facility **and** branch pre-selected).

---

## 5. Existing Pages That Must Be Updated

| Page / File | Change |
|---|---|
| `src/lib/doctors.ts` | Extend `Doctor` with `primaryClinicId`, `clinicIds[]`; add `DoctorBranchSchedule`. |
| `src/lib/site-data.ts` | Add **Clinics** to `NAV_LINKS`; reuse `GOVERNORATES`; add `CITIES`, `AREAS`, `INSURANCERS`. |
| `doctor-card.tsx` | Show **primary clinic** name + branch count; "Book now" routes into the wizard. |
| `doctor-search.tsx` | Add **clinic / governorate / city / insurance** filters; allow results to surface the doctor's clinics. |
| `doctors/[slug]/page.tsx` | New blocks: Primary Clinic, Other Clinics, **Branch Selector**, schedule per branch, "Book at this clinic", clinic info + directions. |
| `booking-widget.tsx` | Becomes branch-aware: pick **clinic → branch** before day/slot; slots come from `DoctorBranchSchedule`. |
| `book/[slug]/page.tsx` | Replaced by the **multi-step wizard** (§9). The single-confirm screen becomes the final step. |
| `booking-search.tsx` (home) | The existing "Doctor or clinic name" field + Governorate/District already gesture at this — wire the clinic path to `/clinics`; add a **Doctors / Clinics** toggle. |
| Patient dashboard appointments (`src/components/sections/dashboard/appointments-list.tsx`, `src/lib/dashboard-data.ts`) | Appointment rows show **clinic + branch + address**; data gains `facilityId`/`branchId`. |
| AI assistant (`src/lib/assistant-data.ts`, `assistant-chat.tsx`) | Replies can include **clinic recommendations** rendered as clinic cards (§ AI Integration). |
| Global search (new surface in navbar) | Multi-entity results: Doctors · Clinics · Centers · Specialties · Cities · Areas. |

---

## 6. Component List

Grouped by domain. **Reuse** = built on existing primitives; **New** = net-new component.

### 6.1 Cards & identity
- `ClinicCard` *(New)* — facility summary: cover thumb, name, **`ClinicBadge`** (type), rating,
  governorate/city, top specialties, branch count, "Open now" pill, CTA. (Pattern: `DoctorCard`.)
- `BranchCard` *(New)* — address, hours-today, doctor count, distance, Directions + Book.
- `DoctorAvailabilityCard` *(New)* — doctor + their next slots **at a given branch** (used on
  clinic/branch pages). Reuses `Avatar`, `StarRating`, `Badge`.
- `RelatedClinics` / `FeaturedClinics` rails *(New)* — horizontal scroll of `ClinicCard`.

### 6.2 Badges & atoms (extend `src/components/ui/`)
- `ClinicBadge` *(New)* — facility-type chip (Clinic / Medical Center / Hospital…). Thin wrapper
  over existing `Badge` with a type→tone/icon map.
- `FacilityBadge` *(New)* — amenity chip (Parking, Pharmacy, Lab, Wheelchair…) with icon.
- `InsuranceBadge` *(New)* — insurer chip; list renders accepted insurers.
- `OpenNowPill` *(New)* — derived open/closed indicator from working hours.

### 6.3 Detail-page modules
- `ClinicGallery` *(New)* — cover + thumbnail grid / lightbox (asset-free placeholder now,
  like the avatar approach).
- `WorkingHoursCard` *(New)* — weekly hours table, highlights today, shows open/closed.
- `FacilitiesList` / `ServicesList` *(New)* — badge grids.
- `DirectionsCard` *(New)* — address + phone + "Get directions" + `MapPlaceholder`.
- `MapPlaceholder` *(New)* — styled map stub with a pin; single seam to drop a real map later.
- `ClinicStatistics` *(New)* — quick stats (doctors, branches, specialties, avg rating) — uses
  the dashboard stat-tile pattern.
- `BranchSelector` *(New)* — segmented control / dropdown to switch active branch on a profile
  or in the wizard; on mobile opens a **bottom sheet**.

### 6.4 Booking
- `BookingWizard` *(New, client)* — orchestrates Doctor → Clinic → Branch → Date → Time → Confirm;
  holds shared state; renders step components below.
- `BookingStepper` *(New)* — progress header for the wizard steps.
- `ClinicPicker`, `BranchPicker`, `DatePicker`, `SlotPicker`, `BookingSummary` *(New)* — step
  bodies. `SlotPicker`/`DatePicker` reuse the day+slot grid logic already in `booking-widget.tsx`.
- `AppointmentCTA` *(New)* — sticky/standalone "Book Appointment" button used across clinic,
  branch, and doctor pages (mobile = sticky bottom bar).

### 6.5 Search & discovery
- `ClinicSearch` *(New, client)* — listing-page controller (filters, sort, pagination, results).
- `ClinicFilters` *(New)* — the filter panel (sidebar + bottom sheet) — composed from the
  existing `FilterGroup`/`FilterRadio`/`FilterToggle` primitives in `doctor-search.tsx`
  (extract these into a shared module so both searches share them).
- `GlobalSearch` *(New)* — command-palette/overlay returning grouped multi-entity results.
- `MapToggle` *(New)* — list/map view switch.

> **Refactor opportunity:** lift `FilterGroup`, `FilterRadio`, `FilterToggle` out of
> `doctor-search.tsx` into `src/components/sections/search/filters.tsx` so Doctors **and**
> Clinics reuse identical filter atoms.

---

## 7. Data Models (Frontend Only)

Mock-first, ID-linked, API-shaped. New file **`src/lib/clinics.ts`** (mirrors `doctors.ts`);
doctor extensions live in `src/lib/doctors.ts`. Schema sketches (not implementation):

```ts
// ---- Facility type discriminator: the future-proofing backbone ----
type FacilityType =
  | "clinic" | "medical_center"
  // future (see §11) — no structural change needed to add these:
  | "hospital" | "diagnostic_center" | "laboratory"
  | "radiology_center" | "dental_center" | "eye_center" | "physiotherapy_clinic";

interface MedicalFacility {
  id: string;
  slug: string;                 // URL: /clinics/[slug]
  name: string;
  type: FacilityType;           // drives ClinicBadge + filtering
  tagline: string;
  description: string;
  coverImage: string;           // placeholder ref now
  gallery: string[];
  rating: number;
  reviewCount: number;
  specialtySlugs: string[];     // FK → SPECIALTIES (existing)
  serviceIds: string[];         // FK → Service[]
  amenityIds: string[];         // FK → Amenity[]  (Parking, Pharmacy, Lab…)
  insuranceIds: string[];       // FK → Insurance[]
  branchIds: string[];          // FK → Branch[]
  featured: boolean;
  aiScore?: number;             // ranking hook for "AI Recommended"
  reviews: Review[];            // reuse existing Review interface from doctors.ts
}

interface Branch {
  id: string;
  slug: string;                 // URL: /clinics/[clinicSlug]/branches/[slug]
  facilityId: string;           // FK → MedicalFacility
  name: string;                 // "Maadi Branch"
  address: { governorate: string; city: string; area: string; street: string };
  geo: { lat: number; lng: number };   // for MapPlaceholder → real map later
  phone: string;
  workingHours: WeeklyHours;
  amenities: { parking: boolean; wheelchair: boolean; [k: string]: boolean };
  doctorIds: string[];          // FK → Doctor (who practices here)
}

// ---- Doctor extension (added to existing Doctor in src/lib/doctors.ts) ----
interface DoctorClinicLink {
  primaryClinicId: string;      // FK → MedicalFacility
  clinicIds: string[];          // all facilities this doctor works at
}

interface DoctorBranchSchedule {
  doctorId: string;
  branchId: string;
  feeUsd: number;               // fee can vary per branch
  days: DaySlot[];              // reuse existing DaySlot from doctors.ts
  slots: string[];              // reuse existing TIME_SLOTS shape
}

// ---- Booking draft (frontend wizard state; later → POST payload) ----
interface AppointmentDraft {
  doctorId: string;
  facilityId: string;
  branchId: string;
  date: string;
  time: string;
  mode: "In-person" | "Video visit";
  reason?: string;
}

// ---- Shared lookup tables ----
interface Service   { id: string; label: string; icon?: string }
interface Amenity   { id: string; label: string; icon: string }
interface Insurance { id: string; label: string; logo?: string }
type DayHours    = { open: string; close: string } | "closed";
type WeeklyHours = Record<"mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun", DayHours>;
```

**Selectors (API seam):** `getClinic(slug)`, `getBranch(clinicSlug, branchSlug)`,
`getClinicsByDoctor(doctorId)`, `getDoctorsByBranch(branchId)`,
`getScheduleForDoctorAtBranch(doctorId, branchId)`, `getOpenNow(facility)`,
`recommendClinics(intent | specialty)`. UI calls only these — swapping mock→fetch is local.

**Reuse, don't duplicate:** `SPECIALTIES`, `Review`, `DaySlot`, `AVAILABILITY_DAYS`,
`TIME_SLOTS` already exist in `doctors.ts`; `GOVERNORATES`/`DISTRICTS` exist in `site-data.ts`.

---

## 8. Folder Structure

```
src/
├── app/
│   └── (marketing)/
│       ├── clinics/
│       │   ├── page.tsx                          # Listing (server) → <ClinicSearch/>
│       │   ├── loading.tsx                        # listing skeleton
│       │   └── [clinicSlug]/
│       │       ├── page.tsx                       # Clinic Details (SSG)
│       │       ├── loading.tsx
│       │       └── branches/
│       │           └── [branchSlug]/
│       │               └── page.tsx               # Branch Page (SSG)
│       └── book/
│           └── page.tsx                            # Booking Wizard (redesigned; query-driven)
│
├── components/
│   ├── sections/
│   │   ├── clinics/                                # clinic domain sections
│   │   │   ├── clinic-search.tsx                   # "use client"
│   │   │   ├── clinic-card.tsx
│   │   │   ├── branch-card.tsx
│   │   │   ├── clinic-gallery.tsx
│   │   │   ├── working-hours-card.tsx
│   │   │   ├── directions-card.tsx
│   │   │   ├── branch-selector.tsx                 # "use client"
│   │   │   ├── doctor-availability-card.tsx
│   │   │   ├── clinic-statistics.tsx
│   │   │   ├── related-clinics.tsx
│   │   │   └── featured-clinics.tsx
│   │   ├── booking/                                # shared booking wizard
│   │   │   ├── booking-wizard.tsx                  # "use client"
│   │   │   ├── booking-stepper.tsx
│   │   │   ├── steps/ (clinic|branch|date|slot|summary).tsx
│   │   │   └── appointment-cta.tsx
│   │   └── search/
│   │       ├── filters.tsx                         # shared FilterGroup/Radio/Toggle (extracted)
│   │       └── global-search.tsx                   # "use client"
│   └── ui/                                         # atoms (extend existing)
│       ├── clinic-badge.tsx
│       ├── facility-badge.tsx
│       ├── insurance-badge.tsx
│       ├── open-now-pill.tsx
│       └── map-placeholder.tsx
│
└── lib/
    ├── clinics.ts                                  # MedicalFacility, Branch, lookups, selectors
    ├── booking.ts                                  # AppointmentDraft + wizard helpers
    ├── doctors.ts                                  # EXTENDED: clinic links + branch schedules
    └── site-data.ts                                # EXTENDED: NAV_LINKS, CITIES, AREAS, INSURANCE
```

Rationale: clinics live in the public **`(marketing)`** group (same as doctors); booking is
promoted to a top-level wizard reused by every entry point; atoms go to `ui/`; shared search
filters are extracted once and consumed by both Doctors and Clinics.

---

## 9. Routing

| Route | Type | Source / params | Notes |
|---|---|---|---|
| `/clinics` | Static (client filtering) | `CLINICS` | Listing; filters in URL query for shareable searches |
| `/clinics/[clinicSlug]` | SSG | `generateStaticParams` over clinics; `getClinic` | `notFound()` on miss |
| `/clinics/[clinicSlug]/branches/[branchSlug]` | SSG | params over branches; `getBranch` | Breadcrumb Clinic → Branch |
| `/book` | Dynamic (client wizard) | query: `?doctor=&clinic=&branch=&date=&time=` | Replaces `/book/[slug]`; deep-linkable, back-button safe |
| `/doctors/[slug]` | SSG (existing) | — | Gains clinic/branch blocks |

**Booking URL strategy.** Use **query params** as wizard state (`/book?doctor=sarah-johnson&clinic=…&branch=…`).
Benefits: shareable, browser back moves between steps, prefilled from any entry point, and it
maps cleanly to a future server action. Keep a **redirect** from the old `/book/[slug]` →
`/book?doctor=[slug]` so existing links/`DoctorCard` CTAs don't break during migration.

**Filter URL strategy (listing).** Reflect filters in the query
(`/clinics?gov=cairo&type=medical_center&insurance=axa&open=1`) using the
`window.history.pushState` + `useSearchParams` pattern documented in the project's Next docs
(`linking-and-navigating.md`) — no full reloads, SEO-friendly, shareable.

---

## 10. Responsive Behavior

**Navigation.** Desktop: Clinics sits in the horizontal bar (driven by `NAV_LINKS`).
Mobile: appears in the existing slide-down panel. *Optional* enhancement: a fixed **bottom nav**
on listing/details (Home · Doctors · Clinics · AI · Account) for thumb reach — proposed, not required.

**Cards.** `ClinicCard`/`BranchCard` go full-width single-column on mobile, 2-up on `md`, grid on
`lg` — same responsive grid the roster/search already use. Cover images shrink to a compact
thumbnail strip on mobile.

**Branch selection.** Desktop = inline segmented control / dropdown. Mobile = **bottom sheet**
listing branches with address + open-now, confirming with one tap (pattern already used for the
mobile filter drawer in `doctor-search.tsx`).

**Booking.** Desktop = side-by-side wizard (stepper + step body). Mobile = **one step per screen**
with the `BookingStepper` collapsed to a progress bar and a persistent bottom "Continue"/"Confirm".

**Filters.** Desktop = sticky left sidebar. Mobile = full-height **bottom-sheet drawer** with a
"Show N results" button (reuse existing drawer markup).

**Sticky CTA.** Clinic, branch, and doctor pages show a **sticky bottom `AppointmentCTA`** on
mobile (desktop keeps it in the sticky aside). Gallery → swipeable carousel; hours/map stack vertically.

**Bottom sheets** are the mobile primitive for: branch selector, filters, date/slot picking, and
the map toggle — consistent, reachable, and dismissible.

---

## 11. Future Scalability

**The discriminator pattern is the whole strategy.** Because facilities share one
`MedicalFacility` interface keyed by `type: FacilityType`, the following expand with **zero
structural change** — add an enum value, optional type-specific fields, and a label/icon in the
`type → {badge, icon}` map:

```
Hospitals · Diagnostic Centers · Laboratories · Radiology Centers
Dental Centers · Eye Centers · Physiotherapy Clinics
```

What stays identical when adding a new type:
- Routes (`/clinics/[slug]`, branch route) — or rename the segment to a neutral `/centers`
  later if "Clinics" feels narrow (keep `/clinics` as an alias). **Recommendation:** keep the
  user-facing label "Clinics" but name code/types generically (`MedicalFacility`, `facilityId`)
  so the rename is cosmetic.
- `ClinicCard`, listing filters, details layout, booking wizard — all type-agnostic; they read
  `facility.type` for the badge and any conditional sections.
- Search, AI recommendations, dashboard appointment display — all keyed on `facilityId`.

Type-specific needs (e.g., a lab's "test catalog", a radiology center's "modalities") attach as
**optional fields** or a small `typeMeta` map, rendered by a conditional sub-section — never a
forked page tree. Filters can grow a "Facility type" group that lists whatever types exist in data.

**Other scale seams already in place:** ID-based relationships (API-ready), selector functions
(single swap point for fetch), `MapPlaceholder` (one seam for a real map), `aiScore` (ranking
hook), and query-driven URLs (cacheable/SSG-friendly).

---

## 12. Homepage Changes (kept uncrowded)

Add **one** new, scannable section without bloating the landing page. Current home order
(`src/app/(marketing)/page.tsx`): `Hero → BookingSearch → FeatureBar → Services → Stats`.

**Recommended:**
1. **Reuse, don't add, for discovery:** extend the existing `BookingSearch` split section with a
   **Doctors / Clinics toggle** on the left "Book Appointment" half — one control, no new section.
2. **Add a single `FeaturedClinics` rail** ("Top Medical Centers") as a horizontal,
   swipeable carousel of 6–8 `ClinicCard`s, placed **after `Services`** (so the fold stays AI-first
   per the recent hero redesign). Heading + "View all clinics →" link to `/clinics`.
3. **Defer** "Nearby Clinics" and "AI Recommended Clinics" to the **listing page** (they need
   location/AI context that belongs there), keeping the homepage to a single new rail.

Net homepage: `Hero → BookingSearch(+toggle) → FeatureBar → Services → FeaturedClinics → Stats`.

---

## 13. AI Integration (clinic recommendations)

Extend the existing canned-intent engine (`getReply` in `src/lib/assistant-data.ts`) so an
assistant turn can return **structured recommendations**, not just text:

```
"I have knee pain"
   ↓  intent → specialty: "orthopedics"
   ↓
Assistant reply (text) + recommendation payload:
   • Orthopedic doctors      (filter DOCTORS by specialtySlug)
   • Nearby clinics          (recommendClinics by specialty + governorate)
   • Best-rated centers      (sort facilities by rating, type=medical_center)
```

Implementation shape (frontend):
- Add an optional `recommendations?: { doctorIds?: string[]; clinicIds?: string[] }` to the
  assistant `ChatMessage` type.
- `assistant-chat.tsx` renders these as inline `DoctorCard`/`ClinicCard` chips below the bubble
  (it already renders suggestion chips — same slot).
- A `recommendClinics(intent)` selector in `clinics.ts` returns ranked clinics (uses `aiScore` +
  specialty match + rating). Pure function now; LLM/back-end swap later behind the same signature.
- The Hero AI prompt chips and `/ai-chat` already pass an initial prompt — a "Find the right
  doctor"/clinic intent flows straight into this path.

---

## 14. Search Changes (Global Search)

A new `GlobalSearch` overlay (command-palette style) returns **grouped** results across entities:

| Group | Source | Result → route |
|---|---|---|
| Doctors | `DOCTORS` | `/doctors/[slug]` |
| Clinics & Centers | `CLINICS` (by `type`) | `/clinics/[slug]` |
| Specialties | `SPECIALTIES` | `/doctors?specialty=…` / `/clinics?specialty=…` |
| Cities / Areas | `GOVERNORATES`/`CITIES`/`AREAS` | `/clinics?gov=…&city=…` |

- Trigger: the existing navbar (add a search affordance) + `Cmd/Ctrl-K`.
- Each group capped (e.g. top 3) with "See all" deep-links into the relevant listing with filters
  pre-applied via query params.
- Pure client filtering over the mock arrays now; one fetch call later behind a `search(query)` selector.

---

## 15. Build Order (suggested phasing for whoever implements)

1. **Data layer** — `clinics.ts` (facilities, branches, lookups, selectors) + extend `doctors.ts`
   (clinic links, branch schedules) + `site-data.ts` (nav, cities/areas/insurance). *No UI.*
2. **Atoms** — `ClinicBadge`, `FacilityBadge`, `InsuranceBadge`, `OpenNowPill`, `MapPlaceholder`;
   extract shared search filters.
3. **Listing** — `/clinics` + `ClinicSearch` + `ClinicCard` (loading/empty states).
4. **Details + Branch** — clinic and branch pages with all modules + `RelatedClinics`.
5. **Booking wizard** — `/book` redesign + `/book/[slug]` redirect; branch-aware `BookingWidget`.
6. **Doctor profile/card/search updates** — clinic blocks, branch selector, filters.
7. **Homepage rail + dashboard appointment display.**
8. **AI recommendations + Global Search.**

Each phase is independently shippable and leaves the app in a working state.

---

## 16. Acceptance Criteria (for the eventual implementation)

- Patients can browse `/clinics`, filter by location/type/rating/insurance/open-now, and reach a
  clinic, a branch, and a booking — all responsive, with loading/empty states.
- Every doctor surfaces its **primary clinic + other clinics + branch selector**; booking resolves
  to a **specific branch**; single-clinic/branch doctors auto-skip those steps.
- The booking wizard works from **all three entry points** (doctor, clinic, branch) and is
  deep-linkable via query params; old `/book/[slug]` redirects.
- Adding a new `FacilityType` (e.g., "laboratory") requires **no new pages/components** — only
  data + a badge/label map entry.
- No new runtime dependencies; reuses existing UI primitives and the project's
  server-page + client-section conventions; `npm run build` and `npm run lint` stay clean.
```
