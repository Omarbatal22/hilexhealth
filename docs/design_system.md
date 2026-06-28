# Healthcare Assistance System - UI Design System
## Phase 1: Tokens, Component Specifications & Accessibility Rules

This design system establishes a cohesive, high-fidelity visual identity for the Healthcare Assistance System. It relies on a premium, dark glassmorphism theme, combining deep navy tones with vibrant medical green highlights.

---

## 1. Design Tokens

### 1.1 Color Palette

The color system is optimized for high-contrast dark environments. The primary background uses dark blue/navy values to prevent eye strain, highlighted by sterile, medical greens to direct user focus.

| Token Name | Hex Value | RGBA Equivalent | Purpose |
| :--- | :--- | :--- | :--- |
| `--bg-base` | `#050B14` | `rgba(5, 11, 20, 1.0)` | Application base background. |
| `--bg-surface` | `#0B1528` | `rgba(11, 21, 40, 1.0)` | Surface block container background. |
| `--glass-bg` | `#0A1C36` | `rgba(10, 28, 54, 0.45)` | Base background for glassmorphic elements. |
| `--glass-border` | `#FFFFFF` | `rgba(255, 255, 255, 0.08)`| Highlight borders of glass elements. |
| `--color-primary` | `#00FF9D` | `rgba(0, 255, 157, 1.0)` | Accent green for highlights and primary CTA. |
| `--color-secondary` | `#00D2FF` | `rgba(0, 210, 255, 1.0)` | Secondary actions, links, system information. |
| `--color-warning` | `#FFB800` | `rgba(255, 184, 0, 1.0)` | Triage warning alerts (Medium severity). |
| `--color-danger` | `#FF3B30` | `rgba(255, 59, 48, 1.0)` | Critical warning alerts (High severity/lockouts). |
| `--text-primary` | `#F5F7FA` | `rgba(245, 247, 250, 1.0)`| Main body text, high contrast headers. |
| `--text-secondary` | `#9EAEC4` | `rgba(158, 174, 196, 1.0)`| Auxiliary labels, secondary text. |
| `--text-muted` | `#5B6E85` | `rgba(91, 110, 133, 1.0)` | Disables, placeholders, time markings. |

### 1.2 Glassmorphic Structural Tokens
These variables establish the premium layering effect.

*   **Blur Values:**
    *   `--glass-blur-sm`: `backdrop-filter: blur(8px);`
    *   `--glass-blur-md`: `backdrop-filter: blur(16px);`
    *   `--glass-blur-lg`: `backdrop-filter: blur(32px);`
*   **Shadow Values:**
    *   `--glass-shadow`: `box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);`
    *   `--glass-shadow-focused`: `box-shadow: 0 8px 32px 0 rgba(0, 255, 157, 0.15);`

### 1.3 Typography Scale
*   **Font Family:** Primary: `'Outfit', sans-serif;` (Google Fonts); Monospace: `'JetBrains Mono', monospace;` (for code/IDs/timestamps).
*   **Sizes & Line Heights:**
    *   `--font-h1`: `2.25rem` (36px), Line-height: `1.2` (Page headings)
    *   `--font-h2`: `1.75rem` (28px), Line-height: `1.25` (Subsections)
    *   `--font-h3`: `1.375rem` (22px), Line-height: `1.3` (Widget titles)
    *   `--font-body`: `1.0rem` (16px), Line-height: `1.5` (Main readouts)
    *   `--font-small`: `0.875rem` (14px), Line-height: `1.4` (Subtext, labels)
    *   `--font-micro`: `0.75rem` (12px), Line-height: `1.3` (Time, system indicators)
*   **Font Weights:**
    *   `--weight-light`: `300`
    *   `--weight-normal`: `400`
    *   `--weight-medium`: `500`
    *   `--weight-semibold`: `600`
    *   `--weight-bold`: `700`

