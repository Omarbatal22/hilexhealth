# Build Spec — Clinics & Medical Centers Module (for Antigravity)

> **Audience:** the Antigravity coding agent. Execute this end-to-end, **phase by phase**.
> It is self-contained. The companion document `clinics-module-plan.md` holds the *why*
> (architecture/UX rationale); THIS file holds the *what to build*.
>
> **After each phase**, run `npm run lint` and `npx tsc --noEmit` and keep them clean. A human
> reviewer will check your work against the **Acceptance Criteria** (§ end). Do not run
> `git commit`/`push`.

---

## 0. Ground rules (read first)

- **Repo:** Next.js 16 (App Router) + React 19 + Tailwind v4 + TypeScript. **No backend** —
  all data is typed const arrays in `src/lib/*.ts` with selector functions. Keep it that way.
- **AGENTS.md:** this Next.js may differ from training data. Before writing routing code, skim
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`. Ignore doc
  "decoy" APIs like `unstable_instant`.
- **Match existing conventions exactly:** Server-Component pages with `export const metadata`;
  `"use client"` only for stateful section components; data in `src/lib`; reuse
  `Card`, `Badge`, `Button`, `Avatar`, `StarRating`, `Input`, `Reveal`, `Container`, `Eyebrow`,
  `cn`; icons from `lucide-react`; design tokens from `globals.css`. No new dependencies.
- **Dynamic routes** use `generateStaticParams` + `PageProps<"/route/[param]">` (see
  `src/app/(marketing)/doctors/[slug]/page.tsx`) and `notFound()` for misses.
- **Do not break existing routes.** `/doctors`, `/doctors/[slug]`, `/book/[slug]`,
  `/assistant`, `/ai-chat`, the patient `(app)` dashboard, and the `provider/` portal must keep
  working at every phase.

### Naming decision (LOCK THIS IN)
- **Code/types are generic:** entity is `MedicalFacility`, foreign keys are `facilityId`, the
  type discriminator is `FacilityType`. This is what makes future types (Hospital, Lab…) a data
  change, not a rewrite.
- **User-facing label is "Clinics."** Routes are `/clinics/*`.

### Locale decision (LOCK THIS IN)
- Clinics/branches use **Egyptian governorates** (Cairo, Giza, Alexandria…), consistent with
  `GOVERNORATES`/`DISTRICTS` already in `src/lib/site-data.ts` and the home `booking-search.tsx`.
- The existing `Doctor.location` strings are **US/legacy** — leave them as-is, but treat them as
  display-only. The **authoritative location is the branch address.** Doctor pages should show
  the clinic/branch location going forward.

### Reuse, don't duplicate
`SPECIALTIES`, `Review`, `DaySlot`, `AVAILABILITY_DAYS`, `TIME_SLOTS`, `getDoctor` already exist
in `src/lib/doctors.ts`. `GOVERNORATES`, `DISTRICTS`, `NAV_LINKS` exist in `src/lib/site-data.ts`.

### Reference files to read before coding
| Pattern | File |
|---|---|
| Search w/ filters + mobile drawer | `src/components/sections/doctors/doctor-search.tsx` |
| Result card | `src/components/sections/doctors/doctor-card.tsx` |
| Profile page (SSG, generateStaticParams, notFound) | `src/app/(marketing)/doctors/[slug]/page.tsx` |
| Booking widget (day+slot grid, local state) | `src/components/sections/doctors/booking-widget.tsx` |
| Booking confirm page | `src/app/(marketing)/book/[slug]/page.tsx` |
| Nav (maps NAV_LINKS) | `src/components/sections/navbar.tsx` |
| Home composition | `src/app/(marketing)/page.tsx` |
| Data/selectors convention | `src/lib/doctors.ts`, `src/lib/site-data.ts` |

---

## PHASE 1 — Data layer (no UI)

### 1.1 New file `src/lib/clinics.ts`
Define types and seed data exactly as below (extend the arrays following the same shape; aim for
**5 facilities** and **8 branches** total). Add selectors at the bottom.

```ts
import { type LucideIcon, /* icons you use for amenities */ } from "lucide-react";
import { type Review } from "@/lib/doctors"; // reuse

