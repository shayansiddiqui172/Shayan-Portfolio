"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";


const ROLES = ["software engineer", "full-stack developer", "systems developer"];
const HELLO = "hello,";
const NAME = "Shayan Siddiqui";
const NAME_LINE1 = "Shayan";
const NAME_LINE2 = "Siddiqui";
const NOISE_CHARS = ["+", ",", ".", "=", "/", "c", "x"];
const CANVAS_FONT = "'JetBrains Mono', 'Space Mono', monospace";

/* ─── Dot-matrix bitmap font (5×9, thin dot-matrix style) ─────────────────── */
const GW = 5;
const GH = 9;
const GLYPH_GAP = 1;
const DOT_FILL = 0.55;

const GLYPH: Record<string, number[]> = {
  A: [0b01110, 0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001, 0b10001],
  D: [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  H: [0b10001, 0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001, 0b10001],
  I: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
  N: [0b10001, 0b11001, 0b11001, 0b10101, 0b10101, 0b10011, 0b10011, 0b10001, 0b10001],
  Q: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01110, 0b00001],
  S: [0b01110, 0b10001, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b10001, 0b01110],
  U: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  Y: [0b10001, 0b10001, 0b01010, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  " ": [0, 0, 0, 0, 0, 0, 0, 0, 0],
};

function dotGridCols(text: string): number {
  return text.length * (GW + GLYPH_GAP) - GLYPH_GAP;
}

function renderDotText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  totalWidth: number,
  color = "#fff",
) {
  const upper = text.toUpperCase();
  const cols  = dotGridCols(upper);
  const step  = totalWidth / cols;
  const dot   = Math.max(1, Math.round(step * DOT_FILL));
  const totalH = GH * step;
  const ox    = cx - totalWidth / 2;
  const oy    = cy - totalH / 2;

  ctx.fillStyle = color;
  let col = 0;
  for (const ch of upper) {
    const rows = GLYPH[ch];
    if (!rows) { col += GW + GLYPH_GAP; continue; }
    for (let r = 0; r < GH; r++) {
      for (let c = 0; c < GW; c++) {
        if (rows[r] & (1 << (GW - 1 - c))) {
          ctx.fillRect(
            Math.round(ox + (col + c) * step),
            Math.round(oy + r * step),
            dot,
            dot,
          );
        }
      }
    }
    col += GW + GLYPH_GAP;
  }
  return totalH;
}

