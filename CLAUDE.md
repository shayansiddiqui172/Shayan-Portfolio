@AGENTS.md

# Portfolio — Claude guide

## Project
Personal portfolio for Shayan Siddiqui. Next.js app, dark terminal aesthetic.

## Design system
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#0a0a0a` | page background |
| `--color-hi` | `#00ffa8` / `#00ff88` | accent / interactive |
| `--color-dim` | `#404040` | muted labels |
| `--font-mono` | Share Tech Mono | body text |
| `--font-pixel` | VT323 | "hello," display text |
| `--font-jetbrains` | JetBrains Mono | canvas glyphs in hero animation |

All colors live in `app/globals.css` (`@theme inline` block). Keep new UI consistent with these.

## Key files
- `app/page.tsx` — root layout: Cursor, Hero, section components, KeyboardShortcuts
- `components/Hero.tsx` — entire hero section + canvas intro animation (Phase 0–3)
- `components/DotMatrixText.tsx` — segmented 7×11 glyph renderer; exports `FINE`, `gridCols`, `renderSegmented`
- `app/globals.css` — Tailwind theme, base styles, scrollbar, cursor dot, reveal/blink utilities

## Hero animation (Hero.tsx)
Four phases driven by a single `requestAnimationFrame` loop on a full-screen canvas:
- **Phase 0** — sparse ASCII noise on white bg, holds ~700ms
- **Phase 1** — each letter of "SHAYAN SIDDIQUI" stretches into a vertical pillar then contracts to its final position (wave ripple, ~170ms stagger)
- **Phase 2** — color inversion: white→dark bg, black→white glyphs, noise fades out (triggered at ~7th letter)
- **Phase 3** — canvas removed, DOM heading revealed, content fades in with staggered `translateY`

`ANIMATION_SPEED` (currently `1.15`) is a global divisor — divide every duration constant by it, never hardcode raw ms.

Canvas→DOM handoff: canvas goes `visibility:hidden`, `flushSync(setAnimDone(true))` in the same rAF tick so the DOM heading appears pixel-identical to the last canvas frame.

## Conventions
- No Co-Authored-By lines in commits
- Avoid `git add -A`; stage files explicitly
- Don't duplicate heading text — the canvas IS the heading during animation, DOM heading is hidden until done
