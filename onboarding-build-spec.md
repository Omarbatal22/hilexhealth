# Build Spec — Smart Registration & Onboarding (for Antigravity)

> **Audience:** the Antigravity coding agent. Execute end-to-end, **phase by phase**.
> Replaces the single-step sign-up with a premium multi-step onboarding flow (Stripe/Notion/
> Linear/Airbnb feel) — **without changing the HelixHealth design language** (Medical Blue
> palette, existing primitives, soft shadows, rounded corners, subtle motion).
>
> After **every phase**: `npm run build`, `npm run lint`, `npx tsc --noEmit` must be clean; the
> app must render. Do not commit or push.

---

## 0. Ground rules

- **Stack:** Next.js 16 App Router + React 19 + Tailwind v4 (`@theme` tokens in `globals.css`) +
  TypeScript. **No backend** — all state is client-side; "submit" navigates, uploads are UI-only
  (no real file storage), social auth buttons are visual (no OAuth).
- **AGENTS.md:** skim `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
  before routing work. Ignore doc "decoy" APIs (e.g. `unstable_instant`).
- **Reuse existing primitives:** `Button`, `Input` (has `icon` prop + supports `pr-12` for the
  show/hide affordance), `Card`, `Badge`, `cn`, `lucide-react`, framer-motion (already a dep),
  design tokens. **No new dependencies.**
- **Reuse existing data:** `GOVERNORATES`, `CITIES`, `AREAS` (`src/lib/site-data.ts`),
  `SPECIALTIES` (`src/lib/doctors.ts`). Add only what's missing (blood types, genders, etc.).
- **Don't break** `/login`, the patient `(app)` dashboard, or `provider/`. Keep `/login` working;
  only `/signup` is redesigned.

### Files you are replacing/extending
- `src/components/sections/auth/auth-form.tsx` — current single-step form. **Keep it for `/login`**
  (the login page still uses `<AuthForm mode="login" />`). The signup path moves to the new flow.
- `src/components/sections/auth/auth-shell.tsx` — split brand panel + form panel; **form panel
  caps at `max-w-md` (384px)** — too narrow for multi-section forms. You'll add a `wide` variant.
- `src/app/(auth)/signup/page.tsx` — becomes the onboarding host.

---

## 1. Architecture & routing

**Single client state machine, autosaved.** One `OnboardingFlow` client component owns:
`role`, `step`, and a `formData` object, persisted to `localStorage` (autosave) and restored on
mount. Steps are an **ordered array per role**; a progress indicator reflects position. Use
framer-motion for step transitions (fade/slide, honoring reduced-motion via the existing `Reveal`
conventions).

**Routes (all in the `(auth)` group):**
| Route | Purpose |
|---|---|
| `/signup` | Role chooser → role-specific wizard → submit |
| `/login` | Unchanged (existing `AuthForm`) |
| `/welcome` | Patient post-registration: AI welcome + 3–4 optional questions → `/dashboard` |
| `/verification-pending` | Doctor post-registration: "review in progress" |

**Do not** create per-step routes. Keep step state in the component; optionally reflect
`?role=&step=` in the URL via `history.replaceState` for shareable/back-button support (nice-to-have,
not required). Autosave is `localStorage`, not URL.

**Step order:**
- **Patient:** `role → basic → personal → medical(optional) → preferences → submit → /welcome`
- **Doctor:** `role → basic → personal → professional → verification → links(optional) → availability → submit → /verification-pending`

---

## 2. Data additions (`src/lib/onboarding-data.ts`, new)

Add typed consts + types (mock, reuse existing where possible):
```ts
export const GENDERS = ["Female", "Male", "Prefer not to say"] as const;
export const BLOOD_TYPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-","Unknown"] as const;
export const EXPERIENCE_RANGES = ["0–2 years","3–5 years","6–10 years","11–15 years","16+ years"] as const;

export interface OnboardingQuestion {   // patient AI welcome
  id: string; question: string; options: string[]; // single-select chips
}
export const PATIENT_ONBOARDING_QUESTIONS: OnboardingQuestion[]; // 4 items, e.g.:
// "What brings you to HelixHealth?" / "How often do you see a doctor?" /
// "Any conditions you're managing?" / "How can Helix AI help most?"

