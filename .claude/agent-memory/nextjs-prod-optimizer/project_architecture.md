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

## Hobbies component status (as of 2026-05-15)

`Hobbies` is imported at the top of `app/page.tsx` but commented out in JSX (`{/* <Hobbies /> */}`). The import is still live, so the module is compiled and bundled. This is safe — `Hobbies.tsx` is `"use client"`, has no import-time browser API calls, and builds without error. The `vinyl.html` file exists in `/public/` even though no active component references it. The iframe srcs `music8.html`, `outdoors.html`, `bookimage.html`, and `banner2.txt` are all in `/public/`.

## Public assets inventory (as of 2026-05-19)

All referenced public assets exist:
- `/public/projects/` — cartsniper.png, tabphoto.png, contentengine.png, privatecloud.png, statline.png (all five used in Projects.tsx)
- `/public/fonts/FakeReceipt.otf` — referenced in globals.css @font-face
- `/public/banner2.txt` — fetched by `CarAsciiCell` in Hobbies.tsx
- `/public/music8.html`, `/public/outdoors.html`, `/public/bookimage.html` — iframe srcs in Hobbies.tsx
- `/public/vinyl.html` — present but not referenced by any active component
- Logo images: `logo-avis.png`, `logo-habitat.jpg`, `updatedlogo.png` — used in Experience.tsx

Tab Organizer now has `screenshot: "/projects/tabphoto.png"`. `tabphoto.png` exists in `/public/projects/`. `PreviewFrame` renders for all five projects.

## Raw img tag in Projects.tsx

`PreviewFrame` uses a raw `<img>` tag (with `// eslint-disable-next-line @next/next/no-img-element`). This is intentional — it renders screenshot previews dynamically from string srcs in a hover animation context. Not eligible for next/image `fill` without architectural change. Flagged as WARNING (no optimization), not BLOCKER.

## Resume component (as of 2026-05-19)

`components/Resume.tsx` is a `"use client"` component. Uses an inline `<style>` tag inside JSX (no SSR issue — React renders this client-side). Contains:
- `@keyframes pdf-scroll`: animates `transform: translateY()` on `.pdf-scroll-frame` — correct GPU-composited property. No `will-change` on the iframe — this is a WARNING (Rule D/B).
- `@keyframes term-blink`: animates `opacity` on `.term-cursor` — correct, GPU-composited.
- `.term-resume-link:hover` transitions `opacity` — correct.
- The iframe is desktop-only (`hidden md:block`).

## MorphText delay change (as of 2026-05-19)

`About.tsx` calls `<MorphText>` with no `delay` prop (default `delay=0`). Previously had a delay value. The `MorphText` component fires immediately on IntersectionObserver trigger at `threshold: 0.4`. No rAF loop — uses `setTimeout` only. All timers are cleaned up in useEffect return.

## Contact.tsx hydration risk

`Contact.tsx` renders `{new Date().getFullYear()}` inside a `"use client"` component with no `suppressHydrationWarning` on the containing `<p>`. In 2026 this is safe as the year matches between SSR and client render. This becomes a BLOCKER at year rollover (Dec 31 midnight UTC → Jan 1 client). Should have `suppressHydrationWarning` on the `<p>` for long-term safety.

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