export type FacilityType =
  | "clinic" | "medical_center"
  // future (no structural change needed to add): keep in the union now
  | "hospital" | "diagnostic_center" | "laboratory"
  | "radiology_center" | "dental_center" | "eye_center" | "physiotherapy_clinic";

export interface Service   { id: string; label: string }
export interface Amenity   { id: string; label: string; icon: LucideIcon }
export interface Insurance { id: string; label: string }

export type DayHours = { open: string; close: string } | "closed";
export type WeeklyHours = Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", DayHours
>;

export interface Branch {
  id: string;
  slug: string;                 // /clinics/[clinicSlug]/branches/[slug]
  facilityId: string;
  name: string;                 // "Maadi Branch"
  address: { governorate: string; city: string; area: string; street: string };
  geo: { lat: number; lng: number };
  phone: string;
  workingHours: WeeklyHours;
  parking: boolean;
  wheelchair: boolean;
  doctorIds: string[];          // doctor slugs that practice here
}

export interface MedicalFacility {
  id: string;
  slug: string;                 // /clinics/[slug]
  name: string;
  type: FacilityType;
  tagline: string;
  description: string;
  rating: number;
  reviewCount: number;
  specialtySlugs: string[];     // FK → SPECIALTIES.slug
  serviceIds: string[];         // FK → SERVICES
  amenityIds: string[];         // FK → AMENITIES
  insuranceIds: string[];       // FK → INSURANCERS
  branchIds: string[];          // FK → BRANCHES
  featured: boolean;
  aiScore: number;              // 0..100 ranking hook for "AI Recommended"
  reviews: Review[];
}

