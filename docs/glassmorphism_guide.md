# Glassmorphism Design & CSS Guide
## Phase 1: Implementation Rules, CSS Recipes & Accessibility Safeguards

This guide outlines the visual rules, layering logic, CSS specifications, and accessibility techniques required to implement the dark glassmorphic interface.

---

## 1. Core Principles of Glassmorphism

Glassmorphism simulates the visual physics of frosted glass. The effect is defined by four core layers:

```
[Background: Deep Radial Gradients + Organic Shapes]
                      │
                      ▼
       [Backdrop Filter: Gaussian Blur]
                      │
                      ▼
[Semi-Transparent Fill: HSL/RGBA Base Color]
                      │
                      ▼
  [Borders & Highlights: High-specificity Strokes]
                      │
                      ▼
     [Drop Shadows: Diffuse Ambient Occlusion]
```

### The Five Rules:

1.  **Never Use Pure Gray or Pure White Opacities on Gray Backgrounds:** Glass requires color tinting. Always tint the background fill (`background: rgba(...)`) with the ambient color of the interface (e.g. dark navy for a dark theme).
2.  **Strict Control of Border Opacities:** The border must be extremely subtle. If the border is too opaque, the sheet looks like painted plastic instead of glass.
3.  **Backdrop Blur is Mandatory:** A transparent element without a backdrop blur is simply transparent. The blur (`backdrop-filter: blur()`) is what isolates the content visually and diffuses the background details, ensuring text readability.
4.  **Use Layered Shadows:** To make glass feel elevated, use a combination of a sharp inset shadow (to simulate edge thickness) and a soft, spread-out drop shadow.
5.  **Directional Light Reflections (Specular Highlights):** In real glass, light reflections hit the top and left edges. We can simulate this using a linear gradient on the border.

---

## 2. Production CSS Recipes

Below are complete, production-ready CSS snippets representing components in the design system.

### 2.1 The Glass Card (Standard Container)

This container is the base for dashboards, details panels, and navigation bars.

```css
.glass-panel {
  background: rgba(10, 28, 54, 0.45); /* Tinted Navy */
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px); /* Safari support */
  
  /* Specular Highlight: brighter at the top left, fading out at the bottom right */
  border: 1px solid rgba(255, 255, 255, 0.08);
  
  border-radius: 16px;
  
  /* Layered Shadows */
  box-shadow: 
    0 8px 32px 0 rgba(0, 0, 0, 0.35),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.05); /* Internal edge light reflection */
  
  color: #F5F7FA;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), 
              box-shadow 0.3s ease;
}

.glass-panel:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 40px 0 rgba(0, 0, 0, 0.5),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.08);
}
```

### 2.2 Glass Input Fields

Inputs must be darker than their parent card container to create a sense of depth (concave indentation).

```css
.glass-input-wrapper {
  position: relative;
  width: 100%;
}

.glass-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(5, 11, 20, 0.6); /* Sunken background */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #F5F7FA;
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.glass-input::placeholder {
  color: #5B6E85;
}

/* Focused State */
.glass-input:focus {
  border-color: #00D2FF; /* Secondary Cyan Accent */
  box-shadow: 
    0 0 0 3px rgba(0, 210, 255, 0.15),
    inset 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Invalid State */
.glass-input.is-invalid {
  border-color: #FF3B30; /* Danger Red */
  box-shadow: 
    0 0 0 3px rgba(255, 59, 48, 0.15),
    inset 0 1px 2px rgba(0, 0, 0, 0.5);
}
```

### 2.3 Interactive Glass Buttons

```css
/* Secondary Glass Button */
.btn-glass {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #F5F7FA;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.1s ease;
}

.btn-glass:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-glass:active:not(:disabled) {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.12);
}

.btn-glass:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Focus state for keyboard accessibility */
.btn-glass:focus-visible {
  outline: 2px solid #00D2FF;
  outline-offset: 2px;
}
```

### 2.4 Custom Frosted Glass Scrollbars

Default browser scrollbars break the visual flow of a glassmorphic panel. Use custom-styled webkit scrollbars.

```css
.glass-scrollable {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.glass-scrollable::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.glass-scrollable::-webkit-scrollbar-track {
  background: transparent;
}

.glass-scrollable::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  backdrop-filter: blur(4px);
}

.glass-scrollable::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

---

## 3. Accessibility Under Glassmorphism

To satisfy WCAG 2.1 AA requirements, developers must implement the following safeguards:

### 3.1 Background Contrast Stability
When dynamic, moving, or highly colorful objects pass behind a glass container, the local contrast ratio can drop below 4.5:1, causing text to become illegible.
*   **The Safe Overlay Pattern:**
    Use a solid base background block combined with a CSS custom property toggle to guarantee high legibility when accessibility options (like high-contrast mode) are requested.

```css
/* Accessibility: High Contrast Mode Toggle */
[data-accessibility-high-contrast="true"] .glass-panel {
  background: #0B1528 !important; /* Forces solid background */
  backdrop-filter: none !important;
  border: 1px solid #FFFFFF !important;
  box-shadow: none !important;
}

[data-accessibility-high-contrast="true"] .glass-input {
  background: #050B14 !important;
  border: 2px solid #FFFFFF !important;
  color: #FFFFFF !important;
}
```

### 3.2 Dynamic Text Shadows for Contrast Protection
To prevent text from getting lost over bright patches of backgrounds showing through the frosted glass, apply a subtle text shadow that creates a readable boundary.

```css
.glass-readable-text {
  color: #F5F7FA;
  /* Soft, dark halo around letters to protect contrast */
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}
```

### 3.3 Strict Label Visibility
*   **No Floating Placeholder Labels:** Inside glass cards, placeholders must not be used in place of actual `<label>` tags. Since placeholders have low opacity (often 40%), they fail contrast requirements on transparent panels. Label elements must remain outside the inputs with a solid text color of `--text-secondary`.
