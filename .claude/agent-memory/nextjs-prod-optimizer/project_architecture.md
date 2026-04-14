---
name: Portfolio codebase architecture snapshot
description: Key files, SSR boundaries, client component map, animation structure, and deployment config state
type: project
---

## Client boundary map

All interactive/browser components are correctly marked `"use client"`:
- `components/Hero.tsx` — canvas animation + typewriter, `"use client"` present
- `components/About.tsx` — uses `useReveal` hook, `"use client"` present
- `components/Experience.tsx` — hover animations + `next/image`, `"use client"` present
- `components/Projects.tsx` — accordion state, `"use client"` present
- `components/Stack.tsx` — reveal hook, `"use client"` present
- `components/Hobbies.tsx` — IntersectionObserver + rAF scramble, `"use client"` present
- `components/Contact.tsx` — reveal hook, `"use client"` present
- `components/KeyboardShortcuts.tsx` — window event listeners + rAF, `"use client"` present
- `components/ScrollReset.tsx` — `history` + `window.scrollTo`, `"use client"` present
- `components/MorphText.tsx` — DOM manipulation in useEffect, `"use client"` present
- `components/DotMatrixText.tsx` — canvas rendering, `"use client"` present
- `hooks/useReveal.ts` — IntersectionObserver, `"use client"` present
- `app/page.tsx` — server component, no browser APIs, imports only client components (safe)
- `app/layout.tsx` — server component, font loading + metadata export

## Hero animation structure

Four-phase rAF loop in `HeroAnimation` sub-component inside `Hero.tsx`:
- Phase 0: ASCII noise on white bg (~700ms hold)
- Phase 1: letter pillar wave animation with stagger
- Phase 2: color inversion (white→dark, triggered at 7th non-space letter)
- Phase 3: canvas removed, DOM heading revealed

Cleanup: `useEffect` returns `() => { skipped = true; cancelAnimationFrame(rafId); window.removeEventListener(...) }` — correctly cancels the loop on unmount.

Canvas→DOM handoff: `canvasWrapperRef.current.style.visibility = "hidden"` followed immediately by `flushSync(() => setAnimDone(true))` in the same rAF tick.

`ANIMATION_SPEED = 1.15` divides all timing constants — never hardcode raw ms values.

Mobile/reduced-motion: `setSkipAnim(true)` bypasses the entire canvas phase via a `useEffect` that reads `window.matchMedia`.

## rAF loops and cleanup status

All rAF loops in the codebase have proper cleanup:
- `Hero.tsx / HeroAnimation`: cleanup via `skipped = true; cancelAnimationFrame(rafId)` in useEffect return
- `KeyboardShortcuts.tsx / useScramble`: cleanup via `cancelAnimationFrame(rafRef.current)` in useEffect return
- `Hobbies.tsx / AsciiBanner`: cleanup via `useEffect(() => () => cancelAnimationFrame(stateRef.current.rafId), [])`
- `DotMatrixText.tsx`: cleanup via `cancelAnimationFrame(rafRef.current)` in useEffect return

## Image usage

`Experience.tsx` uses `next/image` with `fill` prop for all three company logos (56×56 container with `overflow:hidden`, `position:relative`). No raw `<img>` tags anywhere in the codebase.

## Font loading

All three fonts loaded via `next/font/google` in `app/layout.tsx` with `display: "swap"` — Rule H satisfied.
Fonts: `Share_Tech_Mono` (body), `VT323` (pixel/display), `JetBrains_Mono` (canvas glyphs in hero).

## next.config.ts state (as of 2026-04-13)

```ts
poweredByHeader: false,
images: { formats: ["image/avif", "image/webp"] },
```

## Metadata / viewport state (as of 2026-04-13)

`app/layout.tsx` exports both `metadata` and `viewport`:
- `metadata`: title, description, keywords, authors, robots, openGraph, twitter card
- `viewport`: `colorScheme: "dark"`, `themeColor: "#0a0a0a"`

**Why:** Added in prod-optimization pass. `themeColor` and `colorScheme` must live in `viewport` export (not `metadata`) — `metadata.themeColor` is deprecated since Next.js 14.
