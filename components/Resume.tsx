"use client";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";

export default function Resume() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="resume" ref={ref} className="reveal px-8 md:px-16 py-20" aria-label="Resume">
      <DotMatrixText text="resume" dotSize={7} color="#ffffff" className="mb-10" animate />
      <div className="flex flex-col items-start gap-6">
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-body)",
            color: "#00ff88",
            border: "1px solid #00ff8840",
            padding: "0.6em 1.4em",
            letterSpacing: "0.08em",
            textDecoration: "none",
            transition: "background 0.15s ease, color 0.15s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "#00ff8815";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
          }}
        >
          view / download ↗
        </a>
      </div>
    </section>
  );
}
