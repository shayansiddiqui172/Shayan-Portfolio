"use client";
import { useEffect, useRef } from "react";

/* ─── Glyph set type ─────────────────────────────────────────────────────── */
export interface GlyphSet {
  gw: number;
  gh: number;
  gap: number;
  glyphs: Record<string, number[]>;
}

/* ─── Standard dot-matrix (5×9) — used for section headers ───────────────── */
export const GW = 5;
export const GH = 9;
export const GLYPH_GAP = 1;
export const DOT_FILL = 0.55;

export const GLYPH: Record<string, number[]> = {
  A: [0b01110, 0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001, 0b10001],
  B: [0b11110, 0b10001, 0b10001, 0b10001, 0b11110, 0b10001, 0b10001, 0b10001, 0b11110],
  C: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  D: [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  E: [0b11111, 0b10000, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000, 0b11111],
  F: [0b11111, 0b10000, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000, 0b10000],
  G: [0b01110, 0b10001, 0b10000, 0b10000, 0b10111, 0b10001, 0b10001, 0b10001, 0b01110],
  H: [0b10001, 0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001, 0b10001],
  I: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
  J: [0b00111, 0b00010, 0b00010, 0b00010, 0b00010, 0b00010, 0b10010, 0b10010, 0b01100],
  K: [0b10001, 0b10010, 0b10100, 0b11000, 0b11000, 0b10100, 0b10010, 0b10001, 0b10001],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  M: [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001],
  N: [0b10001, 0b11001, 0b11001, 0b10101, 0b10101, 0b10011, 0b10011, 0b10001, 0b10001],
  O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  P: [0b11110, 0b10001, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000, 0b10000],
  Q: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10101, 0b10010, 0b01110, 0b00001],
  R: [0b11110, 0b10001, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001, 0b10001],
  S: [0b01110, 0b10001, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b10001, 0b01110],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  U: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  V: [0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01010, 0b01010, 0b00100],
  W: [0b10001, 0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b10101, 0b11011, 0b10001],
  X: [0b10001, 0b10001, 0b01010, 0b01010, 0b00100, 0b01010, 0b01010, 0b10001, 0b10001],
  Y: [0b10001, 0b10001, 0b01010, 0b01010, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  Z: [0b11111, 0b00001, 0b00010, 0b00010, 0b00100, 0b01000, 0b01000, 0b10000, 0b11111],
  "/": [0b00001, 0b00001, 0b00010, 0b00010, 0b00100, 0b01000, 0b01000, 0b10000, 0b10000],
  " ": [0, 0, 0, 0, 0, 0, 0, 0, 0],
};

export const STANDARD: GlyphSet = { gw: GW, gh: GH, gap: GLYPH_GAP, glyphs: GLYPH };

/* ─── Fine glyph set (7×11) — taller, thinner, 1-cell strokes ───────────── */
const GLYPH_FINE: Record<string, number[]> = {
  A: [0b0001000, 0b0010100, 0b0010100, 0b0100010, 0b0100010, 0b0111110, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001],
  B: [0b1111110, 0b1000001, 0b1000001, 0b1000001, 0b1111110, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1111110],
  C: [0b0111110, 0b1000001, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1000001, 0b0111110],
  D: [0b1111100, 0b1000010, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000010, 0b1111100],
  E: [0b1111111, 0b1000000, 0b1000000, 0b1000000, 0b1111100, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1111111],
  F: [0b1111111, 0b1000000, 0b1000000, 0b1000000, 0b1111100, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1000000],
  G: [0b0111110, 0b1000001, 0b1000000, 0b1000000, 0b1000000, 0b1001111, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b0111110],
  H: [0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1111111, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001],
  I: [0b1111111, 0b0001000, 0b0001000, 0b0001000, 0b0001000, 0b0001000, 0b0001000, 0b0001000, 0b0001000, 0b0001000, 0b1111111],
  J: [0b0001111, 0b0000100, 0b0000100, 0b0000100, 0b0000100, 0b0000100, 0b0000100, 0b0000100, 0b1000100, 0b1000100, 0b0111000],
  K: [0b1000001, 0b1000010, 0b1000100, 0b1001000, 0b1010000, 0b1100000, 0b1010000, 0b1001000, 0b1000100, 0b1000010, 0b1000001],
  L: [0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1111111],
  M: [0b1000001, 0b1100011, 0b1010101, 0b1001001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001],
  N: [0b1000001, 0b1100001, 0b1100001, 0b1010001, 0b1010001, 0b1001001, 0b1000101, 0b1000101, 0b1000011, 0b1000011, 0b1000001],
  O: [0b0111110, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b0111110],
  P: [0b1111110, 0b1000001, 0b1000001, 0b1000001, 0b1111110, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1000000, 0b1000000],
  Q: [0b0111110, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1001001, 0b1000101, 0b0111110, 0b0000001],
  R: [0b1111110, 0b1000001, 0b1000001, 0b1000001, 0b1111110, 0b1010000, 0b1001000, 0b1000100, 0b1000010, 0b1000001, 0b1000001],
  S: [0b0111110, 0b1000001, 0b1000000, 0b1000000, 0b0111110, 0b0000001, 0b0000001, 0b0000001, 0b0000001, 0b1000001, 0b0111110],
  T: [0b1111111, 0b0001000, 0b0001000, 0b0001000, 0b0001000, 0b0001000, 0b0001000, 0b0001000, 0b0001000, 0b0001000, 0b0001000],
  U: [0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b0111110],
  V: [0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b0100010, 0b0100010, 0b0100010, 0b0010100, 0b0010100, 0b0001000, 0b0001000],
  W: [0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1000001, 0b1001001, 0b1010101, 0b1010101, 0b1100011, 0b1000001],
  X: [0b1000001, 0b1000001, 0b0100010, 0b0100010, 0b0010100, 0b0001000, 0b0010100, 0b0100010, 0b0100010, 0b1000001, 0b1000001],
  Y: [0b1000001, 0b1000001, 0b0100010, 0b0100010, 0b0010100, 0b0001000, 0b0001000, 0b0001000, 0b0001000, 0b0001000, 0b0001000],
  Z: [0b1111111, 0b0000001, 0b0000010, 0b0000100, 0b0001000, 0b0010000, 0b0100000, 0b1000000, 0b1000000, 0b1000000, 0b1111111],
  "/": [0b0000001, 0b0000010, 0b0000010, 0b0000100, 0b0000100, 0b0001000, 0b0010000, 0b0010000, 0b0100000, 0b0100000, 0b1000000],
  " ": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

export const FINE: GlyphSet = { gw: 7, gh: 11, gap: 2, glyphs: GLYPH_FINE };

/* ─── Generic helpers that work with any glyph set ───────────────────────── */
export function gridCols(text: string, gs: GlyphSet): number {
  return text.length * (gs.gw + gs.gap) - gs.gap;
}

/** Convenience wrapper using the standard 5×9 set */
export function dotGridCols(text: string): number {
  return gridCols(text, STANDARD);
}

/* ─── Generic renderers ──────────────────────────────────────────────────── */
export function renderDots(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  totalWidth: number,
  color: string,
  gs: GlyphSet,
  fillOverride?: number,
) {
  const upper  = text.toUpperCase();
  const cols   = gridCols(upper, gs);
  const step   = totalWidth / cols;
  const dot    = Math.max(1, Math.round(step * (fillOverride ?? DOT_FILL)));
  const totalH = gs.gh * step;
  const ox     = cx - totalWidth / 2;
  const oy     = cy - totalH / 2;

  ctx.fillStyle = color;
  let col = 0;
  for (const ch of upper) {
    const rows = gs.glyphs[ch];
    if (!rows) { col += gs.gw + gs.gap; continue; }
    for (let r = 0; r < gs.gh; r++) {
      for (let c = 0; c < gs.gw; c++) {
        if (rows[r] & (1 << (gs.gw - 1 - c))) {
          ctx.fillRect(Math.round(ox + (col + c) * step), Math.round(oy + r * step), dot, dot);
        }
      }
    }
    col += gs.gw + gs.gap;
  }
  return totalH;
}

export function renderSegmented(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  totalWidth: number,
  color: string,
  gs: GlyphSet,
  fillOverride?: number,
) {
  const upper  = text.toUpperCase();
  const cols   = gridCols(upper, gs);
  const step   = totalWidth / cols;
  const dot    = Math.max(1, Math.round(step * (fillOverride ?? DOT_FILL)));
  const totalH = gs.gh * step;
  const ox     = cx - totalWidth / 2;
  const oy     = cy - totalH / 2;

  ctx.fillStyle = color;
  let col = 0;
  for (const ch of upper) {
    const rows = gs.glyphs[ch];
    if (!rows) { col += gs.gw + gs.gap; continue; }
    for (let c = 0; c < gs.gw; c++) {
      let r = 0;
      while (r < gs.gh) {
        if (rows[r] & (1 << (gs.gw - 1 - c))) {
          const runStart = r;
          while (r < gs.gh && (rows[r] & (1 << (gs.gw - 1 - c)))) r++;
          const x = Math.round(ox + (col + c) * step);
          const y = Math.round(oy + runStart * step);
          const h = Math.round((r - runStart - 1) * step + dot);
          ctx.fillRect(x, y, dot, h);
        } else {
          r++;
        }
      }
    }
    col += gs.gw + gs.gap;
  }
  return totalH;
}

/* ─── Legacy wrappers (used by Hero animation with standard set) ─────────── */
export function renderDotText(
  ctx: CanvasRenderingContext2D, text: string,
  cx: number, cy: number, totalWidth: number,
  color = "#fff", fillOverride?: number,
) {
  return renderDots(ctx, text, cx, cy, totalWidth, color, STANDARD, fillOverride);
}

export function renderSegmentedText(
  ctx: CanvasRenderingContext2D, text: string,
  cx: number, cy: number, totalWidth: number,
  color = "#fff", fillOverride?: number,
) {
  return renderSegmented(ctx, text, cx, cy, totalWidth, color, STANDARD, fillOverride);
}

/* ─── Reusable component ─────────────────────────────────────────────────── */
interface Props {
  text: string;
  color?: string;
  /** Fixed px per grid step. Omit to fill container width instead. */
  dotSize?: number;
  /** Dot fill ratio (0–1). Default 0.55 (sparse dots). */
  fill?: number;
  /** Merge vertical runs into tall rectangles (LED scoreboard look). */
  segmented?: boolean;
  /** Use the fine 7×11 glyph set instead of standard 5×9. */
  fine?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function DotMatrixText({
  text,
  color = "#fff",
  dotSize,
  fill,
  segmented = false,
  fine = false,
  className,
  style,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cvRef   = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const cv   = cvRef.current;
    if (!wrap || !cv) return;
    const ctx = cv.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const gs = fine ? FINE : STANDARD;

    const draw = () => {
      const upper = text.toUpperCase();
      const cols  = gridCols(upper, gs);

      let step: number;
      if (dotSize) {
        step = dotSize;
      } else {
        const containerW = wrap.clientWidth;
        if (containerW === 0) return;
        step = containerW / cols;
      }

      const W = Math.ceil(cols * step);
      const H = Math.ceil(gs.gh * step);

      cv.width  = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width  = `${W}px`;
      cv.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const render = segmented ? renderSegmented : renderDots;
      render(ctx, text, W / 2, H / 2, W, color, gs, fill);
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [text, color, dotSize, fill, segmented, fine]);

  return (
    <div ref={wrapRef} className={className} style={style}>
      <canvas ref={cvRef} className="block" aria-label={text} role="img" />
    </div>
  );
}
