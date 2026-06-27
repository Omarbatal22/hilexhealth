# Implementation Plan — Doctor (Provider) Portal

> **Audience:** the Antigravity coding agent. Execute this end-to-end. It is self-contained;
> you should not need any external context beyond the repo itself.
>
> **After you finish**, another reviewer will check your work against the **Acceptance
> Criteria** at the bottom. Make all of them pass, including `npm run build` and `npm run lint`.

---

## 0. Ground rules (read first)

- **Repo:** Next.js 16 (App Router) + React 19 + Tailwind v4. TypeScript. No database, no real
  auth — **all data is mock data in typed const arrays under `src/lib/*.ts`**. Keep it that way.
- **AGENTS.md note:** this Next.js version may differ from training data. Before writing routing
  code, skim `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`.
  Do **not** add speculative APIs like `unstable_instant` — they are doc decoys; ignore them.
- **Do NOT modify the patient side.** The patient experience lives in `src/app/(app)/` and its
  components — leave it untouched except for the single optional footer link in §6.
- **Match the existing style exactly.** Reuse the existing UI primitives, design tokens, and the
  Server-Component-page / `"use client"`-section-component split. Do not introduce new libraries.
- **Actions are non-persistent.** Buttons like Cancel / Send / Save are UI affordances only,
  consistent with the current patient side (no backend writes).

### Reference files to mirror (read these before coding)
| Purpose | File |
|---|---|
| App shell layout | `src/app/(app)/layout.tsx` |
| Sidebar (active state, mobile drawer) | `src/components/app/app-sidebar.tsx` |
| Page chrome helpers | `src/components/app/page-heading.tsx` (`AppPage`, `PageHeading`) |
| Server page + metadata + delegate to client section | `src/app/(app)/dashboard/appointments/page.tsx` |
| Stateful client section w/ tabs | `src/components/sections/dashboard/appointments-list.tsx` |
| Dashboard composition (stats tiles, 2-col) | `src/app/(app)/dashboard/page.tsx` |
| Dynamic `[slug]` route (awaited params, generateStaticParams) | `src/app/(marketing)/doctors/[slug]/page.tsx` |
| Mock data shapes/conventions | `src/lib/dashboard-data.ts`, `src/lib/doctors.ts` |
| Primitives | `src/components/ui/{card,badge,button,avatar,reveal,star-rating}.tsx` |
| `cn` helper | `src/lib/utils.ts` |

### Design tokens available (from `globals.css`) — use these, do not hardcode hex unless the existing code does
`navy`, `ink-soft`, `ink-muted`, `border-soft`, `surface`, `soft-bg`, `primary`, `primary-light`,
`primary-bg`, `primary-soft`, `ai`, `ai-light`, `teal`, `cyan`, `coral`, `success`, `warning`,
`error`; radius `--radius-card`; shadows `--shadow-soft`, `--shadow-medium`, `--shadow-floating`.
Fonts: `font-display` for headings.

---

## 1. Routing decision

Next.js strips parenthesized route-group names (e.g. `(app)`) from the URL. To get real
`/provider/...` URLs, create a **literal `src/app/provider/` segment** with its own
`layout.tsx`. Do **not** wrap it in a parenthesized group. The patient `(app)` group is separate
and untouched.

Routes to produce:
- `/provider/dashboard`
- `/provider/patients`
- `/provider/patients/[slug]`
- `/provider/schedule`
- `/provider/messages`
- `/provider/settings`

---

## 2. Data — extend `src/lib/dashboard-data.ts`

Append a clearly-commented **"Provider"** section at the end of `src/lib/dashboard-data.ts`.
**Reuse** the existing exported types where noted: `AppNavItem`, `Medication`, `RecordEntry`.
Add new imports at the top of the file as needed (icons from `lucide-react`, `getDoctor` from
`./doctors`).

