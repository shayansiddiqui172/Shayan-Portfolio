"use client";
import { useEffect, useRef } from "react";
import DotMatrixText from "./DotMatrixText";

const HOBBIES: Array<{ label: string; image: "car" | "book" | "music" | "outdoors" | null }> = [
  { label: "cars",     image: "car"      },
  { label: "reading",  image: "book"     },
  { label: "music",    image: "music"    },
  { label: "outdoors", image: "outdoors" },
];

// ─── Pixel-morph (dark cover → reveal) ───────────────────────────────────────
const TILE = 5;
const MORPH_DURATION = 950;

function smoothstep(p: number) { return p * p * (3 - 2 * p); }

type PreparedMorph = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tiles: [number, number][];
  rx: number; ry: number;
};

function prepare(
  cell: HTMLElement,
  region?: { x: number; y: number; w: number; h: number },
): PreparedMorph | null {
  const canvas = cell.querySelector<HTMLCanvasElement>("canvas[data-pr]");
  if (!canvas) return null;
  const W = cell.clientWidth;
  const H = cell.clientHeight;
  if (!W || !H) return null;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const rx = region?.x ?? 0;
  const ry = region?.y ?? 0;
  const rw = region?.w ?? W;
  const rh = region?.h ?? H;

  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(rx, ry, rw, rh);

  const cols = Math.ceil(rw / TILE);
  const rows = Math.ceil(rh / TILE);
  const tiles: [number, number][] = new Array(cols * rows);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      tiles[r * cols + c] = [r, c];
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const t = tiles[i]; tiles[i] = tiles[j]; tiles[j] = t;
  }

  return { canvas, ctx, tiles, rx, ry };
}

// Measures the text element's bounding box relative to the cell so the morph
// covers only the text area, not the surrounding padding.
function prepareText(cell: HTMLElement): PreparedMorph | null {
  const textEl = cell.querySelector<HTMLElement>(":scope > :not(canvas[data-pr])");
  if (!textEl) return prepare(cell);
  const cr = cell.getBoundingClientRect();
  const tr = textEl.getBoundingClientRect();
  return prepare(cell, {
    x: Math.floor(tr.left - cr.left),
    y: Math.floor(tr.top  - cr.top),
    w: Math.ceil(tr.width),
    h: Math.ceil(tr.height),
  });
}

function startMorph(p: PreparedMorph): () => void {
  const { canvas, ctx, tiles, rx, ry } = p;
  let revealed = 0;
  let raf      = 0;
  const start  = performance.now();

  const step = (now: number) => {
    const t      = Math.min((now - start) / MORPH_DURATION, 1);
    const target = (smoothstep(t) * tiles.length) | 0;
    while (revealed < target) {
      const [r, c] = tiles[revealed++];
      ctx.clearRect(rx + c * TILE, ry + r * TILE, TILE, TILE);
    }
    if (t < 1) raf = requestAnimationFrame(step);
    else canvas.style.display = "none";
  };

  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

function PRCanvas() {
  return (
    <canvas
      data-pr
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 20 }}
    />
  );
}

// ─── Shared hook for prepare+morph IO pair ────────────────────────────────────
function useMorph(
  ref: React.RefObject<HTMLElement | null>,
  buildFn: (el: HTMLElement) => PreparedMorph | null,
  threshold = 0.05,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let data: PreparedMorph | null = null;
    let built = false;
    let cancel: (() => void) | null = null;

    const doBuild = () => {
      if (built) return;
      built = true;
      data = buildFn(el);
    };

    const prepIo = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      prepIo.disconnect();
      doBuild();
    }, { rootMargin: "1400px 0px", threshold: 0 });
    prepIo.observe(el);

    const morphIo = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      morphIo.disconnect();
      doBuild();
      if (data) cancel = startMorph(data);
    }, { threshold });
    morphIo.observe(el);

    return () => { prepIo.disconnect(); morphIo.disconnect(); cancel?.(); };
  }, []);
}

// ─── Image cells ─────────────────────────────────────────────────────────────

