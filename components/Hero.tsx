"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ─── ASCII portrait ───────────────────────────────────────────────────────── */
const ASCII = `
...,,,,,,+++++++++++++++++++++++++++++++++++++++++++,,,,,...........
..,,+++++XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX+++++,,..........
.,+XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx+,.........
.+XXXXXXXXXXXXXppp+++++pXXXXXXXXXXXXXXXXXpp+++++pppXXXXXX+,.......
pXXXXXXXXXp+,.............+pXXXXXXXXXXXp+,.............+pXXXXp.....
pXXXXXXXXp+,...............+XXXXXXXXXXXp+...............+pXXXXp.....
pXXXXXXXX+.................pXXXXXXXXXXXX+................+XXXXp.....
pXXXXXXXp+.................pXXXXXXXXXXXXp.................+XXXp.....
pXXXXXXXpp++,...........,++pXXXXXXXXXXXXpp++,...........,++XXXp.....
pXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXp.....
=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXp.....
=XXXXXXXXXXXXXpp+====+ppXXXXXXXXXXXXXXXXpp+====+ppXXXXXXXXXX=......
=XXXXXXXXXXp=,...........=pXXXXXXXXXXXXXp=,...........=pXXXXX=......
CXXXXXXXXXp=..............=XXXXXXXXXXXXXXp=..............=XXXp=.....
CXXXXXXXXXp=..............=XXXXXXXXXXXXXXp=..............=XXXp=.....
CXXXXXXXXXXp=,...........=pXXXXXXXXXXXXXXXp=,...........=pXXXC=.....
CCXXXXXXXXXXXpp+======+ppXXXXXXXXXXXXXXXXXXXpp+======+ppXXXCC=.....
CCCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXCC=.....
CCCCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXpp=.....
/CCCCCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXpCCC=.....
//CCCCCCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXCCCCC=.....
///CCCCCCCCCCCCCCXXXXXXXXXXXXXXXXXXXXXXXXXXCCCCCCCCCCCCCCCCCC===.....
////CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC====....
`.trim();

const ROLES = ["Role 1", "Role 2", "Role 3"];
const NAME = "Shayan Siddiqui";
const NOISE_CHARS = ["+", ",", ".", "=", "/", "c", "x"];
// Canvas 2D does NOT resolve CSS custom properties — no var() here
const CANVAS_FONT = "'JetBrains Mono', 'Space Mono', monospace";