```ts
/* ===================================================================== */
/* ============================ PROVIDER ============================== */
/* ===================================================================== */
// Doctor-facing portal data. Mock-only, mirrors the patient-side shape.

import { getDoctor } from "@/lib/doctors";
// add to the existing lucide-react import: Users, CalendarDays, MessageSquare, ClipboardList,
// Stethoscope, Phone, Mail, CheckCircle2, Clock, FileText (dedupe with what's already imported)

/** The signed-in clinician (reuse a real doctor record). */
const _provider = getDoctor("sarah-johnson")!;
export const PROVIDER = {
  slug: _provider.slug,
  name: _provider.name,            // "Dr. Sarah Johnson"
  specialty: _provider.specialty,  // "Cardiology"
  title: _provider.title,
  location: _provider.location,
  rating: _provider.rating,
  reviewCount: _provider.reviewCount,
};

/* ---------------- Provider navigation ---------------- */
export const PROVIDER_NAV: AppNavItem[] = [
  { label: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
  { label: "Patients", href: "/provider/patients", icon: Users },
  { label: "Schedule", href: "/provider/schedule", icon: CalendarDays },
  { label: "Messages", href: "/provider/messages", icon: MessageSquare },
  { label: "Settings", href: "/provider/settings", icon: Settings },
];

/* ---------------- Patient roster ---------------- */
export type PatientStatus = "Active" | "Needs review" | "Stable" | "New";

export interface RosterVital {
  label: string;
  value: string;
  unit: string;
  icon: LucideIcon;
  tile: string; // tailwind bg-* class, same idea as HEALTH_STATS.tile
}

export interface RosterPatient {
  id: string;            // slug used in the URL
  name: string;
  age: number;
  gender: "Female" | "Male" | "Other";
  primaryCondition: string;
  status: PatientStatus;
  lastVisit: string;     // "Jun 12, 2026"
  nextVisit: string;     // "Jul 3, 2026" or "—"
  mode: "In-person" | "Video visit";
  phone: string;
  email: string;
  notes: string;
  vitals: RosterVital[];
  medications: Medication[];   // reuse existing Medication type
  records: RecordEntry[];      // reuse existing RecordEntry type
}
```

Create `PATIENT_ROSTER: RosterPatient[]` with **8 patients**. Use realistic, varied values.
**Include "Alex Morgan"** (the existing `PATIENT`) as one entry with id `"alex-morgan"` so the two
sides cross-reference. Suggested roster (fill `vitals` with 2–4 tiles each reusing icons like
`HeartPulse`, `Activity`, `Droplet`, `Moon`; `medications` 1–3 each from realistic drug names;
`records` 2–4 each reusing the `RecordEntry` shape and `type` union already defined):

| id | name | age | gender | primaryCondition | status | lastVisit | nextVisit | mode |
|---|---|---|---|---|---|---|---|---|
| alex-morgan | Alex Morgan | 41 | Male | Hyperlipidemia | Active | Jun 12, 2026 | Jul 3, 2026 | In-person |
| maria-garcia | Maria Garcia | 58 | Female | Hypertension | Needs review | Jun 20, 2026 | Jun 30, 2026 | In-person |
| james-okafor | James Okafor | 34 | Male | Asthma | Stable | May 28, 2026 | Aug 14, 2026 | Video visit |
| linda-tran | Linda Tran | 67 | Female | Type 2 Diabetes | Needs review | Jun 22, 2026 | Jun 29, 2026 | In-person |
| noah-bennett | Noah Bennett | 29 | Male | Anxiety | Active | Jun 18, 2026 | Jul 9, 2026 | Video visit |
| sofia-rossi | Sofia Rossi | 45 | Female | Migraine | Stable | Apr 30, 2026 | — | Video visit |
| daniel-cohen | Daniel Cohen | 52 | Male | Atrial Fibrillation | Active | Jun 24, 2026 | Jul 1, 2026 | In-person |
| emma-wilson | Emma Wilson | 23 | Female | Annual Checkup | New | Jun 25, 2026 | Jul 11, 2026 | In-person |

```ts
export function getRosterPatient(id: string): RosterPatient | undefined {
  return PATIENT_ROSTER.find((p) => p.id === id);
}
```

```ts
/* ---------------- Schedule ---------------- */
export interface ScheduleVisit {
  patientId: string;
  patientName: string;
  time: string;     // "9:00 AM"
  date: string;     // "Jun 27, 2026"
  reason: string;   // "Follow-up · BP check"
  mode: "In-person" | "Video visit";
  status: "Confirmed" | "Pending" | "Checked in" | "Completed";
}
export const TODAY_VISITS: ScheduleVisit[]   = [ /* 4–5 entries dated Jun 27, 2026 */ ];
export const UPCOMING_VISITS: ScheduleVisit[] = [ /* 4–6 future entries */ ];
export const PAST_VISITS: ScheduleVisit[]     = [ /* 4–6 completed entries */ ];

/* ---------------- Messages ---------------- */
export interface Message {
  from: "patient" | "provider";
  body: string;
  time: string; // "10:24 AM"
}
export interface MessageThread {
  patientId: string;
  patientName: string;
  preview: string;     // last message snippet
  time: string;        // "10:24 AM" / "Yesterday"
  unread: number;
  messages: Message[]; // full conversation, 3–6 bubbles
}
export const PROVIDER_MESSAGES: MessageThread[] = [ /* 5 threads referencing roster patients */ ];

/* ---------------- Tasks ---------------- */
export interface ProviderTask {
  label: string;
  patientName: string;
  due: string;       // "Today" / "Tomorrow"
  done: boolean;
  icon: LucideIcon;  // e.g. FileText, ClipboardList, Pill
}
export const PROVIDER_TASKS: ProviderTask[] = [ /* 4–6 tasks, mix of done/undone */ ];

/* ---------------- Dashboard stat tiles ---------------- */
// Same shape idea as HEALTH_STATS (label/value/unit/icon/tile).
export const PROVIDER_STATS = [
  { label: "Active patients", value: "8",  unit: "",     icon: Users,        tile: "bg-primary" },
  { label: "Today's visits",  value: "5",  unit: "",     icon: CalendarDays, tile: "bg-teal" },
  { label: "Unread messages", value: "3",  unit: "",     icon: MessageSquare,tile: "bg-ai" },
  { label: "Pending tasks",   value: "4",  unit: "",     icon: ClipboardList,tile: "bg-coral" },
] as const;
```