export function CarAsciiCell() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const preRef  = useRef<HTMLPreElement>(null);

  // Defer the 46KB banner fetch + 115-line <pre> layout until the cell nears the
  // viewport. Loading it on mount competes with the hero intro animation for the
  // main thread and stalls the first frames on mobile.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let loaded = false;
    const load = () => {
      if (loaded) return;
      loaded = true;
      fetch("/banner2.txt").then(r => r.text()).then(text => {
        if (preRef.current) preRef.current.textContent = text;
      });
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { load(); io.disconnect(); }
    }, { rootMargin: "600px 0px" });
    io.observe(wrap);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const pre  = preRef.current;
    if (!wrap || !pre) return;
    // Clamp to a minimum effective container width so font stays visible on narrow mobile
    // screens (a 390px phone would otherwise produce ~0.97px — sub-pixel, invisible).
    const update = () => { pre.style.fontSize = `${Math.max(wrap.clientWidth, 600) / 400 / 0.601}px`; };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  return (
    // translateZ(0) promotes to its own compositor layer so clearRect on the
    // sibling PRCanvas doesn't force a repaint of the <pre> text each frame.
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden" style={{ transform: "translateZ(0)" }}>
      <pre
        ref={preRef}
        aria-hidden="true"
        style={{ fontFamily: "var(--font-jetbrains)", lineHeight: 1, color: "#aaaaaa", margin: 0, whiteSpace: "pre", display: "block" }}
      />
    </div>
  );
}

export function CacaIframeCell({
  src, title, align = "top", grayscale = false, zoom = 1, yOffset = 0,
}: {
  src: string; title: string;
  align?: "top" | "center" | "bottom";
  grayscale?: boolean;
  zoom?: number;
  yOffset?: number;
}) {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const frameRef   = useRef<HTMLIFrameElement>(null);
  const dimsRef    = useRef({ w: 1, h: 1 });
  const alignRef   = useRef(align);
  const zoomRef    = useRef(zoom);
  const yOffsetRef = useRef(yOffset);
  alignRef.current   = align;
  zoomRef.current    = zoom;
  yOffsetRef.current = yOffset;

  useEffect(() => {
    const wrap  = wrapRef.current;
    const frame = frameRef.current;
    if (!wrap || !frame) return;

    const update = () => {
      const { w, h } = dimsRef.current;
      // Default: fit to width. But if that makes the image taller than the box,
      // fit to height and center instead so the whole image stays visible.
      const scaleW    = (wrap.clientWidth / w) * zoomRef.current;
      const overflows = h * scaleW > wrap.clientHeight;
      const scale     = overflows ? (wrap.clientHeight / h) * zoomRef.current : scaleW;
      const tx        = (wrap.clientWidth - w * scale) / 2;
      // yOffset pushes the image down for the desktop "bleed" effect, but on mobile
      // that clips the bottom — drop it so the whole photo fits in its box.
      const yOff      = window.innerWidth < 768 ? 0 : yOffsetRef.current;
      let   ty        = 0;
      if (overflows) {
        ty = (wrap.clientHeight - h * scale) / 2;
      } else {
        if (alignRef.current === "bottom") ty = wrap.clientHeight - h * scale;
        else if (alignRef.current === "center") ty = (wrap.clientHeight - h * scale) / 2;
        ty += yOff * h * scale;
      }
      frame.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
    };

    // Keep the largest content size ever seen. The first measurement on `load` can
    // be premature (heavy libcaca content not laid out yet) and report a too-small
    // size — which would size the iframe small, clip its content to the top-left,
    // and scale that crop to fill the box (the "upper-left quarter" bug).
    let maxW = 0, maxH = 0;
    const measure = () => {
      try {
        const doc = frame.contentDocument;
        if (!doc) return;
        doc.body.style.margin = doc.body.style.padding = "0";
        doc.body.style.background = "#0a0a0a";
        const d = doc.body.querySelector("div");
        if (d) (d as HTMLElement).style.background = "#0a0a0a";
        const w = Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth);
        const h = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
        if (w > maxW) maxW = w;
        if (h > maxH) maxH = h;
        if (maxW > 1) {
          dimsRef.current = { w: maxW, h: maxH };
          frame.style.width  = `${maxW}px`;
          frame.style.height = `${maxH}px`;
        }
      } catch {}
      update();
    };

    const timers: ReturnType<typeof setTimeout>[] = [];
    const onLoad = () => {
      measure();
      // Re-measure as the content finishes laying out so we converge on the real size.
      [120, 400, 1000, 2500].forEach((t) => timers.push(setTimeout(measure, t)));
    };
    frame.addEventListener("load", onLoad);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { frame.src = src; io.disconnect(); }
    }, { rootMargin: "800px 0px" });
    io.observe(wrap);
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => {
      ro.disconnect();
      io.disconnect();
      frame.removeEventListener("load", onLoad);
      timers.forEach(clearTimeout);
    };
  }, [src]);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <iframe
        ref={frameRef}
        title={title}
        scrolling="no"
        style={{ border: "none", outline: "none", width: "1px", height: "1px", transformOrigin: "0 0", pointerEvents: "none", display: "block", filter: grayscale ? "grayscale(1)" : undefined }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.35)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.12) 2px,rgba(0,0,0,0.12) 4px)" }} />
    </div>
  );
}