### 1.4 Spacing Scale
A consistent 8px grid system ensures mathematical alignment.
*   `--space-xxs`: `0.25rem` (4px)
*   `--space-xs`: `0.5rem` (8px)
*   `--space-sm`: `0.75rem` (12px)
*   `--space-md`: `1.0rem` (16px)
*   `--space-lg`: `1.5rem` (24px)
*   `--space-xl`: `2.0rem` (32px)
*   `--space-xxl`: `3.0rem` (48px)

### 1.5 Shape / Roundness Tokens
Glass UI requires rounded edges to maintain the organic "glass sheet" feeling.
*   `--radius-sm`: `6px` (Checkboxes, small tags)
*   `--radius-md`: `12px` (Buttons, input boxes)
*   `--radius-lg`: `16px` (Cards, charts panel)
*   `--radius-xl`: `24px` (Main modules, modal boxes)
*   `--radius-pill`: `9999px` (Status bubbles, profile badges)

---

## 2. Component Variant Design

### 2.1 Buttons
*   **Primary Accent Button:**
    *   `Background`: `--color-primary` (`#00FF9D`), `Text`: `--bg-base` (`#050B14`, Semibold)
    *   `Hover`: Lighten opacity or drop-shadow glow: `box-shadow: 0 0 15px rgba(0, 255, 157, 0.4);`
    *   `Disabled`: Opacity `0.4`, `cursor: not-allowed;`
*   **Secondary Glass Button:**
    *   `Background`: `rgba(255, 255, 255, 0.05)`, `Border`: `1px solid --glass-border`
    *   `Hover`: Background: `rgba(255, 255, 255, 0.1)`, Border: `rgba(255, 255, 255, 0.2)`
    *   `Active`: Background: `rgba(255, 255, 255, 0.15)`

### 2.2 Input Fields
*   `Background`: `rgba(5, 11, 20, 0.6)`, `Border`: `1px solid --glass-border`, `Text`: `--text-primary`
*   `Placeholder`: `--text-muted`
*   `Focus State`: Border: `1px solid --color-secondary` (`#00D2FF`), `box-shadow: 0 0 8px rgba(0, 210, 255, 0.2);`
*   `Invalid State`: Border: `1px solid --color-danger` (`#FF3B30`), `box-shadow: 0 0 8px rgba(255, 59, 48, 0.2);`

### 2.3 Cards (Glass Panels)
*   `Background`: `--glass-bg` (Semi-transparent navy)
*   `Backdrop Filter`: `blur(16px)`
*   `Border`: `1px solid --glass-border` (Top and left border can be slightly brighter to simulate light reflection)
*   `Border Radius`: `--radius-lg` (16px)

---

## 3. Accessibility Rules (WCAG 2.1 AA Compliance)

Integrating transparency and background blur introduces readability challenges. The system enforces strict compliance checks:

1.  **Text Contrast Ratios:**
    *   All normal body text (including labels on transparent overlays) must maintain a minimum contrast ratio of **4.5:1** against the blended glass background.
    *   Large text (headers larger than 18pt/semibold or 24pt) must maintain a ratio of **3:1**.
    *   *Implementation Rule:* If a dynamic background changes colors behind a glass pane, a high-opacity dark overlay layer (`rgba(5, 11, 20, 0.8)`) must be dynamically mixed in to stabilize readability.
2.  **Focus Indicator Visibility:**
    *   Interactive items must never suppress the browser outline without rendering a distinct focus state. Input fields, buttons, and links must show a visible blue/cyan (`--color-secondary`) halo when focused via keyboard navigation.
3.  **Keyboard Control:**
    *   All interactions (calendars, sliders, chat inputs) must be fully navigable using the `Tab`, `Shift+Tab`, `Space`, and `Enter` keys.
    *   Modals must trap tab focus, preventing users from traversing components beneath the backdrop pane.
4.  **Semantic Structure & ARIA:**
    *   Interactive components utilize aria descriptions. For example, status badges utilize `role="status"` and live alerts use `aria-live="polite"`.
    *   Forms must link `<label>` and `<input>` elements using explicit matching `for`/`id` values.