> Keep numbers internally consistent (e.g. "Active patients" = roster length, "Unread messages"
> = sum of `unread`, "Today's visits" = `TODAY_VISITS.length`, "Pending tasks" = undone task count).

---

## 3. Shell + sidebar

### `src/app/provider/layout.tsx` (Server Component)
Clone `src/app/(app)/layout.tsx` but render the provider sidebar:
```tsx
import { ProviderSidebar } from "@/components/provider/provider-sidebar";

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-soft-bg lg:flex-row">
      <ProviderSidebar />
      <div className="flex-1 lg:min-w-0">{children}</div>
    </div>
  );
}
```

### `src/components/provider/provider-sidebar.tsx` (`"use client"`)
Clone `src/components/app/app-sidebar.tsx` exactly, but:
- import and map `PROVIDER_NAV` instead of `APP_NAV`;
- the footer user-card shows `PROVIDER.name` and `PROVIDER.specialty` (instead of `PATIENT`);
- keep the `usePathname` active-state logic, desktop `<aside>`, and mobile drawer identical;
- logo still links to `/`.

---

## 4. Pages

All pages are **Server Components** with `export const metadata: Metadata` (title pattern
`"<Page> | HelixHealth"`). Wrap content in `AppPage` + `PageHeading` from
`@/components/app/page-heading` (except the dashboard, which uses its own header block like the
patient dashboard does). Delegate all interactivity to the client section components in §5.

1. **`src/app/provider/dashboard/page.tsx`** — model on `src/app/(app)/dashboard/page.tsx`:
   - Header: "Welcome back," + `PROVIDER.name.split(" ").slice(0,2).join(" ")` (keep the "Dr." ),
     with the search/notifications/avatar cluster on the right (reuse that markup).
   - `PROVIDER_STATS` tiles in a `Reveal` grid (reuse the tile markup from the patient dashboard).
   - Two-column grid `lg:grid-cols-[1.6fr_1fr]`:
     - Left: "Today's schedule" card listing `TODAY_VISITS` (avatar, patient name link to
       `/provider/patients/[id]`, reason, mode badge, time) + "Recent patients" mini-list.
     - Right: "Tasks" card (`PROVIDER_TASKS`, check/exclaim chip like the patient meds list) +
       an "Unread messages" promo card linking to `/provider/messages`.

2. **`src/app/provider/patients/page.tsx`** — `PageHeading` (title "Patients", subtitle e.g.
   "Search, filter, and open patient charts.") + `<PatientRoster />`.

3. **`src/app/provider/patients/[slug]/page.tsx`** — dynamic route:
   - `export async function generateStaticParams()` returning `PATIENT_ROSTER.map(p => ({ slug: p.id }))`.
   - `export const metadata` may be static, or use `generateMetadata` with awaited params.
   - Signature: `export default async function Page(props: PageProps<'/provider/patients/[slug]'>)`
     **or** `({ params }: { params: Promise<{ slug: string }> })`; `const { slug } = await params;`.
   - `const patient = getRosterPatient(slug); if (!patient) notFound();` (import `notFound` from `next/navigation`).
   - Header card: large `Avatar`, name, `Badge` for status, age/gender/condition, contact row
     (phone/email with icons), and action buttons "Message" (→ `/provider/messages`) and
     "Schedule" (→ `/provider/schedule`).
   - Below: `<PatientDetail patient={patient} />`.

4. **`src/app/provider/schedule/page.tsx`** — `PageHeading` ("Schedule") + `<ScheduleBoard />`.

5. **`src/app/provider/messages/page.tsx`** — `PageHeading` ("Messages") + `<MessagesPanel />`.

6. **`src/app/provider/settings/page.tsx`** — `PageHeading` ("Settings") + `<ProviderSettingsForm />`.

---

## 5. Section components (`src/components/sections/provider/`)

Add `"use client"` to any that hold state. Reuse `Card*`, `Badge`, `Button`, `Avatar`, `cn`,
lucide icons. Match spacing/rounding from the patient-side equivalents.

