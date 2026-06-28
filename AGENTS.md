<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Global Layout Architecture Guardrails

Page width is set via `<Container size={...}>` only. Do not hardcode raw `max-w-*` styles for page-level frames.

Available size tokens:

- `prose` (760px): for long-form reading (about/legal/blog/narratives)
- `content` (1200px): standard marketing layouts & default page size
- `app` (1440px): application pages (doctor search, detail, clinics)
- `wide` (1600px): wide hero elements or media-heavy listings
- `dashboard` (1760px): ultra-wide patient and provider dashboard safety cap
- `fluid` (no max-width): full-width canvas layouts (gutters only)