export function BookImageCell() {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const wrap  = wrapRef.current;
    const frame = frameRef.current;
    if (!wrap || !frame) return;
    const update = () => { frame.style.transform = `scale(${wrap.clientWidth / 4000})`; };
    const onLoad = () => {
      try {
        const doc = frame.contentDocument;
        if (doc) { doc.body.style.margin = doc.body.style.padding = "0"; doc.body.style.background = "#0a0a0a"; }
      } catch {}
      update();
    };
    frame.addEventListener("load", onLoad);
    if (frame.contentDocument?.readyState === "complete") onLoad(); else update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => { ro.disconnect(); frame.removeEventListener("load", onLoad); };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <iframe
        ref={frameRef}
        src="/bookimage.html"
        title="book art"
        scrolling="no"
        style={{ border: "none", outline: "none", width: "4000px", height: "4000px", transformOrigin: "0 0", pointerEvents: "none", display: "block", filter: "grayscale(1) brightness(0.8)" }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.35)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.12) 2px,rgba(0,0,0,0.12) 4px)" }} />
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────
function HobbyRow({ hobby, index }: { hobby: typeof HOBBIES[number]; index: number }) {
  const labelRef = useRef<HTMLDivElement>(null);
  const imgRef   = useRef<HTMLDivElement>(null);

  useMorph(labelRef, prepareText);
  useMorph(imgRef, (el) => prepare(el));

  const isEven = index % 2 === 0;

  const labelCell = (
    <div
      ref={labelRef}
      className="relative flex items-center justify-center bg-[#0a0a0a] overflow-hidden h-[40vh] md:h-auto md:flex-1"
    >
      <DotMatrixText text={hobby.label} color="#ffffff" dotSize={14} />
      <PRCanvas />
    </div>
  );

  const imageCell = (
    <div
      ref={imgRef}
      className="relative overflow-hidden bg-[#080808] h-[28vh] md:h-auto md:flex-1"
    >
      {hobby.image === "car"      && <CarAsciiCell />}
      {hobby.image === "book"     && <BookImageCell />}
      {hobby.image === "music"    && <CacaIframeCell src="/music8.html"   title="music"               align="center" grayscale />}
      {hobby.image === "outdoors" && <CacaIframeCell src="/outdoors.html" title="outdoors"            align="bottom" grayscale yOffset={0.12} />}
      <PRCanvas />
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row md:h-[40vh]">
      {isEven ? <>{labelCell}{imageCell}</> : <>{imageCell}{labelCell}</>}
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
export default function Hobbies() {
  const titleRef = useRef<HTMLDivElement>(null);

  // Title uses the same PRCanvas morph as the rows — no DotMatrixText animate,
  // no CSS reveal transition, no per-frame full-canvas repaint.
  useMorph(titleRef, prepareText, 0.2);

  return (
    <section id="hobbies" className="py-20" aria-label="More About Me">
      <div ref={titleRef} className="relative px-8 md:px-16 mb-14">
        <DotMatrixText text="hobbies and interests" dotSize={7} color="#ffffff" className="mb-10" />
        <PRCanvas />
      </div>
      <div>
        {HOBBIES.map((hobby, i) => (
          <HobbyRow key={hobby.label} hobby={hobby} index={i} />
        ))}
      </div>
    </section>
  );
}
