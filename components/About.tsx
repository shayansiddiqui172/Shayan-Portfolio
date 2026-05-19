"use client";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";
import MorphText from "./MorphText";
import { CarAsciiCell, CacaIframeCell } from "./Hobbies";

// ── Switch between background styles ──────────────────────────────────────────
// 1 — outdoors bleeds in from the right edge, car ASCII as faint full texture
// 2 — car ASCII left panel + outdoors right panel, each fading inward
// 3 — car ASCII full-bleed only (clean, matches terminal aesthetic)
const BG_STYLE: 1 | 2 | 3 = 1;

function AboutBackground() {
  if (BG_STYLE === 1) return (
    <>
      {/* Car ASCII — left side, top aligned with paragraph, fades toward center */}
      <div
        aria-hidden
        style={{
          position: "absolute", top: "196px", left: 0, bottom: 0,
          width: "60%",
          opacity: 0.6, zIndex: 0,
          WebkitMaskImage: "linear-gradient(to right, black 15%, transparent 90%)",
          maskImage:        "linear-gradient(to right, black 15%, transparent 90%)",
        }}
      >
        <CarAsciiCell />
      </div>
      {/* Outdoors — bottom right, fades toward center */}
      <div
        aria-hidden
        style={{
          position: "absolute", bottom: 0, right: 0,
          width: "45%", height: "55%",
          opacity: 0.55, zIndex: 0,
          WebkitMaskImage: "linear-gradient(to right, transparent, black 55%)",
          maskImage:        "linear-gradient(to right, transparent, black 55%)",
        }}
      >
        <CacaIframeCell src="/outdoors.html" title="outdoors" align="bottom" grayscale yOffset={0.12} />
      </div>
    </>
  );

  if (BG_STYLE === 2) return (
    <>
      {/* Car ASCII fades in from the left */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 0, opacity: 0.5,
          WebkitMaskImage: "linear-gradient(to right, black 40%, transparent 75%)",
          maskImage:        "linear-gradient(to right, black 40%, transparent 75%)",
        }}
      >
        <CarAsciiCell />
      </div>
      {/* Outdoors fades in from the right */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, zIndex: 0, opacity: 0.5,
          WebkitMaskImage: "linear-gradient(to right, transparent 25%, black 60%)",
          maskImage:        "linear-gradient(to right, transparent 25%, black 60%)",
        }}
      >
        <CacaIframeCell src="/outdoors.html" title="outdoors" align="bottom" grayscale yOffset={0.12} />
      </div>
    </>
  );

  // BG_STYLE === 3
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.3, zIndex: 0 }}>
      <CarAsciiCell />
    </div>
  );
}

export default function About() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="about" ref={ref} className="reveal relative overflow-hidden px-8 md:px-16 py-20" aria-label="About">
      <AboutBackground />
      <div style={{ position: "relative", zIndex: 2, mixBlendMode: "difference" }}>
        <DotMatrixText text="about me" dotSize={7} color="#ffffff" className="mb-10" animate />
        <p style={{ fontSize: "calc(var(--fs-body) * 0.88)", fontFamily: "var(--font-receipt)", color: "#ffffff" }} className="leading-relaxed max-w-5xl">
          <MorphText>{"I'm a software engineering student at Wilfrid Laurier University, graduating May 2027. I build and ship full stack applications with a focus on systems thinking and clean execution. Currently interning as a Software Engineer at Wealth Capital Connections. I spend a lot of time behind a keyboard, but I value being outdoors just as much — sports, cars, and reading are where I spend the rest of it."}</MorphText>
        </p>
      </div>
    </section>
  );
}
