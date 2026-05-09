"use client";
import { useEffect, useRef } from "react";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";

const HOBBIES: Array<{ label: string; image: "car" | "book" | null }> = [
  { label: "cars",   image: "car"  },
  { label: "books",  image: "book" },
  { label: "music",  image: null   },
  { label: "sports", image: null   },
];

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

    // banner2.txt is 400 chars wide; JetBrains Mono char width ≈ 0.601× font-size
    const update = () => {
      const fontSize = wrap.clientWidth / 400 / 0.601;
      pre.style.fontSize = `${fontSize}px`;
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

function BookImageCell() {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const wrap  = wrapRef.current;
    const frame = frameRef.current;
    if (!wrap || !frame) return;

    const update = () => {
      const scale = wrap.clientWidth / 4000;
      frame.style.transform = `scale(${scale})`;
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(wrap);
    return () => ro.disconnect();
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
          width: "4000px",
          height: "4000px",
          transformOrigin: "0 0",
          pointerEvents: "none",
          display: "block",
          filter: "grayscale(1) brightness(0.8)",
        }}
      />
      {/* dark vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(0,0,0,0.35)" }}
      />
      {/* scanlines */}
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

export default function Hobbies() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="hobbies" ref={ref} className="reveal py-20" aria-label="More About Me">

      {/* ── Padded header ── */}
      <div className="px-8 md:px-16 mb-14">
        <DotMatrixText text="hobbies and interests" dotSize={7} color="#ffffff" className="mb-10" animate />
      </div>

      {/* ── Full-width checkerboard grid ── */}
      <div>
        {HOBBIES.map((hobby, i) => {
          const isEven = i % 2 === 0;

          const labelCell = (
            <div
              className="flex items-center justify-center bg-[#0a0a0a] overflow-hidden
                         h-[40vh] md:h-auto md:flex-1"
            >
              <DotMatrixText text={hobby.label} color="#ffffff" dotSize={14} />
            </div>
          );

          const imageCell = (
            <div
              className="relative overflow-hidden bg-[#080808]
                         h-[28vh] md:h-auto md:flex-1"
            >
              {hobby.image === "car"  && <CarAsciiCell />}
              {hobby.image === "book" && <BookImageCell />}
            </div>
          );

          return (
            <div
              key={hobby.label}
              className="flex flex-col md:flex-row md:h-[40vh]"
            >
              {isEven ? (
                <>{labelCell}{imageCell}</>
              ) : (
                <>{imageCell}{labelCell}</>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