// Per-doctor, per-branch schedule. Reuse DaySlot/TIME_SLOTS shapes from doctors.ts.
export interface DoctorBranchSchedule {
  doctorId: string;             // doctor slug
  branchId: string;
  feeUsd: number;
  slots: string[];              // subset of TIME_SLOTS
}
```

**Seed lookups (concrete):**
- `SERVICES`: e.g. consultation, lab-tests, x-ray, ultrasound, ecg, physiotherapy, vaccination, minor-surgery.
- `AMENITIES`: parking (Car), pharmacy (Pill), lab (FlaskConical), wheelchair (Accessibility),
  wifi (Wifi), cafe (Coffee), kids-area (Baby). Pick real `lucide-react` icons.
- `INSURANCERS`: axa, allianz, metlife, bupa, misr-insurance, self-pay.

**Seed facilities (build all 5; concrete examples):**
```
1. helix-medical-center  | "HelixHealth Medical Center" | medical_center | Cairo | featured | aiScore 95
2. nile-care-clinic      | "Nile Care Clinic"           | clinic         | Giza  | featured | aiScore 88
3. alexandria-heart-inst | "Alexandria Heart Institute" | medical_center | Alexandria       | aiScore 90
4. cairo-ortho-clinic    | "Cairo Orthopedic Clinic"    | clinic         | Cairo            | aiScore 84
5. smile-dental-center   | "Smile Dental Center"        | dental_center  | Giza  | featured | aiScore 80
```
Give each a realistic `description`, `tagline`, `rating` (4.5–5.0), `reviewCount`, `specialtySlugs`
drawn from existing `SPECIALTIES`, 2–4 `reviews` (reuse `Review` shape from `doctors.ts`), and
`branchIds`.

**Seed branches (8 total; each tied to a facility):** e.g. `helix-medical-center` → Nasr City +
New Cairo branches; `nile-care-clinic` → Dokki branch; etc. Each branch gets a full `WeeklyHours`
(Fri/Sat closed or weekend hours per MENA norms), `phone`, `geo` (any plausible Cairo lat/lng),
`parking`/`wheelchair`, and `doctorIds` referencing the **existing doctor slugs**
(`sarah-johnson`, `michael-chen`, `emily-rodriguez`, `james-wilson`, `aisha-patel`, `david-kim`).

**Seed `DOCTOR_BRANCH_SCHEDULES: DoctorBranchSchedule[]`** — for each doctor, 1–2 branch
schedules with `slots` chosen from `TIME_SLOTS`.

**Selectors (export these; UI must use only these):**
```ts
export const CLINICS: MedicalFacility[];
export const BRANCHES: Branch[];
export function getClinic(slug: string): MedicalFacility | undefined;
export function getBranch(clinicSlug: string, branchSlug: string): Branch | undefined;
export function getBranchesForClinic(facilityId: string): Branch[];
export function getClinicsForDoctor(doctorSlug: string): MedicalFacility[];
export function getDoctorsForBranch(branchId: string): /* Doctor[] */;   // map slugs via getDoctor
export function getScheduleForDoctorAtBranch(doctorSlug: string, branchId: string): DoctorBranchSchedule | undefined;
export function isOpenNow(branch: Branch): boolean;  // compare against a FIXED demo "now" — do NOT use Date.now() at module scope; compute in component or accept a now arg
export function recommendClinics(opts: { specialtySlug?: string; governorate?: string; limit?: number }): MedicalFacility[];
export function getRelatedClinics(facility: MedicalFacility, limit?: number): MedicalFacility[];
```
> Note on `isOpenNow`: compute inside a client component using `new Date()` there (allowed in
> components), or accept a `now` param. Do not call `Date.now()`/`new Date()` at module top level.

### 1.2 Extend `src/lib/doctors.ts`
Add two optional fields to the `Doctor` interface and populate them on all 6 doctors:
```ts
primaryClinicId: string;   // facility id
clinicIds: string[];       // all facilities this doctor works at
```
Keep `location`/`distanceMi` as-is (legacy display).

### 1.3 Extend `src/lib/site-data.ts`
- **NAV_LINKS:** insert `{ label: "Clinics", href: "/clinics" }` immediately after "Find Doctors".
  (Optionally move "Dashboard" out of the public bar — leave if unsure.)
- Add `CITIES: string[]` and `AREAS: string[]` (Cairo/Giza areas: Nasr City, Maadi, Dokki,
  New Cairo, 6th of October, Heliopolis, Zamalek, Mohandessin — you can reuse `DISTRICTS`).

**Phase 1 done when:** types compile, `npm run lint` + `npx tsc --noEmit` clean, nav shows Clinics.

---

## PHASE 2 — Shared atoms (`src/components/ui/`)

Thin wrappers over existing `Badge`/`Card`. Create:
- `clinic-badge.tsx` — `<ClinicBadge type={FacilityType}/>`: maps type → label + tone + icon
  (e.g. medical_center → primary, clinic → neutral, dental_center → teal). Built on `Badge`.
- `facility-badge.tsx` — `<FacilityBadge amenity={Amenity}/>`: icon + label chip.
- `insurance-badge.tsx` — `<InsuranceBadge insurance={Insurance}/>`: neutral chip.
- `open-now-pill.tsx` *(client)* — green "Open now" / muted "Closed"; computes via `isOpenNow`.
- `map-placeholder.tsx` — styled box with a centered `MapPin`, address caption, and a "Get
  directions" link (`https://maps.google.com/?q=lat,lng`). Single seam for a real map later.

Also **extract shared filter atoms**: move `FilterGroup`, `FilterRadio`, `FilterToggle` out of
`doctor-search.tsx` into `src/components/sections/search/filters.tsx` and re-import them in
`doctor-search.tsx` (no behavior change). Clinic search will reuse them.

