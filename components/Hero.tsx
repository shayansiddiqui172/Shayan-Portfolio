"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import DotMatrixText, { FINE, gridCols, renderSegmented } from "./DotMatrixText";

/* ─── Animation constants ─────────────────────────────────────────────────── */
const NAME = "SHAYAN SIDDIQUI";
const ACCENT_COLOR = "#00ff88";
const BG_DARK = "#0A0A0A";
const ANIMATION_SPEED = 1.15;

const ROLES = ["software engineer", "full-stack developer", "systems developer"];
// Sparse, lightweight glyphs — blanks mixed in for a more airy field
const ASCII_CHARS = [".", ".", ".", "·", "·", "+", ":", "-", "~", "*", " ", " ", " ", " "];
const CANVAS_FONT = "'JetBrains Mono', 'Space Mono', monospace";
const SHIMMER_INTERVAL = 90;
const SHIMMER_RATIO = 0.08;
const PHASE0_HOLD = 800 / ANIMATION_SPEED;
// Fade window at the start of Phase 1 so the noise eases into the wave
const NOISE_EASE_IN_DUR = 450 / ANIMATION_SPEED;

/* ─── Phase 1 timing — vertical wave pillars ──────────────────────────────── */
const STRETCH_DUR    = 250 / ANIMATION_SPEED;
const WAVE_HOLD_DUR  = 120 / ANIMATION_SPEED;
const CONTRACT_DUR   = 330 / ANIMATION_SPEED;
const WAVE_CYCLE     = STRETCH_DUR + WAVE_HOLD_DUR + CONTRACT_DUR; // 700ms
const LETTER_STAGGER = 170 / ANIMATION_SPEED;
const SPACE_PAUSE    = 150 / ANIMATION_SPEED;

/* ─── Phase 2 + Phase 3 timing ────────────────────────────────────────────── */
const PHASE2_DUR    = 2500 / ANIMATION_SPEED;
const PHASE3_DELAY  = 300 / ANIMATION_SPEED;

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/* ─── Cubic bezier easing ─────────────────────────────────────────────────── */
function makeCubicBezier(x1: number, y1: number, x2: number, y2: number) {
  return (t: number): number => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      const mt = 1 - mid;
      const bx = 3 * x1 * mt * mt * mid + 3 * x2 * mt * mid * mid + mid * mid * mid;
      if (bx < t) lo = mid; else hi = mid;
    }
    const mid = (lo + hi) / 2;
    const mt = 1 - mid;
    return 3 * y1 * mt * mt * mid + 3 * y2 * mt * mid * mid + mid * mid * mid;
  };
}
const stretchEase  = makeCubicBezier(0.16, 1, 0.3, 1);  // ease-out: snap up
const contractEase = makeCubicBezier(0.65, 0, 0.35, 1); // ease-in-out: smooth fall

/* ─── Hero Animation: Phase 0 → Phase 1 → Phase 2 (color inversion) → Phase 3 (reveal) */

interface LetterSlot {
  char: string;
  startTime: number;
  targetCx: number;
  targetCy: number;
  targetH: number;
  slotted: boolean;
}

