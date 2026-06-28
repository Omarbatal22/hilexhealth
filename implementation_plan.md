# Helix Health AI — Complete Frontend Implementation

Build all 6 screens of the Helix Health AI suite using the "Calm Clinical Glassmorphism" design system defined in [design.md](file:///D:/Graduation%20Project/design.md), on the existing Vite + React + TypeScript + Tailwind stack.

## Current State

- **Scaffold:** Fresh Vite React-TS project with Tailwind 3 already configured with the Helix color tokens, fonts, keyframes, and animations in [tailwind.config.js](file:///D:/Graduation%20Project/healthcare-system/frontend/tailwind.config.js).
- **Dependencies already installed:** `react-router-dom`, `lucide-react`, `recharts`, `react-hook-form`, `@hookform/resolvers`, `zod`, `@reduxjs/toolkit`, `react-redux`, `axios`.
- **No application code yet** — App.tsx is the Vite starter template.

---

## User Review Required

> [!IMPORTANT]
> **Tailwind vs Vanilla CSS:** The project already has Tailwind 3 configured with all design tokens. I will use Tailwind utility classes for styling (since the project was set up for it), augmented with a small `theme.css` for CSS custom properties, glass-panel recipes, and ECG keyframe animations that aren't expressible in Tailwind alone. Let me know if you prefer a different approach.

> [!IMPORTANT]
> **Mock data only:** Since there's no backend API yet, all screens will use realistic mock/demo data (patients, appointments, chat messages, vitals). The architecture will use clean service abstractions so swapping to real API calls later is trivial.

> [!IMPORTANT]
> **Redux scope:** I'll set up the Redux store with slices for `auth` (login state, role) and `ui` (sidebar, toasts). Individual page data will use local state + React Query-style patterns for now, easily migratable to RTK Query when the backend is ready.

---

## Open Questions

> [!NOTE]
> **Authentication flow:** Should the login actually integrate with any backend endpoint, or is a fully mocked client-side role switch (Doctor/Patient) sufficient for now?

> [!NOTE]
> **Responsive breakpoints:** The design describes a desktop-first experience. Should I also build full mobile-responsive layouts, or is desktop-primary with basic tablet support sufficient for this phase?

---

## Proposed Changes

### Phase 1 — Foundation Layer

Sets up the design system infrastructure that all screens depend on.

---

#### [MODIFY] [index.html](file:///D:/Graduation%20Project/healthcare-system/frontend/index.html)
- Add Google Fonts preconnect + stylesheet links for **Space Grotesk**, **Inter**, and **IBM Plex Mono**
- Update `<title>` to "Helix Health AI"
- Add meta description for SEO

#### [NEW] `src/styles/theme.css`
- CSS custom properties from design.md Section 8 (all color/glass/shadow/radius tokens)
- `.glass-panel` base recipe with backdrop-filter, border, inset highlight
- ECG animation keyframes (`ecg-dash`, `ecg-pulse`)
- Aurora mesh background utility class
- `prefers-reduced-motion` overrides
- Scrollbar styling for dark theme

#### [MODIFY] [index.css](file:///D:/Graduation%20Project/healthcare-system/frontend/src/index.css)
- Replace Vite boilerplate with Tailwind directives (`@tailwind base/components/utilities`)
- Import `theme.css`
- Global resets (box-sizing, body background, font smoothing)

#### [DELETE] [App.css](file:///D:/Graduation%20Project/healthcare-system/frontend/src/App.css)
- Remove Vite starter styles (no longer needed)

---

### Phase 2 — Shared Components

Reusable UI primitives used across multiple screens.

---

#### [NEW] `src/components/ui/GlassCard.tsx`
- Glass panel wrapper with configurable padding, radius, hover glow

#### [NEW] `src/components/ui/Button.tsx`
- Primary (teal fill + glow), Ghost (transparent + border), and Danger variants
- 44px min-height touch target, loading state with ECG spinner

#### [NEW] `src/components/ui/UrgencyBadge.tsx`
- Pill badge mapping urgency level → color + icon + label
- Uses `lucide-react` icons (Leaf, Info, Clock, AlertTriangle, Siren)

#### [NEW] `src/components/ui/Input.tsx`
- Dark input with glass border, focus ring, error state (rose border + helper text)
- Integrates with `react-hook-form`

#### [NEW] `src/components/ui/EcgLine.tsx`
- SVG ECG waveform with stroke-dasharray animation
- Variants: divider (thin), hero (large faint), loading (pulse), thinking (small blip)

#### [NEW] `src/components/ui/AuroraBackground.tsx`
- Two soft radial gradients (teal + deep green) with drift animation
- Respects `prefers-reduced-motion`

#### [NEW] `src/components/ui/Toast.tsx`
- Glass popup, top-right positioned, colored left border by type
- Auto-dismiss with progress bar

#### [NEW] `src/components/ui/Skeleton.tsx`
- Shimmer loader matching component dimensions

#### [NEW] `src/components/ui/Avatar.tsx`
- Circle avatar with initials fallback and status dot

---

### Phase 3 — Layout Components

---

#### [NEW] `src/components/layout/Sidebar.tsx`
- `--bg-700` sidebar with nav items, active ECG-tick accent bar
- Role-aware navigation (different items for Doctor vs Patient)
- Helix logo + branding at top

#### [NEW] `src/components/layout/AppLayout.tsx`
- Sidebar + main content area + aurora background
- Outlet for React Router nested routes

#### [NEW] `src/components/layout/AuthLayout.tsx`
- Split-screen layout for login (left: branding/ECG hero, right: form card)

---

### Phase 4 — Pages (6 Screens)

---

#### [NEW] `src/pages/LoginPage.tsx`
- Split layout: left panel with large ECG hero animation + Helix branding, right panel with glass form card
- Role toggle (Doctor/Patient) as segmented control
- Email + password inputs with validation
- "Sign In" primary button with loading state
- Animated heartbeat motif in background

#### [NEW] `src/pages/PatientDashboard.tsx`
- Welcome header with patient name + greeting
- Glass cards: Upcoming Appointments, Recent AI Recommendations, Health Summary
- Primary CTA: "Start AI Triage" button with glow
- Quick stats row (next appointment, active prescriptions, etc.)

#### [NEW] `src/pages/TriageChatPage.tsx`
- Full chat interface with message thread
- AI bubbles (glass, left-aligned) and user bubbles (brand-deep, right-aligned)
- ECG "thinking" indicator when AI is processing
- Urgency badge appears on triage result message
- Message input bar at bottom with send button

#### [NEW] `src/pages/AppointmentBookingPage.tsx`
- Weekly calendar grid showing available time slots
- Date navigation (prev/next week)
- Doctor selection dropdown
- Glass confirmation modal on slot selection
- Appointment summary card after booking

#### [NEW] `src/pages/DoctorDashboard.tsx`
- Patient queue table sorted by urgency (color-coded rows)
- Urgency distribution summary cards
- Trend area chart (using Recharts) showing urgency trends over time
- Quick actions per patient (View, Start Consult)
- Today's schedule sidebar panel

#### [NEW] `src/pages/SymptomLoggerPage.tsx`
- Clinical form with sections: Primary Symptoms, Severity Scale, Duration, Additional Notes
- Zod schema validation with visible error states (rose border + helper text)
- Body region selector (visual or dropdown)
- Form submission with success toast

---

### Phase 5 — Routing & State

---

#### [MODIFY] [App.tsx](file:///D:/Graduation%20Project/healthcare-system/frontend/src/App.tsx)
- Replace Vite starter with React Router setup
- Define routes: `/login`, `/patient/*`, `/doctor/*`
- Protected route wrapper (checks auth state)

#### [MODIFY] [main.tsx](file:///D:/Graduation%20Project/healthcare-system/frontend/src/main.tsx)
- Wrap app in `BrowserRouter` and Redux `Provider`

#### [NEW] `src/store/index.ts`
- Redux store configuration

#### [NEW] `src/store/authSlice.ts`
- Auth state: user, role (doctor/patient), isAuthenticated
- Login/logout actions

#### [NEW] `src/data/mockData.ts`
- Comprehensive mock data: patients, appointments, chat messages, doctor profiles, symptoms

#### [NEW] `src/types/index.ts`
- TypeScript interfaces: User, Patient, Doctor, Appointment, ChatMessage, UrgencyLevel, Symptom

---

## File Structure (Final)

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── Sidebar.tsx
│   └── ui/
│       ├── AuroraBackground.tsx
│       ├── Avatar.tsx
│       ├── Button.tsx
│       ├── EcgLine.tsx
│       ├── GlassCard.tsx
│       ├── Input.tsx
│       ├── Skeleton.tsx
│       ├── Toast.tsx
│       └── UrgencyBadge.tsx
├── data/
│   └── mockData.ts
├── pages/
│   ├── AppointmentBookingPage.tsx
│   ├── DoctorDashboard.tsx
│   ├── LoginPage.tsx
│   ├── PatientDashboard.tsx
│   ├── SymptomLoggerPage.tsx
│   └── TriageChatPage.tsx
├── store/
│   ├── authSlice.ts
│   └── index.ts
├── styles/
│   └── theme.css
├── types/
│   └── index.ts
├── App.tsx
├── index.css
└── main.tsx
```

---

## Verification Plan

### Automated Tests
```bash
cd D:\Graduation Project\healthcare-system\frontend
npm run build
```
- TypeScript compilation must pass with zero errors
- Vite build must produce a valid bundle

### Manual Verification
- Run `npm run dev` and visually inspect all 6 screens in the browser
- Verify navigation between pages via sidebar
- Verify role switching on login (Doctor → Doctor Dashboard, Patient → Patient Dashboard)
- Check urgency badges render with correct color + icon + label
- Confirm ECG animations play and respect `prefers-reduced-motion`
- Test form validation on Symptom Logger (trigger error states)
- Verify Recharts trend chart renders on Doctor Dashboard
- Check glassmorphism effects (blur, borders, inset highlight) are visible
- Confirm responsive behavior at different viewport widths
