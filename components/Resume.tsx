"use client";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";

export default function Resume() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="resume" ref={ref} className="reveal px-8 md:px-16 py-20" aria-label="Resume">
      <style>{`
        @keyframes pdf-scroll {
          0%   { transform: translateY(0px); }
          100% { transform: translateY(-340px); }
        }
        .pdf-scroll-frame {
          animation: pdf-scroll 20s ease-in-out 2s infinite alternate;
        }
        @keyframes term-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .term-cursor {
          display: inline-block;
          animation: term-blink 1s step-end infinite;
          margin-left: 2px;
        }
        .term-resume-link {
          opacity: 1;
          transition: opacity 0.15s ease;
        }
        .term-resume-link:hover {
          opacity: 0.55;
        }
      `}</style>

      <DotMatrixText text="resume" dotSize={7} color="#ffffff" className="mb-10" animate />

      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* VIEW FULL RESUME — terminal command line */}
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="term-resume-link"
          style={{
            display: "inline-block",
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(1.1rem, 4vw, var(--fs-small))",
            color: "#ffffff",
            textDecoration: "none",
            letterSpacing: "0.05em",
            marginBottom: "0.75rem",
          }}
        >
          <span style={{ color: "#00ff88", userSelect: "none" }}>{">"}</span>
          {" VIEW FULL RESUME ↗"}
          <span className="term-cursor" aria-hidden>┃</span>
        </a>

        {/* Resume image preview — mobile only */}
        <div
          className="block md:hidden"
          style={{
            position: "relative",
            height: 480,
            overflow: "hidden",
            border: "1px solid #1a1a1a",
          }}
        >
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: 72,
            background: "linear-gradient(to bottom, transparent, #0a0a0a)",
            zIndex: 2,
            pointerEvents: "none",
          }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/resume-preview.png"
            alt="Resume preview"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              display: "block",
            }}
          />
        </div>

        {/* PDF preview — desktop only.
            Container clips to 720px tall. Iframe is 1320px tall so the animation
            has room to scroll. 116% width + left:-8% clips the viewer's gray side margins. */}
        <div
          className="hidden md:block"
          style={{
            position: "relative",
            height: 720,
            overflow: "hidden",
            border: "1px solid #1a1a1a",
          }}
        >
          {/* Fade-out at bottom */}
          <div style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0,
            height: 72,
            background: "linear-gradient(to bottom, transparent, #0a0a0a)",
            zIndex: 2,
            pointerEvents: "none",
          }} />

          <iframe
            src="/resume.pdf#toolbar=0&navpanes=0&scrollbar=0"
            className="pdf-scroll-frame"
            style={{
              position: "absolute",
              top: 0,
              left: "-8%",
              width: "116%",
              height: 1460,
              border: "none",
              willChange: "transform",
            }}
            title="Resume preview"
          />
        </div>

      </div>
    </section>
  );
}