**Phase 2 done when:** atoms render in isolation, `doctor-search.tsx` still works unchanged, lint/tsc clean.

---

## PHASE 3 — Clinics Listing `/clinics`

### 3.1 `src/app/(marketing)/clinics/page.tsx` (Server Component)
`metadata` (`title: "Clinics & Medical Centers | HelixHealth"`). Renders a hero band (reuse the
gradient + heading style from `doctor-search.tsx` top) then `<ClinicSearch/>`.

### 3.2 `src/app/(marketing)/clinics/loading.tsx`
Skeleton grid of clinic-card placeholders (dashed-border placeholder style).

### 3.3 `src/components/sections/clinics/clinic-card.tsx`
Summary card (pattern: `DoctorCard`): name → `/clinics/[slug]`, `ClinicBadge`, `StarRating`,
governorate/city, top 2–3 specialty badges, branch count, `OpenNowPill`, "View clinic" +
"Book appointment" CTAs.

### 3.4 `src/components/sections/clinics/clinic-search.tsx` (`"use client"`)
State + `useMemo` filtering over `CLINICS` (model on `doctor-search.tsx`):
- Filters: **search** (name/specialty), **Governorate**, **City**, **Area**, **Clinic Type**,
  **Rating**, **Insurance**, **Open Now** toggle. Desktop sticky sidebar; mobile bottom-sheet
  drawer (reuse the drawer markup). Use the extracted `FilterGroup/Radio/Toggle`.
- Sort: rating / most branches / name.
- **AI Recommended** rail (top of results, `recommendClinics({limit:4})`).
- **Featured Clinics** rail (`featured===true`).
- **Pagination** (client, page size 6) or load-more.
- **Empty state** + reuse loading via `loading.tsx`.
- **Map toggle** button in results header → swaps grid for a `MapPlaceholder` list (future-ready).
- Reflect key filters in the URL query (`useSearchParams` + `window.history.pushState`) per the
  project's `linking-and-navigating.md`.

**Phase 3 done when:** `/clinics` browses, filters/sort/pagination/empty all work, responsive.

---

## PHASE 4 — Clinic Details + Branch pages

### 4.1 `src/app/(marketing)/clinics/[clinicSlug]/page.tsx` (SSG)
`generateStaticParams` over `CLINICS`; `generateMetadata` + `getClinic` + `notFound()`.
Layout (reuse `Card`, `Container`, sticky aside like the doctor profile):
- **Cover** band + **`ClinicGallery`**.
- Identity: name, `ClinicBadge`, `StarRating`, verified.
- **Description**, **Facilities** (`FacilityBadge` grid), **Available Services** (badge grid).
- **Doctors Working There** — `DoctorAvailabilityCard` list, filterable by branch.
- **Working Hours** (`WorkingHoursCard`), **Location Map** (`MapPlaceholder`) + **Branches**
  (`BranchCard` list → branch pages).
- **Insurance Accepted** (`InsuranceBadge` list), **Ratings & Reviews** (reuse doctor profile
  review block), **Related Clinics** rail (`getRelatedClinics`).
- Sticky **Book Appointment CTA** → `/book?clinic=[slug]`.

