---
name: Codebase Dead Code Patterns
description: Exported symbols that appear unused, components that return null, and files with no known importers in this portfolio
type: project
---

## DotMatrixText.tsx — over-exported public API

These symbols are exported but never imported by any file in the project. They are candidates for removal but require human sign-off since they are public exports:

- `GW`, `GH`, `GLYPH_GAP` — scalar constants used only to build `STANDARD`
- `DOT_FILL` — fill ratio constant used only internally
- `GLYPH` — the 5×9 glyph record, only referenced to construct `STANDARD`
- `STANDARD` — the standard GlyphSet, used internally by `renderDots`, `renderSegmented`, and the legacy wrappers
- `dotGridCols(text)` — convenience wrapper around `gridCols(text, STANDARD)`; never called outside this file
- `renderDotText(...)` — legacy wrapper using `STANDARD`; never called outside this file
- `renderSegmentedText(...)` — legacy wrapper using `STANDARD`; never called outside this file

**Why:** These were likely part of an earlier API surface that got narrowed as Hero.tsx was refactored to accept explicit GlyphSet args.

## Nav.tsx — unreferenced component

`components/Nav.tsx` exports a default `Nav` component with a full IntersectionObserver-based active-section tracker. It is **never imported** by `app/page.tsx` or any other file. May have been superseded by `KeyboardShortcuts.tsx`.

**Why to flag:** Could be intentionally preserved for future use, or forgotten dead code.

## Cursor.tsx — stub component

`components/Cursor.tsx` is imported and rendered in `app/page.tsx` but its body is `return null`. The `.cursor-dot` class in `globals.css` is also never applied by any component. This appears to be a planned-but-not-implemented custom cursor.

**Why:** `.cursor-ring` is also referenced in `globals.css` media query but never used in any component.

## KeyboardShortcuts.tsx — unused import (already fixed)

`useCallback` was imported from React but never called. Removed in cleanup pass (2026-04-13).