function HeroAnimation({
  onDone,
  headingRef,
}: {
  onDone: () => void;
  headingRef: React.RefObject<HTMLDivElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* ── ASCII noise grid — smaller + airier ── */
    const FONT_SIZE = 10;
    const FONT_STR = `${FONT_SIZE}px ${CANVAS_FONT}`;
    ctx.font = FONT_STR;
    const CHAR_W = ctx.measureText("M").width * 1.9;
    const LINE_H = FONT_SIZE * 1.7;
    const noiseCols = Math.ceil(W / CHAR_W) + 1;
    const noiseRows = Math.ceil(H / LINE_H) + 1;

    function randChar(): string {
      return ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
    }

    const grid: string[] = new Array(noiseRows * noiseCols);
    for (let i = 0; i < grid.length; i++) grid[i] = randChar();

    /* ── Render a single glyph at given center & height ── */
    function renderSingleChar(char: string, cx: number, cy: number, h: number, color: string) {
      if (h <= 0) return;
      const totalW = h * FINE.gw / FINE.gh;
      renderSegmented(ctx!, char, cx, cy, totalW, color, FINE, 0.72);
    }

    /* ── Letter targets (computed once at Phase 1 start) ── */
    let letters: LetterSlot[] = [];
    let targetsReady = false;
    let phase2StartTime = 0;

    function computeTargets() {
      const el = headingRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalGridCols = gridCols(NAME, FINE);
      const step = rect.width / totalGridCols;
      const letterH = FINE.gh * step;

      letters = [];
      let t = 0;
      let col = 0;
      let nonSpaceCount = 0;
      for (let i = 0; i < NAME.length; i++) {
        const ch = NAME[i];
        if (ch === " ") {
          letters.push({
            char: " ", startTime: -1,
            targetCx: 0, targetCy: 0, targetH: 0,
            slotted: true,
          });
          t += SPACE_PAUSE;
          col += FINE.gw + FINE.gap;
          continue;
        }

        nonSpaceCount++;
        if (nonSpaceCount === 7) phase2StartTime = t;

        letters.push({
          char: ch,
          startTime: t,
          targetCx: rect.left + (col + FINE.gw / 2) * step,
          targetCy: rect.top + letterH / 2,
          targetH: letterH,
          slotted: false,
        });

        t += LETTER_STAGGER;
        col += FINE.gw + FINE.gap;
      }
      targetsReady = true;
    }

    /* ── Animation state ── */
    let rafId = 0;
    let lastShimmer = 0;
    let startTs = 0;
    let skipped = false;
    let allSlottedAt = -1;

    function drawNoise(bgCol: string, noiseCol: string, noiseAlpha: number) {
      ctx!.fillStyle = bgCol;
      ctx!.fillRect(0, 0, W, H);
      if (noiseAlpha <= 0) return;
      ctx!.save();
      ctx!.globalAlpha = noiseAlpha;
      ctx!.fillStyle = noiseCol;
      ctx!.font = FONT_STR;
      for (let r = 0; r < noiseRows; r++) {
        const y = r * LINE_H + FONT_SIZE;
        const rowOff = r * noiseCols;
        for (let c = 0; c < noiseCols; c++) {
          ctx!.fillText(grid[rowOff + c], c * CHAR_W, y);
        }
      }
      ctx!.restore();
    }

    function shimmer() {
      const count = Math.ceil(grid.length * SHIMMER_RATIO);
      for (let i = 0; i < count; i++) {
        grid[Math.floor(Math.random() * grid.length)] = randChar();
      }
    }

    function frame(ts: number) {
      if (skipped) return;
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs;

      if (ts - lastShimmer >= SHIMMER_INTERVAL) {
        shimmer();
        lastShimmer = ts;
      }

      /* ── Phase 0: pure noise hold ── */
      if (elapsed < PHASE0_HOLD) {
        drawNoise("#FFFFFF", "#000000", 1);
        rafId = requestAnimationFrame(frame);
        return;
      }

      /* ── Phase 1 + Phase 2: domino letters + color inversion ── */
      if (!targetsReady) computeTargets();
      const p1Elapsed = elapsed - PHASE0_HOLD;

      /* ── Phase 2 color computation ── */
      let bgCol = "#FFFFFF";
      let charCol = "#000000";
      let noiseCol = "#000000";
      // Gently thin noise as the wave begins (merges Phase 0 into Phase 1)
      let noiseAlpha = p1Elapsed < NOISE_EASE_IN_DUR
        ? 1 - 0.35 * easeInOut(p1Elapsed / NOISE_EASE_IN_DUR)
        : 0.65;

      const p2Elapsed = p1Elapsed - phase2StartTime;
      if (p2Elapsed > 0) {
        const p2t = Math.min(1, p2Elapsed / PHASE2_DUR);
        const e = easeInOut(p2t);

        // Background: white → #0A0A0A
        const bgV = Math.round(255 - 245 * e);
        bgCol = `rgb(${bgV},${bgV},${bgV})`;

        // Block font squares: black → white
        const chV = Math.round(255 * e);
        charCol = `rgb(${chV},${chV},${chV})`;

        // Noise: black → dim green (#00ff88) → fade out
        const colorP = Math.min(1, e * 2);
        noiseCol = `rgb(0,${Math.round(255 * colorP)},${Math.round(136 * colorP)})`;
        // Continue from the thinned ~0.65 baseline → fade to zero
        if (e < 0.5) {
          noiseAlpha = 0.65 - (0.65 - 0.15) * (e / 0.5);
        } else {
          noiseAlpha = 0.15 * (1 - (e - 0.5) / 0.5);
        }
      }

      drawNoise(bgCol, noiseCol, noiseAlpha);

      let allDone = true;

      for (const lt of letters) {
        if (lt.char === " ") continue;
        const le = p1Elapsed - lt.startTime;
        if (le < 0) { allDone = false; continue; }

        if (lt.slotted) {
          renderSingleChar(lt.char, lt.targetCx, lt.targetCy, lt.targetH, charCol);
          continue;
        }

        allDone = false;

        // Pillar anchored at letter top — stretches down toward viewport bottom
        const letterTop  = lt.targetCy - lt.targetH / 2;
        const maxYScale  = Math.max(1, (H - letterTop) / lt.targetH);

        let yScale: number;
        if (le < STRETCH_DUR) {
          /* ── STRETCH: pillar shoots up from heading position ── */
          yScale = maxYScale * stretchEase(le / STRETCH_DUR);

        } else if (le < STRETCH_DUR + WAVE_HOLD_DUR) {
          /* ── HOLD at full pillar height ── */
          yScale = maxYScale;

        } else if (le < WAVE_CYCLE) {
          /* ── CONTRACT: pillar collapses back to heading size ── */
          const t = (le - STRETCH_DUR - WAVE_HOLD_DUR) / CONTRACT_DUR;
          yScale = maxYScale + (1 - maxYScale) * contractEase(t);

        } else {
          lt.slotted = true;
          yScale = 1;
        }

        // Render with Y-axis scale anchored at letterTop
        ctx!.save();
        ctx!.translate(0, letterTop);
        ctx!.scale(1, yScale);
        ctx!.translate(0, -letterTop);
        renderSingleChar(lt.char, lt.targetCx, lt.targetCy, lt.targetH, charCol);
        ctx!.restore();
      }

      /* ── Phase 3: wait for both color-inversion and post-slot hold ── */
      if (allDone) {
        if (allSlottedAt < 0) allSlottedAt = p1Elapsed;
        const phase2Done   = p1Elapsed - phase2StartTime >= PHASE2_DUR;
        const slotHoldDone = p1Elapsed - allSlottedAt    >= PHASE3_DELAY;
        if (phase2Done && slotHoldDone) {
          onDoneRef.current();
          return;
        }
      }

      rafId = requestAnimationFrame(frame);
    }

    function skip() {
      if (skipped) return;
      skipped = true;
      cancelAnimationFrame(rafId);
      onDoneRef.current();
    }
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("click", skip, { once: true });

    document.fonts.ready.then(() => {
      rafId = requestAnimationFrame(frame);
    });

    return () => {
      skipped = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("click", skip);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50"
      style={{ background: "#FFFFFF", display: "block" }}
      aria-hidden="true"
    />
  );
}



/* ─── Hero ─────────────────────────────────────────────────────────────────── */
export default function Hero() {
  const [animDone, setAnimDone]   = useState(false);
  const [canvasGone, setCanvasGone] = useState(false);
  const [skipAnim, setSkipAnim]   = useState(false);

  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  const onDone = useCallback(() => {
    requestAnimationFrame(() => {
      if (canvasWrapperRef.current) canvasWrapperRef.current.style.visibility = "hidden";
      flushSync(() => setAnimDone(true));
      setTimeout(() => setCanvasGone(true), 50);
      window.dispatchEvent(new Event("hero-anim-done"));
    });
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile =
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 640;
    if (mobile || reducedMotion) {
      setSkipAnim(true);
      setAnimDone(true);
      window.dispatchEvent(new Event("hero-anim-done"));
    }
  }, []);

  /* ── Typewriter ── */
  const [displayed, setDisplayed] = useState("");
  const [roleIdx, setRoleIdx]     = useState(0);
  const [charIdx, setCharIdx]     = useState(0);
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    if (!animDone) return;
    const word = ROLES[roleIdx];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && charIdx < word.length) {
      t = setTimeout(() => { setDisplayed(word.slice(0, charIdx + 1)); setCharIdx(i => i + 1); }, 75);
    } else if (!deleting && charIdx === word.length) {
      t = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && charIdx > 0) {
      t = setTimeout(() => { setDisplayed(word.slice(0, charIdx - 1)); setCharIdx(i => i - 1); }, 38);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setRoleIdx(i => (i + 1) % ROLES.length);
    }
    return () => clearTimeout(t);
  }, [charIdx, deleting, roleIdx, animDone]);

  const fadeIn = (delay: number): React.CSSProperties => ({
    opacity:    animDone ? 1 : 0,
    transform:  animDone ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  });

  return (
    <section id="hero" className="min-h-screen flex flex-col" aria-label="Hero">

      {/* ── Canvas overlay (Phase 0 + Phase 1) ── */}
      {!canvasGone && !skipAnim && (
        <div ref={canvasWrapperRef} style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <HeroAnimation onDone={onDone} headingRef={headingRef} />
        </div>
      )}

      {/* ── Real heading — tight-fill dot-matrix (segmented LED look) ── */}
      <div style={{ ...(animDone ? { opacity: 1 } : { opacity: 0, visibility: "hidden" as const }), padding: "1.5vw 2.5vw 0" }}>
        <div ref={headingRef}>
          <DotMatrixText text={NAME} color="#ffffff" fill={0.72} segmented fine />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1">

        {/* role + info — left-aligned, terminal feel */}
        <div className="w-full flex flex-col justify-center px-8 md:px-12 py-10 md:py-14" style={{ paddingLeft: "2.5vw" }}>

          <div className="flex flex-col gap-3">

            {/* Typewriter role — main heading */}
            <div style={fadeIn(0)}>
              <p style={{ color: "#00ff88", fontSize: "1.4rem", lineHeight: 1.5, minWidth: "21ch" }}>
                {displayed}
                <span className="blink" style={{ color: "#00ff88" }}>▌</span>
              </p>
            </div>

            {/* bio */}
            <div style={{ ...fadeIn(0.2), marginTop: "0.25rem" }}>
              <p style={{ color: "#999999", fontSize: "1.15rem" }}>
                building across the stack. from systems to polished web experiences.
              </p>
            </div>

            {/* info block */}
            <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <div style={fadeIn(0.4)}>
                <p style={{ color: "#777777", fontSize: "0.95rem" }}>software eng intern @ wealth capital connections</p>
              </div>
              <div style={fadeIn(0.6)}>
                <p style={{ color: "#777777", fontSize: "0.95rem" }}>cs @ wilfrid laurier university</p>
              </div>
              <div style={fadeIn(0.8)}>
                <p style={{ color: "#777777", fontSize: "0.95rem" }}>toronto, ontario</p>
              </div>
            </div>

            {/* keyboard nav hint */}
            <div style={{ ...fadeIn(1.1), marginTop: "1.25rem" }}>
              <p style={{ color: "#aaaaaa", fontSize: "0.9rem", letterSpacing: "0.06em" }}>
                use{" "}
                <span style={{ color: "#00ff88", background: "#0a1f10", border: "1px solid #00ff8840", padding: "0.1em 0.4em" }}>^</span>
                {" "}commands to navigate{" "}
                <span style={{ color: "#555" }}>·</span>{" "}
                <span style={{ color: "#00ff88", background: "#0a1f10", border: "1px solid #00ff8840", padding: "0.1em 0.4em" }}>^?</span>
                {" "}for help
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