/* ─── DotMatrixHeading — side-by-side layout (left half / right half) ───── */
function DotMatrixHeading({ line1, line2 }: { line1: string; line2: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cvRef   = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const cv   = cvRef.current;
    if (!wrap || !cv) return;
    const ctx = cv.getContext("2d")!;

    const draw = () => {
      const W = wrap.clientWidth;
      if (W === 0) return;
      const halfW  = W / 2;
      const pad    = Math.round(W * 0.025); // small padding from edges

      // Each word fills its own half
      const cols1  = dotGridCols(line1.toUpperCase());
      const cols2  = dotGridCols(line2.toUpperCase());
      const usable = halfW - pad * 2;
      const step1  = usable / cols1;
      const step2  = usable / cols2;
      const step   = Math.min(step1, step2); // uniform dot size

      const w1 = cols1 * step;
      const w2 = cols2 * step;
      const H  = Math.ceil(GH * step);

      cv.width  = W;
      cv.height = H;

      // Line 1 left-aligned in left half, line 2 left-aligned in right half
      renderDotText(ctx, line1, pad + w1 / 2, H / 2, w1, "#ffffff");
      renderDotText(ctx, line2, halfW + pad + w2 / 2, H / 2, w2, "#ffffff");
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [line1, line2]);

  return (
    <div ref={wrapRef}>
      <canvas ref={cvRef} className="block w-full" aria-label={`${line1} ${line2}`} role="img" />
    </div>
  );
}

/* ─── AsciiMorph canvas — phases 1–3, single motion ───────────────────────── */
const ANIM_END = 4200; // ms — Phase 3 ends here

function AsciiMorph({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Set initial bg state so bottom nav starts white
    document.documentElement.style.setProperty("--anim-bg", "255");

    /* ── Grid sizing ── */
    const FONT_SIZE = Math.max(10, Math.round(W / 90));
    const FONT_STR  = `${FONT_SIZE}px ${CANVAS_FONT}`;
    ctx.font = FONT_STR;
    const CHAR_W = ctx.measureText("M").width;
    const LINE_H = FONT_SIZE * 1.4;

    const cols = Math.ceil(W / CHAR_W);
    const rows = Math.ceil(H / LINE_H);

    const nameRow = Math.floor(rows / 2);
    const nameCol = Math.floor((cols - NAME.length) / 2);

    // Phase 3 endpoints — match DotMatrixHeading's side-by-side layout
    const smallNameW  = NAME.length * CHAR_W;
    const halfW       = W / 2;
    const pad         = Math.round(W * 0.025);
    const usableHalf  = halfW - pad * 2;
    const cols1       = dotGridCols(NAME_LINE1.toUpperCase());
    const cols2       = dotGridCols(NAME_LINE2.toUpperCase());
    const step1       = usableHalf / cols1;
    const step2       = usableHalf / cols2;
    const finalStep   = Math.min(step1, step2);
    const w1Final     = cols1 * finalStep;
    const w2Final     = cols2 * finalStep;
    const headingH    = GH * finalStep;
    const tgtCy       = headingH / 2;

    /* ── Grid state ── */
    const grid: string[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => randNoise())
    );

    function randNoise(): string {
      return NOISE_CHARS[Math.floor(Math.random() * NOISE_CHARS.length)];
    }
    function isNameCell(r: number, c: number): boolean {
      return r === nameRow && c >= nameCol && c < nameCol + NAME.length;
    }
    function px(col: number) { return col * CHAR_W; }
    function py(row: number) { return row * LINE_H + FONT_SIZE; }

    let rafId = 0;
    let startTs = 0;

    /** Background grey value (255 → 10) based on elapsed time.
        Hold white until morph is well underway (1200 ms). */
    const BG_HOLD = 1200;
    function bgGrey(elapsed: number): number {
      if (elapsed < BG_HOLD) return 255;
      const t = Math.min(1, (elapsed - BG_HOLD) / (ANIM_END - BG_HOLD));
      return Math.round(255 - 245 * Math.sqrt(t));
    }

    /** Character colour interpolation: black (#000) on white bg → white/green on dark bg */
    function charAlpha(elapsed: number, baseAlpha: number): string {
      const bg = bgGrey(elapsed);
      // Interpolate character brightness: 0 (black) when bg=255, 255 (white) when bg=10
      const charBright = Math.round(255 * (1 - (bg - 10) / 245));
      return `rgba(${charBright},${charBright},${charBright},${baseAlpha.toFixed(2)})`;
    }

    function frame(ts: number) {
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs;

      // ── Background: white → #0a0a0a ──
      const bg = bgGrey(elapsed);
      ctx!.fillStyle = `rgb(${bg},${bg},${bg})`;
      ctx!.fillRect(0, 0, W, H);
      ctx!.font = FONT_STR;

      // Broadcast bg progress so bottom nav can match
      document.documentElement.style.setProperty("--anim-bg", String(bg));

      /* Phase 1 — 0–500 ms: TV static */
      if (elapsed < 500) {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (Math.random() < 0.35) grid[r][c] = randNoise();
            ctx!.fillStyle = charAlpha(elapsed, 0.2 + Math.random() * 0.65);
            ctx!.fillText(grid[r][c], px(c), py(r));
          }
        }

      /* Phase 2 — 500–2500 ms: morph */
      } else if (elapsed < 2500) {
        const p = (elapsed - 500) / 2000;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (isNameCell(r, c)) {
              const target = NAME[c - nameCol];
              const snap = p * p;
              const flickerRate = 0.3 * (1 - snap) + 0.02;
              if (Math.random() < flickerRate) {
                grid[r][c] = Math.random() < snap ? target : randNoise();
              }
              if (p > 0.85) grid[r][c] = target;

              const alpha = 0.45 + p * 0.55;
              ctx!.fillStyle = charAlpha(elapsed, alpha);
              ctx!.fillText(grid[r][c], px(c), py(r));
            } else {
              const bgDensity = Math.max(0, 1 - p * 1.4);
              if (Math.random() < 0.08 * bgDensity) {
                grid[r][c] = Math.random() < (1 - p * 1.1) ? randNoise() : " ";
              }
              if (grid[r][c] !== " " && Math.random() < bgDensity) {
                const alpha = bgDensity * 0.38;
                ctx!.fillStyle = charAlpha(elapsed, alpha);
                ctx!.fillText(grid[r][c], px(c), py(r));
              }
            }
          }
        }

      /* Phase 3 — 2500–4200 ms: grow + slide to top, split side-by-side */
      } else if (elapsed < ANIM_END) {
        const p = (elapsed - 2500) / (ANIM_END - 2500);
        const ease = 1 - Math.pow(1 - p, 3); // ease-out cubic

        const bg = bgGrey(elapsed);
        const charBrt = Math.round(255 * (1 - (bg - 10) / 245));
        const color   = `rgb(${charBrt},${charBrt},${charBrt})`;
        const srcCy   = py(nameRow) - FONT_SIZE * 0.35;

        // Target positions: line1 left-aligned in left half, line2 left-aligned in right half
        const cx1Tgt = pad + w1Final / 2;
        const cx2Tgt = halfW + pad + w2Final / 2;

        // Both start centered, split apart
        const currentW1 = smallNameW * (NAME_LINE1.length / NAME.length) + (w1Final - smallNameW * (NAME_LINE1.length / NAME.length)) * ease;
        const currentW2 = smallNameW * (NAME_LINE2.length / NAME.length) + (w2Final - smallNameW * (NAME_LINE2.length / NAME.length)) * ease;

        const cx1 = W / 2 + (cx1Tgt - W / 2) * ease;
        const cx2 = W / 2 + (cx2Tgt - W / 2) * ease;

        const cy = srcCy + (tgtCy - srcCy) * ease;

        // Fade: line2 fades in as lines separate
        const line2Alpha = Math.min(1, ease * 2);

        renderDotText(ctx!, NAME_LINE1, cx1, cy, currentW1, color);
        if (line2Alpha > 0.01) {
          const r = charBrt, g = charBrt, b = charBrt;
          renderDotText(ctx!, NAME_LINE2, cx2, cy, currentW2, `rgba(${r},${g},${b},${line2Alpha.toFixed(2)})`);
        }

      } else {
        onDoneRef.current();
        return;
      }

      rafId = requestAnimationFrame(frame);
    }

    /* ── Skip on interaction ── */
    function skip() {
      cancelAnimationFrame(rafId);
      onDoneRef.current();
    }
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("click",   skip, { once: true });

    document.fonts.ready.then(() => {
      rafId = requestAnimationFrame(frame);
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("click",   skip);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50"
      style={{ background: "#fff", display: "block" }}
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

  const onDone = useCallback(() => {
    requestAnimationFrame(() => {
      if (canvasWrapperRef.current) canvasWrapperRef.current.style.visibility = "hidden";
      document.documentElement.style.removeProperty("--anim-bg");
      flushSync(() => setAnimDone(true));
      setTimeout(() => setCanvasGone(true), 50);
      window.dispatchEvent(new Event("hero-anim-done"));
    });
  }, []);

  useEffect(() => {
    const mobile =
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 640;
    if (mobile) {
      setSkipAnim(true);
      setAnimDone(true);
      window.dispatchEvent(new Event("hero-anim-done"));
    }
  }, []);

  /* ── Hello typing ── */
  const [helloText, setHelloText]     = useState("");
  const [helloCharIdx, setHelloCharIdx] = useState(0);
  const [helloTyped, setHelloTyped]   = useState(false);

  useEffect(() => {
    if (!animDone || helloTyped) return;
    if (helloCharIdx < HELLO.length) {
      const t = setTimeout(() => {
        setHelloText(HELLO.slice(0, helloCharIdx + 1));
        setHelloCharIdx(i => i + 1);
      }, 75);
      return () => clearTimeout(t);
    } else {
      setHelloTyped(true);
    }
  }, [animDone, helloCharIdx, helloTyped]);

  /* ── Typewriter ── */
  const [displayed, setDisplayed] = useState("");
  const [roleIdx, setRoleIdx]     = useState(0);
  const [charIdx, setCharIdx]     = useState(0);
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    if (!helloTyped) return;
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
  }, [charIdx, deleting, roleIdx, helloTyped]);

  const fadeIn = (delay: number): React.CSSProperties => ({
    opacity:    animDone ? 1 : 0,
    transform:  animDone ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  });

  return (
    <section id="hero" className="min-h-screen flex flex-col" aria-label="Hero">

      {/* ── Canvas overlay (phases 1–3) ── */}
      {!canvasGone && !skipAnim && (
        <div ref={canvasWrapperRef} style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <AsciiMorph onDone={onDone} />
        </div>
      )}

      {/* ── Real heading — revealed atomically when canvas hides ── */}
      <div
        className=""
        style={animDone ? { opacity: 1 } : { opacity: 0, visibility: "hidden" }}
      >
        <DotMatrixHeading line1={NAME_LINE1} line2={NAME_LINE2} />
      </div>

      {/* ── Two-column body ── */}
      <div className="flex flex-1">

        {/* role + info */}
        <div className="w-full flex flex-col justify-center items-center px-8 md:px-12 py-10 md:py-14">

          <div className="flex flex-col gap-2">

            {/* hello, — types out, stays static */}
            <div style={fadeIn(0)}>
              <p style={{ color: "#00ff88", fontSize: "2.25rem", fontWeight: "normal", lineHeight: 1.2, fontFamily: "var(--font-pixel)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {helloText}
              </p>
            </div>

            {/* Typewriter role */}
            <div style={fadeIn(0.2)}>
              <p style={{ color: "#00ff88", fontSize: "1.2rem", lineHeight: 1.5, minWidth: "21ch" }}>
                {displayed}
                <span className="blink" style={{ color: "#00ff88" }}>▌</span>
              </p>
            </div>

            {/* bio */}
            <div style={{ ...fadeIn(0.4), marginTop: "0.75rem" }}>
              <p style={{ color: "#999999", fontSize: "0.85rem" }}>
                building across the stack. from systems to polished web experiences.
              </p>
            </div>

            {/* cs @ wilfrid laurier */}
            <div style={{ ...fadeIn(0.6), marginTop: "0.5rem" }}>
              <p style={{ color: "#999999", fontSize: "0.85rem" }}>cs @ wilfrid laurier</p>
            </div>

            {/* toronto, ontario */}
            <div style={fadeIn(0.8)}>
              <p style={{ color: "#999999", fontSize: "0.85rem" }}>toronto, ontario</p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