1. **`patient-roster.tsx`** (`"use client"`) — search `<input>` (filter by name/condition) +
   status filter chips ("All" + each `PatientStatus`), both driven by `useState`, filtering
   `PATIENT_ROSTER`. Render rows as cards (avatar, name → link to `/provider/patients/[id]`,
   condition, status `Badge`, last/next visit, mode). Mirror the tab/chip styling from
   `appointments-list.tsx`. Show an empty-state line when nothing matches.

2. **`patient-detail.tsx`** (`"use client"`) — receives `patient: RosterPatient`. Tabs
   **Overview / Records / Medications / Notes** using the same tab pattern as
   `appointments-list.tsx`:
   - Overview: vitals tiles (`patient.vitals`) + quick summary.
   - Records: list `patient.records` (reuse the timeline/record styling from
     `src/components/sections/dashboard/records-timeline.tsx` if helpful).
   - Medications: list `patient.medications` (taken/refill chips like the patient meds list).
   - Notes: render `patient.notes` in a card + a static "Add note" textarea + Button.

3. **`schedule-board.tsx`** (`"use client"`) — Today / Upcoming / Past tabs (reuse the
   `appointments-list.tsx` tab structure) over `TODAY_VISITS` / `UPCOMING_VISITS` / `PAST_VISITS`.
   Each row: avatar, patient name → chart link, reason, mode badge, time/date, status badge, and
   contextual buttons (Today: "Check in"/"Start visit"; Upcoming: "Reschedule"; Past: "View notes").

4. **`messages-panel.tsx`** (`"use client"`) — two-pane layout: left = thread list
   (`PROVIDER_MESSAGES`, avatar + name + preview + time + unread badge), right = selected
   conversation (bubbles from `thread.messages`, provider right-aligned / patient left-aligned)
   with a static composer (textarea + Send Button). `useState` for the selected thread; default to
   the first. On narrow screens, stack (list, then conversation).

5. **`provider-settings-form.tsx`** (`"use client"` if it has controlled inputs, else static) —
   model on `src/components/sections/dashboard/settings-form.tsx`. Sections: Profile
   (name/specialty/email prefilled from `PROVIDER`), Availability (toggles for video visits,
   accepting new patients), Notifications. Static Save button.

---

## 6. Cross-link (single allowed patient-side touch)

Add a discreet provider entry point so the portal is reachable from the marketing site. In
`src/components/sections/footer.tsx`, add a link "For providers" → `/provider/dashboard` in an
appropriate footer column. Do not alter patient navigation elsewhere. (Direct URL must also work.)

---

## 7. Acceptance criteria (the reviewer will check these)

**Build & lint**
- [ ] `npm run build` completes with no type errors; `/provider/patients/[slug]` is prerendered
      via `generateStaticParams` (8 pages).
- [ ] `npm run lint` passes (no new warnings/errors).

**Routing & structure**
- [ ] `src/app/provider/` is a literal segment (no parentheses); patient `(app)` group is unchanged.
- [ ] All six routes render: dashboard, patients, patients/[slug], schedule, messages, settings.
- [ ] Dynamic page awaits `params`, calls `getRosterPatient`, and renders `notFound()` for an
      unknown slug (verify by visiting `/provider/patients/does-not-exist`).

**Conventions**
- [ ] Pages are Server Components with `metadata`; only stateful sections use `"use client"`.
- [ ] Reuses `Card/Badge/Button/Avatar/Reveal`, `cn`, design tokens, `lucide-react` — no new deps.
- [ ] Reuses types `AppNavItem`, `Medication`, `RecordEntry`; new provider data lives in
      `src/lib/dashboard-data.ts`; `PROVIDER` derives from `getDoctor("sarah-johnson")`.

**Behavior (via `npm run dev`)**
- [ ] Sidebar shows correct active item per route; mobile drawer opens/closes.
- [ ] Patient roster search + status filter narrow the list; empty state shows when no match.
- [ ] Patient detail tabs switch (Overview/Records/Medications/Notes).
- [ ] Schedule tabs swap Today/Upcoming/Past.
- [ ] Messages: selecting a thread updates the conversation pane; default thread selected on load.
- [ ] Footer "For providers" link navigates to `/provider/dashboard`.
- [ ] Layout is responsive at mobile widths (sidebar → top bar + drawer).

**Data sanity**
- [ ] Dashboard stat numbers are consistent with the underlying arrays.
- [ ] "Alex Morgan" appears in the roster with id `alex-morgan`.

---

## 8. Notes for the executing agent
- Keep components small and readable; match the comment density of neighboring files.
- Do not add tests (the project has none) unless asked.
- Do not run `git commit`/`push`.
- If something in this spec conflicts with an actual repo convention you discover, follow the repo
  convention and leave a brief code comment noting the deviation.