### 4.2 `src/app/(marketing)/clinics/[clinicSlug]/branches/[branchSlug]/page.tsx` (SSG)
`generateStaticParams` over branch combos; `getBranch` + `notFound()`. Breadcrumb Clinic → Branch.
Shows: Address, `MapPlaceholder`, `WorkingHoursCard`, Doctors at this branch
(`DoctorAvailabilityCard` with that branch's slots), Parking, Accessibility, Phone, Directions,
**Book Appointment** → `/book?clinic=[clinicSlug]&branch=[branchSlug]`.

### 4.3 New section components (`src/components/sections/clinics/`)
`clinic-gallery.tsx`, `working-hours-card.tsx`, `directions-card.tsx`, `branch-card.tsx`,
`doctor-availability-card.tsx`, `clinic-statistics.tsx`, `related-clinics.tsx`,
`branch-selector.tsx` (`"use client"`; segmented control desktop / bottom-sheet mobile).

**Phase 4 done when:** every clinic + branch page renders (SSG), bogus slugs `notFound`, responsive.

---

## PHASE 5 — Booking wizard (redesign)

### 5.1 `src/app/(marketing)/book/page.tsx` (Server shell) + `BookingWizard` (`"use client"`)
Query-driven: `?doctor=&clinic=&branch=&date=&time=`. Steps: **Doctor → Clinic → Branch → Date →
Time → Confirm**. Pre-fill from query and **auto-skip** any step with a single option (render it
as a confirmed summary chip). Final step = the confirmation UI adapted from the current
`book/[slug]/page.tsx` (doctor summary, details, reason textarea, Confirm button).
Components in `src/components/sections/booking/`: `booking-wizard.tsx`, `booking-stepper.tsx`,
`steps/{clinic,branch,date,slot,summary}.tsx`, `appointment-cta.tsx`.
Slots come from `getScheduleForDoctorAtBranch`.

### 5.2 Redirect old route
Replace `src/app/(marketing)/book/[slug]/page.tsx` body with a redirect to
`/book?doctor=[slug]` (use `redirect()` from `next/navigation`). Keep `generateStaticParams` if
needed, or convert to a simple dynamic redirect. This preserves all existing "Book now" links.

**Phase 5 done when:** wizard works from `/book?doctor=…`, `/book?clinic=…`, `/book?branch=…`;
single-option steps auto-skip; old `/book/[slug]` redirects; nothing 404s.

---

## PHASE 6 — Update existing doctor surfaces

- `doctor-card.tsx`: add the doctor's **primary clinic** name + branch count; keep "Book now"
  (now lands in the wizard via the `/book/[slug]`→`/book?doctor=` redirect).
- `doctor-search.tsx`: add **Governorate** + **Insurance** filter groups (derive options from the
  doctor's clinics via `getClinicsForDoctor`).
- `doctors/[slug]/page.tsx`: add blocks — **Primary Clinic**, **Other Clinics**,
  **`BranchSelector`**, **schedule per branch**, **"Book at this clinic"** (→ wizard with
  clinic/branch), clinic info + directions. The existing `BookingWidget` becomes branch-aware:
  pick clinic→branch, then day/slot from `getScheduleForDoctorAtBranch`.

**Phase 6 done when:** doctor pages show clinic/branch info and book into the wizard; doctor search
still works with the new filters.

---

## PHASE 7 — Homepage + patient dashboard

- **Home** (`src/app/(marketing)/page.tsx`): add ONE `FeaturedClinics` rail after `Services`
  (horizontal scroll of `ClinicCard`, heading + "View all clinics →" → `/clinics`). Optionally
  add a **Doctors / Clinics toggle** to the left half of the existing `booking-search.tsx`.
  Keep it uncrowded — no other new home sections.
- **Patient dashboard appointments** (`src/lib/dashboard-data.ts` +
  `src/components/sections/dashboard/appointments-list.tsx`): add `facilityId`/`branchId` to
  appointment data and show **clinic + branch + address** on each row.

**Phase 7 done when:** home shows one clinics rail; dashboard appointments show clinic/branch.

---

## PHASE 8 — AI recommendations + Global Search

- **AI**: extend `ChatMessage` in `src/lib/assistant-data.ts` with optional
  `recommendations?: { doctorSlugs?: string[]; clinicSlugs?: string[] }`. In a couple of
  `CANNED_REPLIES`, attach clinic/doctor recommendations (e.g. the headache/knee intents →
  relevant specialty doctors + `recommendClinics`). Render them in `assistant-chat.tsx` as inline
  `DoctorCard`/`ClinicCard` chips below the bubble (same slot as suggestion chips).
- **Global Search**: `src/components/sections/search/global-search.tsx` (`"use client"`) — overlay
  (button in navbar + `Cmd/Ctrl-K`) returning grouped results: Doctors, Clinics & Centers,
  Specialties, Cities/Areas — each capped with "See all" deep-links into the relevant listing
  with query filters. Pure client filtering over the mock arrays.

**Phase 8 done when:** assistant can surface clinic/doctor cards; global search returns grouped
multi-entity results and deep-links correctly.

---

## Folder structure (target)
```
src/app/(marketing)/clinics/page.tsx
src/app/(marketing)/clinics/loading.tsx
src/app/(marketing)/clinics/[clinicSlug]/page.tsx
src/app/(marketing)/clinics/[clinicSlug]/branches/[branchSlug]/page.tsx
src/app/(marketing)/book/page.tsx                      # new wizard
src/app/(marketing)/book/[slug]/page.tsx               # → redirect to /book?doctor=

src/components/ui/{clinic-badge,facility-badge,insurance-badge,open-now-pill,map-placeholder}.tsx
src/components/sections/search/{filters,global-search}.tsx
src/components/sections/clinics/{clinic-search,clinic-card,branch-card,clinic-gallery,
  working-hours-card,directions-card,branch-selector,doctor-availability-card,
  clinic-statistics,related-clinics,featured-clinics}.tsx
src/components/sections/booking/{booking-wizard,booking-stepper,appointment-cta}.tsx
src/components/sections/booking/steps/{clinic,branch,date,slot,summary}.tsx

src/lib/clinics.ts                                     # new
src/lib/booking.ts                                     # optional wizard helpers/AppointmentDraft
src/lib/doctors.ts                                     # extended
src/lib/site-data.ts                                   # extended (NAV_LINKS, CITIES, AREAS)
```

---

## Acceptance Criteria (reviewer checklist)

**Build/lint** — `npm run build` and `npm run lint` and `npx tsc --noEmit` all clean; SSG
prerenders all clinic + branch pages via `generateStaticParams`.

**Data** — `MedicalFacility`/`Branch`/schedules are ID-linked; UI reads only via selectors
(`getClinic`, `getBranch`, `getScheduleForDoctorAtBranch`, `recommendClinics`, …); no
`Date.now()`/`new Date()` at module top level; existing doctor slugs are referenced correctly.

**Navigation** — "Clinics" appears after "Find Doctors" in `NAV_LINKS`; navbar active state works
for `/clinics/*`; nothing else in the bar broke.

**Pages** — `/clinics` (filters, sort, pagination, AI/Featured rails, map toggle, empty + loading),
`/clinics/[slug]`, `/clinics/[slug]/branches/[branch]` all render and `notFound()` on bad slugs.

**Booking** — wizard `Doctor→Clinic→Branch→Date→Time→Confirm` works from doctor, clinic, and
branch entry points; single-option steps auto-skip; old `/book/[slug]` redirects to
`/book?doctor=…`; existing "Book now" links still function.

**Existing surfaces** — doctor card/search/profile show clinic + branch info and book via the
wizard; home shows exactly one new `FeaturedClinics` rail; dashboard appointments show clinic/branch.

**AI + Search** — assistant can return clinic/doctor recommendation cards; global search returns
grouped Doctors/Clinics/Specialties/Cities results with working deep-links.

**Future-proofing** — adding a new `FacilityType` (e.g. `laboratory`) needs only data + a
badge/label-map entry, no new pages/components. **Conventions** — Server pages + `"use client"`
sections, reused primitives, no new deps, patient `(app)` and `provider/` portals untouched.

---

## Notes for the executing agent
- Ship phase by phase; keep the app working after each phase.
- Match comment density and naming of neighboring files; keep components small.
- If this spec conflicts with an actual repo convention you discover, follow the repo and leave a
  short code comment noting the deviation.
- Do not add tests (project has none) unless asked. Do not commit/push.
```
