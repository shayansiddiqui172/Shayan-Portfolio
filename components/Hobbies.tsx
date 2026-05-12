"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";

const HOBBIES: Array<{ label: string; image: "car" | "book" | "music" | "outdoors" | null }> = [
  { label: "cars",     image: "car"      },
  { label: "books",    image: "book"     },
  { label: "music",    image: "music"    },
  { label: "outdoors", image: "outdoors" },
];

// ─── Shared animation core ────────────────────────────────────────────────────
// Draws noise into a rect on the given canvas, then clears shuffled TILE×TILE
// blocks over DURATION ms. Returns a cancel fn.
function animateNoiseReveal(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  onDone: () => void,
): () => void {
  // Fill region with fine-grain static noise
  const id = ctx.createImageData(w, h);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
    id.data[i + 3] = 255;
  }
  ctx.putImageData(id, x, y);

  const TILE = 3;
  const cols  = Math.ceil(w / TILE);
  const rows  = Math.ceil(h / TILE);
  const tiles: [number, number][] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      tiles.push([r, c]);
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }

  const DURATION = 1400;
  const start    = performance.now();
  let revealed   = 0;
  let raf        = 0;

  const step = (now: number) => {
    const p      = Math.min((now - start) / DURATION, 1);
    const eased  = 1 - (1 - p) ** 3;
    const target = (eased * tiles.length) | 0;
    while (revealed < target) {
      const [r, c] = tiles[revealed++];
      ctx.clearRect(x + c * TILE, y + r * TILE, TILE, TILE);
    }
    if (p < 1) raf = requestAnimationFrame(step);
    else onDone();
  };

  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

// Full-cell pixel reveal — used by image cells.
function runPixelReveal(cell: HTMLElement): () => void {
  const canvas = cell.querySelector<HTMLCanvasElement>("canvas[data-pr]");
  if (!canvas) return () => {};
  const W = cell.clientWidth;
  const H = cell.clientHeight;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let cancel = () => {};
  const raf = requestAnimationFrame(() => {
    cell.style.opacity = "1";
    cancel = animateNoiseReveal(ctx, 0, 0, W, H, () => { canvas.style.display = "none"; });
  });

  return () => { cancelAnimationFrame(raf); cancel(); };
}

// Text-only reveal — noise covers only the DotMatrixText bounding box.
// The black cell background appears instantly; only the text materialises.
function runTextReveal(cell: HTMLElement): () => void {
  const canvas  = cell.querySelector<HTMLCanvasElement>("canvas[data-pr]");
  const textEl  = cell.querySelector<HTMLElement>(":scope > :not(canvas[data-pr])");
  if (!canvas || !textEl) return () => {};

  const W = cell.clientWidth;
  const H = cell.clientHeight;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  // Measure text position relative to cell
  const cellRect = cell.getBoundingClientRect();
  const textRect = textEl.getBoundingClientRect();
  const tx = Math.floor(textRect.left - cellRect.left);
  const ty = Math.floor(textRect.top  - cellRect.top);
  const tw = Math.ceil(textRect.width);
  const th = Math.ceil(textRect.height);

  let cancel = () => {};
  const raf = requestAnimationFrame(() => {
    cell.style.opacity = "1";
    cancel = animateNoiseReveal(ctx, tx, ty, tw, th, () => { canvas.style.display = "none"; });
  });

  return () => { cancelAnimationFrame(raf); cancel(); };
}

// ─── Image cells ─────────────────────────────────────────────────────────────

function CarAsciiCell() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const preRef  = useRef<HTMLPreElement>(null);

  useEffect(() => {
    fetch("/banner2.txt").then(r => r.text()).then(text => {
      if (preRef.current) preRef.current.textContent = text;
    });
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const pre  = preRef.current;
    if (!wrap || !pre) return;
    const update = () => {
      pre.style.fontSize = `${wrap.clientWidth / 400 / 0.601}px`;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <pre
        ref={preRef}
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-jetbrains)",
          lineHeight: 1,
          color: "#aaaaaa",
          margin: 0,
          whiteSpace: "pre",
          display: "block",
        }}
      />
    </div>
  );
}

