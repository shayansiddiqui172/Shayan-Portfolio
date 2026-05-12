---
name: Codebase Dead Code Patterns
description: Exported symbols that appear unused, dead constants, and CSS patterns found in this portfolio
type: project
---

## DotMatrixText.tsx — over-exported public API

These symbols are exported but never imported by any other file. They remain because they are used internally, but they are dead exports worth flagging for a future de-export pass:

- `GW`, `GH`, `GLYPH_GAP` — scalar constants used only to build `STANDARD`
- `DOT_FILL` — fill ratio constant used only internally
- `GLYPH` — the 5×9 glyph record, only referenced to construct `STANDARD`
- `STANDARD` — the standard GlyphSet, used internally by `renderDots`, `renderSegmented`, and the component
- `dotGridCols(text)` — convenience wrapper around `gridCols(text, STANDARD)`; never called outside this file
- `renderDots` — exported and used internally only

**Removed in 2026-05-09 cleanup pass:**
- `renderDotText(...)` — legacy wrapper using `STANDARD`; had zero callers anywhere (internal or external). Deleted.
- `renderSegmentedText(...)` — same as above. Deleted.

**Why:** These were likely part of an earlier API surface that got narrowed as Hero.tsx was refactored to accept explicit GlyphSet args.

## Hero.tsx — dead module-level constants

`ACCENT_COLOR = "#00ff88"` and `BG_DARK = "#0A0A0A"` were declared at module scope but never referenced in any expression.

**Removed in 2026-05-09 cleanup pass.**

## globals.css — dead CSS rules removed

- `.section-label` — never applied in any component. Removed 2026-05-09.
- `.tl-dot` — never applied in any component. Removed 2026-05-09.
- `.tl-line` IS used — in Experience.tsx mobile fallback. Keep.

## Components previously flagged (now gone)

- `Nav.tsx` — was flagged as an unreferenced component. File no longer exists (already removed).
- `Cursor.tsx` — was a stub returning null. File no longer exists (already removed).
- `globals.css` cursor-dot / cursor-ring classes — were dead when Cursor.tsx existed. No longer present.

## Hero animation — do not touch

`ANIMATION_SPEED` and all timing constants (`STRETCH_DUR`, `WAVE_HOLD_DUR`, `CONTRACT_DUR`, `WAVE_CYCLE`, `LETTER_STAGGER`, `SPACE_PAUSE`, `PHASE2_DUR`, `PHASE3_DELAY`, `PHASE0_HOLD`, `NOISE_EASE_IN_DUR`) drive the canvas animation phases 0–3. Never remove or alter these.

## Hobbies.tsx — two internal observer hooks

`useRowReveal` and `useSpaceExit` are internal-only hooks (not exported). Both are called from `HobbyRow`. Do not confuse with unused exports.

## No commented-out code or console statements

Confirmed zero `console.*` calls and zero commented-out code blocks across all source files as of 2026-05-09.

**How to apply:** On future cleanup runs, focus on `DotMatrixText.tsx` first (most export surface). Skip Hero animation constants entirely.
