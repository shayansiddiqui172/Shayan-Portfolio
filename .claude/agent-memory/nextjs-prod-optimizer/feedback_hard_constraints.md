---
name: Hard constraints and working preferences
description: Explicit constraints from the user on what to do and not do during optimization passes
type: feedback
---

Never change functionality, logic, animations, visual appearance, or component behavior.
**Why:** Portfolio aesthetic and animation are intentional design decisions. Optimization passes are strictly non-functional.
**How to apply:** Before any change, ask: "Does this alter what renders or how it behaves?" If yes, flag it instead of applying it.

No Co-Authored-By lines in commits.
**Why:** User prefers clean commit history without AI attribution footers.
**How to apply:** Always omit Co-Authored-By when drafting commit messages.

Never use `git add -A`. Stage files explicitly by name.
**Why:** Prevents accidentally staging untracked files like `banner (2).txt` or env files.
**How to apply:** Always list exact file paths in `git add` calls.

Do not hardcode raw millisecond values in Hero.tsx. Always divide by `ANIMATION_SPEED`.
**Why:** `ANIMATION_SPEED` is the global speed multiplier; raw values bypass it and break the animation system.
**How to apply:** Any new timing constant in Hero.tsx must be `X / ANIMATION_SPEED`.

Do not duplicate heading text. The canvas IS the heading during the animation.
**Why:** The DOM heading is hidden (`opacity:0, visibility:hidden`) until `animDone`. Rendering it again would show double headings on non-JS paths or cause layout shifts.
**How to apply:** Never add an SSR-visible heading alongside the DOM heading that reveals post-animation.

If a fix would change visible behavior or aesthetics, flag it for human review instead of applying it automatically.
**Why:** User trusts the optimizer to be conservative; unexpected visual changes are worse than leaving an imperfection.
**How to apply:** When uncertain, include the item in "Remaining Concerns" or "Deployment Risk Flags" instead of touching the code.