function CacaIframeCell({
  src, title, align = "top", grayscale = false,
}: {
  src: string; title: string;
  align?: "top" | "center" | "bottom";
  grayscale?: boolean;
}) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const dimsRef  = useRef({ w: 1, h: 1 });
  const alignRef = useRef(align);
  alignRef.current = align;

  useEffect(() => {
    const wrap  = wrapRef.current;
    const frame = frameRef.current;
    if (!wrap || !frame) return;

    const update = () => {
      const { w, h } = dimsRef.current;
      const scale      = wrap.clientWidth / w;
      const scaledH    = h * scale;
      const containerH = wrap.clientHeight;
      let ty = 0;
      if (alignRef.current === "bottom") ty = containerH - scaledH;
      else if (alignRef.current === "center") ty = (containerH - scaledH) / 2;
      frame.style.transform = `translateY(${ty}px) scale(${scale})`;
    };

    const measure = () => {
      try {
        const doc = frame.contentDocument;
        if (!doc) return;
        doc.body.style.margin     = "0";
        doc.body.style.padding    = "0";
        doc.body.style.background = "#0a0a0a";
        const outerDiv = doc.body.querySelector("div");
        if (outerDiv) (outerDiv as HTMLElement).style.background = "#0a0a0a";
        const w = doc.documentElement.scrollWidth || doc.body.scrollWidth;
        const h = doc.documentElement.scrollHeight || doc.body.scrollHeight;
        if (w > 0) {
          dimsRef.current = { w, h };
          frame.style.width  = `${w}px`;
          frame.style.height = `${h}px`;
        }
      } catch {}
      update();
    };

    frame.addEventListener("load", measure);
    if (frame.contentDocument?.readyState === "complete") measure();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => { ro.disconnect(); frame.removeEventListener("load", measure); };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <iframe
        ref={frameRef}
        src={src}
        title={title}
        scrolling="no"
        style={{
          border: "none",
          outline: "none",
          width: "1px",
          height: "1px",
          transformOrigin: "0 0",
          pointerEvents: "none",
          display: "block",
          filter: grayscale ? "grayscale(1)" : undefined,
        }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.35)" }} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
        }}
      />
    </div>
  );
}

function BookImageCell() {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const wrap  = wrapRef.current;
    const frame = frameRef.current;
    if (!wrap || !frame) return;
    const update = () => {
      frame.style.transform = `scale(${wrap.clientWidth / 4000})`;
    };
    const onLoad = () => {
      try {
        const doc = frame.contentDocument;
        if (doc) {
          doc.body.style.margin     = "0";
          doc.body.style.padding    = "0";
          doc.body.style.background = "#0a0a0a";
        }
      } catch {}
      update();
    };
    frame.addEventListener("load", onLoad);
    if (frame.contentDocument?.readyState === "complete") onLoad();
    else update();
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
        style={{
          border: "none",
          outline: "none",
          width: "4000px",
          height: "4000px",
          transformOrigin: "0 0",
          pointerEvents: "none",
          display: "block",
          filter: "grayscale(1) brightness(0.8)",
        }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(0,0,0,0.35)" }} />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)",
        }}
      />
    </div>
  );
}

// Pixel-reveal canvas — sits on top of each cell's content
function PRCanvas() {
  return (
    <canvas
      data-pr
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 20,
      }}
    />
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────
// One IntersectionObserver per row fires runPixelReveal on BOTH cells
// simultaneously so the label text and the image form at the same time.
function HobbyRow({ hobby, index }: { hobby: typeof HOBBIES[number]; index: number }) {
  const rowRef   = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const imgRef   = useRef<HTMLDivElement>(null);

  // Hide both cells immediately after mount (before first paint where possible)
  useLayoutEffect(() => {
    if (labelRef.current) labelRef.current.style.opacity = "0";
    if (imgRef.current)   imgRef.current.style.opacity   = "0";
  }, []);

  useEffect(() => {
    const row   = rowRef.current;
    const label = labelRef.current;
    const img   = imgRef.current;
    if (!row) return;

    const cleanups: Array<() => void> = [];

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      if (label) cleanups.push(runTextReveal(label));
      if (img)   cleanups.push(runPixelReveal(img));
    }, { threshold: 0.1 });

    io.observe(row);
    return () => { io.disconnect(); cleanups.forEach(fn => fn()); };
  }, []);

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
      {hobby.image === "music"    && <CacaIframeCell src="/vinyl.html"    title="vinyl record player" align="center" grayscale />}
      {hobby.image === "outdoors" && <CacaIframeCell src="/outdoors.html" title="outdoors"            align="bottom" grayscale />}
      <PRCanvas />
    </div>
  );

  return (
    <div ref={rowRef} className="flex flex-col md:flex-row md:h-[40vh]">
      {isEven ? <>{labelCell}{imageCell}</> : <>{imageCell}{labelCell}</>}
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
export default function Hobbies() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="hobbies" ref={ref} className="reveal py-20" aria-label="More About Me">
      <div className="px-8 md:px-16 mb-14">
        <DotMatrixText text="hobbies and interests" dotSize={7} color="#ffffff" className="mb-10" animate />
      </div>
      <div>
        {HOBBIES.map((hobby, i) => (
          <HobbyRow key={hobby.label} hobby={hobby} index={i} />
        ))}
      </div>
    </section>
  );
}