// Form data shape (single source for autosave + validation)
export interface OnboardingData {
  role?: "patient" | "doctor";
  // basic
  fullName?: string; email?: string; phone?: string; password?: string; confirmPassword?: string;
  // personal
  gender?: string; dob?: string; governorate?: string; city?: string; area?: string;
  // patient optional medical
  bloodType?: string; chronic?: string[]; allergies?: string[];
  // preferences
  prefReminders?: boolean; prefAiRecs?: boolean; prefUpdates?: boolean;
  // doctor professional
  specialty?: string; subspecialty?: string; experience?: string; clinic?: string;
  // doctor verification (file names only — no real upload)
  licenseNumber?: string; syndicateNumber?: string; licenseFile?: string; idFile?: string;
  // doctor links + availability
  linkedin?: string; website?: string; onlineConsults?: boolean;
}
export const ONBOARDING_STORAGE_KEY = "helix:onboarding";
```
Reuse `SPECIALTIES` for the specialty select; `GOVERNORATES`/`CITIES`/`AREAS` for location.
`chronic`/`allergies` = free-text "add chip" inputs (type + Enter → removable chips).

---

## 3. Components (`src/components/sections/auth/onboarding/`)

All `"use client"` where stateful.
- `onboarding-flow.tsx` — the state machine host: role, step array, `formData`, localStorage
  autosave/restore, transitions, progress, next/back, submit + redirect.
- `role-select.tsx` — **Step 1**: two large interactive `Card`s (Patient / Doctor) with icon
  illustration, description, hover lift (reuse `Card interactive` + the service-card hover style),
  and "Continue as …" CTA. Selecting a role advances the flow.
- `step-progress.tsx` — segmented progress indicator (e.g. dots/bars labeled per step) reflecting
  current step / total for the chosen role.
- `step-shell.tsx` — wraps each step: section title, helper text, the fields slot, and a sticky
  **Back / Continue** footer (mobile: full-width buttons). Continue is disabled until the step's
  required fields validate.
- **Step bodies** (each a focused section):
  - `step-basic.tsx` — Full name, Email, Phone, Password (+ strength + show/hide), Confirm password.
  - `step-personal.tsx` — Gender (segmented/select), Date of Birth (date input), Governorate, City, Area (dependent selects from site-data).
  - `step-medical.tsx` — Blood type (select), Chronic diseases (chip input), Allergies (chip input). **All optional** — a clear "Skip for now" affordance.
  - `step-preferences.tsx` — 3 checkboxes (reminders, AI recs, product updates).
  - `step-professional.tsx` — Specialty (from `SPECIALTIES`), Subspecialty, Years of experience (`EXPERIENCE_RANGES`), Clinic/Medical Center, Governorate, City.
  - `step-verification.tsx` — Medical License Number, Syndicate Number (optional), Upload Medical License, Upload National ID (file inputs styled as dropzones; store file name only).
  - `step-links.tsx` — LinkedIn, Personal Website (optional, URL validation).
  - `step-availability.tsx` — "Available for Online Consultations" toggle (reuse the toggle style from `provider-settings-form.tsx`).
- `social-auth.tsx` — "Continue with Google" (reuse existing `GoogleGlyph` from `auth-form.tsx` —
  extract it to a shared `src/components/brand/social-glyphs.tsx`), plus **Apple** (future-ready,
  visually present) and **Facebook** (optional). Buttons are visual only.
- `password-strength.tsx` — strength meter (0–4) from length/variety heuristics; colored bar +
  label (Weak→Strong) using existing status tokens (`error`/`warning`/`success`).
- `success-overlay.tsx` — success animation on submit (animated check, e.g. scale/draw) before redirect.
- `field.tsx` — small labeled-field wrapper (generalize the `Field` already in `auth-form.tsx`).
- `chip-input.tsx` — type-and-add removable chips (for chronic/allergies).

### Shell width fix
Add a `size`/`wide` prop to `AuthShell` (`auth-shell.tsx`) so the form panel can use a wider inner
cap for the multi-section wizard (e.g. `max-w-md` default → `max-w-xl`/`max-w-2xl` for onboarding).
Default unchanged so `/login` is unaffected. The brand panel/quote stays identical.

---

## 4. UX enhancements (all required)

| Feature | Implementation |
|---|---|
| Password strength | `password-strength.tsx` live meter under the password field |
| Show / hide password | Eye/EyeOff toggle (pattern already in `auth-form.tsx`), on both password + confirm |
| Step progress | `step-progress.tsx`, role-aware total |
| Smooth transitions | framer-motion step enter/exit (respect reduced-motion) |
| Inline validation | per-field, validate on blur + before Continue; show error text under the field; email/phone/URL/password-match rules |
| Autosave | debounced write of `formData` to `localStorage[ONBOARDING_STORAGE_KEY]`; restore on mount; clear on successful submit |
| Success animation | `success-overlay.tsx` before redirect |
| Mobile-first responsive | single column; sticky bottom Back/Continue; selects full-width; brand panel hidden < lg (as today) |

Validation rules (minimum): required fields per step block Continue; email format; phone non-empty;
password ≥ 8 chars; confirm === password; URLs (LinkedIn/website) valid if filled; doctor license
number required.

---

## 5. Post-registration

### 5.1 Patient — `/welcome`
`src/app/(auth)/welcome/page.tsx` (+ a `welcome-flow.tsx` client component). AI-styled welcome
(reuse the `ai-glow` + `Bot`/`Sparkles` styling from the assistant): heading
*"Welcome! I'm Helix AI. Let's personalize your healthcare experience."* Then present
`PATIENT_ONBOARDING_QUESTIONS` (4) one at a time as **optional** single-select chip questions with
a progress dot + **Skip**. On finish/skip → animated handoff → `router.push("/dashboard")`.

### 5.2 Doctor — `/verification-pending`
`src/app/(auth)/verification-pending/page.tsx` (server page). Calm, reassuring screen: status
badge ("Under review"), what happens next (review of license/ID, ETA copy), a checklist of
submitted items, and a "Back to home" / "Go to limited dashboard" CTA. Uses `AuthShell` or a
centered card; no form.

---

## 6. Wire-up

- `src/app/(auth)/signup/page.tsx` → renders `AuthShell size="wide"` wrapping `<OnboardingFlow/>`
  (metadata: "Create your account | HelixHealth").
- On final submit: clear autosave, show `success-overlay`, then redirect:
  patient → `/welcome`, doctor → `/verification-pending`.
- **Navbar/footer** unaffected. The marketing "Sign up" CTAs already point to `/signup` — they now
  land on the role chooser automatically.
- `/login` unchanged; ensure the extracted `GoogleGlyph`/`social-auth` still render there (or leave
  `auth-form.tsx`'s inline glyph and just import the shared one — keep login visually identical).

---

## 7. Phasing (ship each independently)

1. **Data + shell width** — `onboarding-data.ts`, `AuthShell` wide variant, extract social glyphs. (No visible change to `/login`.)
2. **Role select + flow scaffold** — `OnboardingFlow`, `role-select`, `step-progress`, `step-shell`, autosave/restore, transitions. `/signup` shows role chooser → empty steps.
3. **Patient steps** — basic/personal/medical/preferences + password strength + validation + chip input + social auth.
4. **Doctor steps** — professional/verification/links/availability (file dropzones UI-only).
5. **Submit + success + post-registration** — success overlay; `/welcome` (AI questions); `/verification-pending`.
6. **Polish + responsive pass** — mobile sticky footer, reduced-motion, inline-validation edge cases, empty/restore states.

---

## 8. Acceptance criteria (reviewer checklist)

**Build/quality** — `npm run build`, `npm run lint`, `npx tsc --noEmit` clean after each phase;
design language unchanged (Medical Blue, existing primitives, soft shadows, rounded corners).

**Flow** — `/signup` shows the **role chooser first** (two premium interactive cards); the form
only appears after a role is chosen; correct step order per role; progress indicator accurate;
Back/Continue work; transitions smooth and reduced-motion-safe.

**Patient** — basic/personal/optional-medical/preferences all present; medical fields are
skippable; submit → `/welcome` → 4 optional AI questions (skippable) → `/dashboard`.

**Doctor** — all patient basics + professional + verification (license #, syndicate optional, two
uploads as UI dropzones storing file names) + optional links + availability toggle; submit →
`/verification-pending`.

**UX** — password strength meter + show/hide on both password fields; inline validation blocks
invalid Continue; **autosave** persists across reload and restores; success animation on submit;
social buttons present (Google functional-looking, Apple/Facebook future-ready/visual); mobile-first.

**Data** — reuses `SPECIALTIES`, `GOVERNORATES`/`CITIES`/`AREAS`; new consts in
`onboarding-data.ts`; `OnboardingData` is the single autosave/validation shape.

**Non-breaking** — `/login` unchanged and still works; no new dependencies; `(app)`/`provider`
untouched; no real backend/upload/OAuth introduced.

---

## 9. Notes for the executing agent
- No backend: "submit" = clear autosave + redirect; uploads store file names only; social auth is visual.
- Match comment density and naming of neighboring files; keep step components small and focused.
- If a spec instruction conflicts with a real repo convention, follow the repo and leave a short
  code comment noting the deviation.
- Do not add tests unless asked. Do not commit/push.
```