/* ─── FitText ──────────────────────────────────────────────────────────────── */
function FitText({ text }: { text: string }) {
  const textRef = useRef<SVGTextElement>(null);
  const [vb, setVb] = useState("0 0 1400 160");

  useEffect(() => {
    const measure = () => {
      const el = textRef.current;
      if (!el) return;
      const b = el.getBBox();
      if (b.width > 0 && b.height > 0) setVb(`${b.x} ${b.y} ${b.width} ${b.height}`);
    };
    document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <svg
      width="100%"
      viewBox={vb}
      preserveAspectRatio="none"
      className="block"
      aria-label={text}
      role="img"
    >
      <text
        ref={textRef}
        x="0"
        y="0"
        dominantBaseline="hanging"
        fontFamily="var(--font-pixel), monospace"
        fontSize="160"
        fill="white"
        style={{ textTransform: "uppercase" } as React.CSSProperties}
      >
        {text}
      </text>
    </svg>
  );
}

/* ─── AsciiMorph canvas ────────────────────────────────────────────────────── */
function AsciiMorph({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Stable ref so the effect closure never goes stale
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

    /* ── Grid sizing ──
       Pick a font size that gives ~90 cols on a typical desktop, then
       measure the ACTUAL character width from the canvas context so the
       grid is pixel-perfect regardless of font fallback.               */
    const FONT_SIZE = Math.max(10, Math.round(W / 90));
    const FONT_STR  = `${FONT_SIZE}px ${CANVAS_FONT}`;
    ctx.font = FONT_STR;
    const CHAR_W = ctx.measureText("M").width;
    const LINE_H = FONT_SIZE * 1.4;

    const cols = Math.ceil(W / CHAR_W);
    const rows = Math.ceil(H / LINE_H);

    // Name placement — vertically & horizontally centred
    const nameRow = Math.floor(rows / 2);
    const nameCol = Math.floor((cols - NAME.length) / 2);

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

    /* ── Draw loop ── */
    function frame(ts: number) {
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs;

      ctx!.clearRect(0, 0, W, H);
      ctx!.font = FONT_STR; // reuse the validated string set before measureText

      /* Phase 1 — 0–500 ms: TV static */
      if (elapsed < 500) {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (Math.random() < 0.35) grid[r][c] = randNoise();
            ctx!.fillStyle = `rgba(255,255,255,${(0.2 + Math.random() * 0.65).toFixed(2)})`;
            ctx!.fillText(grid[r][c], px(c), py(r));
          }
        }

      /* Phase 2 — 500–2500 ms: morph */
      } else if (elapsed < 2500) {
        const p = (elapsed - 500) / 2000; // 0 → 1

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {

            if (isNameCell(r, c)) {
              const target = NAME[c - nameCol];
              const snap = p * p;            // accelerates toward end
              const flickerRate = 0.3 * (1 - snap) + 0.02;
              if (Math.random() < flickerRate) {
                grid[r][c] = Math.random() < snap ? target : randNoise();
              }
              if (p > 0.85) grid[r][c] = target; // force-snap last 15%

              const alpha = 0.45 + p * 0.55;
              ctx!.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
              ctx!.fillText(grid[r][c], px(c), py(r));

            } else {
              // Background: clears toward spaces over time
              const bgDensity = Math.max(0, 1 - p * 1.4);
              if (Math.random() < 0.08 * bgDensity) {
                grid[r][c] = Math.random() < (1 - p * 1.1) ? randNoise() : " ";
              }
              if (grid[r][c] !== " " && Math.random() < bgDensity) {
                const alpha = bgDensity * 0.38;
                ctx!.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
                ctx!.fillText(grid[r][c], px(c), py(r));
              }
            }
          }
        }

      /* Phase 3 — 2500–3500 ms: solidify */
      } else if (elapsed < 3500) {
        const p = (elapsed - 2500) / 1000; // 0 → 1

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (isNameCell(r, c)) {
              grid[r][c] = NAME[c - nameCol]; // locked
              ctx!.fillStyle = "#ffffff";
              ctx!.fillText(grid[r][c], px(c), py(r));
            } else if (grid[r][c] !== " ") {
              // Sparse remnants fade to nothing
              if (Math.random() < 0.006) grid[r][c] = " ";
              const alpha = Math.max(0, (1 - p) * 0.11);
              if (alpha > 0.01) {
                ctx!.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
                ctx!.fillText(grid[r][c], px(c), py(r));
              }
            }
          }
        }

      /* Phase 4 — 3500–4200 ms: slot up + fade */
      } else if (elapsed < 4200) {
        const raw = (elapsed - 3500) / 700; // 0 → 1
        // ease-in-out cubic
        const ease = raw < 0.5
          ? 4 * raw * raw * raw
          : 1 - Math.pow(-2 * raw + 2, 3) / 2;

        const startY = py(nameRow);
        const endY = FONT_SIZE * 0.8; // near top of viewport
        const y = startY + (endY - startY) * ease;
        const alpha = 1 - ease; // fade out as it rises

        ctx!.save();
        ctx!.globalAlpha = Math.max(0, alpha);
        ctx!.fillStyle = "#ffffff";
        ctx!.font = FONT_STR;
        for (let c = 0; c < NAME.length; c++) {
          ctx!.fillText(NAME[c], px(nameCol + c), y);
        }
        ctx!.restore();

        if (raw >= 1) {
          onDoneRef.current();
          return; // stop loop
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
    window.addEventListener("click", skip, { once: true });

    document.fonts.ready.then(() => {
      rafId = requestAnimationFrame(frame);
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("click", skip);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50"
      style={{ background: "#000", display: "block" }}
      aria-hidden="true"
    />
  );
}

/* ─── Hero ─────────────────────────────────────────────────────────────────── */
export default function Hero() {
  const [animDone, setAnimDone] = useState(false);
  const [skipAnim, setSkipAnim] = useState(false); // mobile or SSR skip

  const onDone = useCallback(() => setAnimDone(true), []);

  // Typewriter
  const [displayed, setDisplayed] = useState("");
  const [roleIdx, setRoleIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Detect mobile on mount — skip animation
  useEffect(() => {
    const mobile =
      window.matchMedia("(pointer: coarse)").matches ||
      window.innerWidth < 640;
    if (mobile) {
      setSkipAnim(true);
      setAnimDone(true);
    }
  }, []);

  // Typewriter — only begins after animation completes
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

  // Inline transition helpers
  const fadeIn = (delay: number): React.CSSProperties => ({
    opacity: animDone ? 1 : 0,
    transform: animDone ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  });

  return (
    <section id="hero" className="min-h-screen flex flex-col" aria-label="Hero">

      {/* Canvas overlay — desktop only, removed once done */}
      {!animDone && !skipAnim && <AsciiMorph onDone={onDone} />}

      {/* ── Full-width name ── */}
      <div className="border-b border-[#1a1a1a]" style={fadeIn(0)}>
        <FitText text="SHAYAN SIDDIQUI" />
      </div>

      {/* ── Two-column body ── */}
      <div className="flex flex-1">

        {/* Left — ASCII portrait */}
        <div
          className="hidden md:flex w-1/2 border-r border-[#1a1a1a] p-5 items-start overflow-hidden"
          style={fadeIn(0.35)}
        >
          <pre
            className="text-[#1c1c1c] leading-[1.2] select-none"
            style={{ fontSize: "clamp(5px, 0.55vw, 9px)" }}
            aria-hidden="true"
          >
            {ASCII}
          </pre>
        </div>

        {/* Right — role + info */}
        <div className="w-full md:w-1/2 flex flex-col justify-between px-8 md:px-12 py-10 md:py-14">

          {/* Typewriter role */}
          <div className="flex flex-col gap-5" style={fadeIn(0.15)}>
            <p className="flex items-baseline gap-3 text-[#fff]" style={{ fontSize: "var(--fs-body)" }}>
              <span className="text-[#00ffa8]">/</span>
              <span>
                {displayed}
                <span className="blink text-[#00ffa8]">▌</span>
              </span>
            </p>
            <p className="flex items-baseline gap-3 text-[#404040]" style={{ fontSize: "var(--fs-body)" }}>
              <span>&amp;</span>
              <span>[Role 2]</span>
            </p>
          </div>

          {/* Location + scroll hint */}
          <div className="flex flex-col gap-4" style={fadeIn(0.45)}>
            <p className="flex items-baseline gap-3 text-[#404040]" style={{ fontSize: "var(--fs-small)" }}>
              <span className="text-[#1a1a1a]">/</span>
              <span>[City]<br />[Country]</span>
            </p>
            <p className="flex items-baseline gap-3 text-[#404040]" style={{ fontSize: "var(--fs-small)" }}>
              <span className="text-[#1a1a1a]">/</span>
              <span>USE YOUR KEYBOARD TO NAVIGATE ↓</span>
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
