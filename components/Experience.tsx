"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";

const ENTRIES = [
  {
    org: "Wealth Capital Connections",
    role: "Software Engineer Intern",
    date: "Jan 2026 – Present",
    bullet: "Built a scraping pipeline that cut the team's research time by 4 hours every week.",
    color: "#7755ff",
    light: "#c4b5fd",
    peak: "#ddd6fe",
    nearWhite: "#f0eeff",
    settled: "#aa88ff",
    logo: "/updatedlogo.png" as string | null,
    right: true,
  },
  {
    org: "Avis Car Rental",
    role: "Software Analyst",
    date: "Jan 2025 – Dec 2025",
    bullet: "Rewrote internal CLI tooling in Bash — streamlined fleet operations across multiple locations.",
    color: "#2288ff",
    light: "#93c5fd",
    peak: "#bfdbfe",
    nearWhite: "#eef4ff",
    settled: "#66aaff",
    logo: "/logo-avis.png" as string | null,
    right: false,
  },
  {
    org: "Habitat for Humanity",
    role: "Software Engineer Intern",
    date: "Apr 2024 – Sep 2024",
    bullet: "Built front-end features and a document management system — saved the team 3 hours of admin work every week.",
    color: "#ff7700",
    light: "#fed7aa",
    peak: "#ffe4cc",
    nearWhite: "#fff4ee",
    settled: "#ffaa44",
    logo: "/logo-habitat.jpg" as string | null,
    right: true,
  },
];

type Entry = typeof ENTRIES[number];

const PAD_T  = 40;
const STEP   = 175;
const H      = PAD_T + (ENTRIES.length - 1) * STEP + 200;
const CONN_W = 22;

const SCRAMBLE_CHARS = "#@$%&*+=";

const entryCSS = ENTRIES.map((e, i) => `
  @keyframes crossbar-morph-${i} {
    0%   { background: #ffffff; transform: scaleY(1);   }
    33%  { background: #ffffff; transform: scaleY(2);   }
    65%  { background: #cccccc; transform: scaleY(1.3); }
    100% { background: #cccccc; transform: scaleY(1.3); }
  }
  .experience-entry-${i}:hover .experience-crossbar {
    animation: crossbar-morph-${i} 600ms ease-out 1 forwards;
  }

  @keyframes logo-shimmer-${i} {
    0%   { box-shadow: none; }
    33%  { box-shadow: 0 0 12px 3px ${e.nearWhite}cc, 0 0 0 2px ${e.nearWhite}aa; }
    65%  { box-shadow: 0 0 8px 2px ${e.color}77, 0 0 0 1.5px ${e.light}88; }
    100% { box-shadow: 0 0 5px 1px ${e.color}55, 0 0 0 1px ${e.color}44; }
  }
  .experience-entry-${i}:hover .experience-logo {
    animation: logo-shimmer-${i} 600ms ease-out 1 forwards;
  }

  @keyframes role-glow-${i} {
    0%   { text-shadow: none; }
    50%  { text-shadow: 0 0 14px #ffffffcc, 0 0 28px #ffffff44; }
    100% { text-shadow: 0 0 8px #ffffff77; }
  }
  .experience-entry-${i}:hover .experience-role {
    animation: role-glow-${i} 1s ease-in-out 1 forwards;
  }
`).join("");

const entranceCSS = `
  /* Heading */
  [data-exp-heading] {
    opacity: 0;
    transform: translateY(20px);
    will-change: transform, opacity;
    transition: opacity 400ms ease-out, transform 400ms ease-out;
  }
  [data-exp-heading].exp-in {
    opacity: 1;
    transform: none;
  }

  /* Center line draw-down */
  [data-exp-line] {
    transform-origin: top center;
    transform: scaleY(0);
    will-change: transform;
    transition: transform 800ms ease-out;
  }
  [data-exp-line].exp-in {
    transform: scaleY(1);
  }

  /* Entry cards */
  [data-exp-card] {
    will-change: transform, opacity;
    transition: opacity 500ms ease-out, transform 500ms ease-out;
  }
  [data-exp-card][data-exp-right] { opacity: 0; transform: translateX(30px); }
  [data-exp-card][data-exp-left]  { opacity: 0; transform: translateX(-30px); }
  [data-exp-card].exp-in          { opacity: 1; transform: none; }

  /* Crossbar entrance (uses existing .experience-crossbar transition for timing) */
  [data-exp-crossbar] {
    transform: scaleX(0);
    will-change: transform;
  }
  [data-exp-crossbar].exp-in { transform: scaleX(1); }
`;

function LogoBox({ src, className }: { src: string | null; className?: string }) {
  return (
    <div className={className} style={{
      width: 56, height: 56, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0a0a0a",
      overflow: "hidden",
      position: "relative",
      transition: "box-shadow 0.6s ease-out",
    }}>
      {src ? (
        <Image src={src} alt="company logo" fill style={{ objectFit: "cover" }} />
      ) : (
        <span style={{ fontSize: 9, color: "#444", fontFamily: "var(--font-mono)" }}>logo</span>
      )}
    </div>
  );
}

function EntryCard({ e, i, y }: { e: Entry; i: number; y: number }) {
  const [orgDisplay, setOrgDisplay]       = useState(e.org);
  const [bulletDisplay, setBulletDisplay] = useState(e.bullet);
  const orgTimers    = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bulletTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function scrambleOrg() {
    orgTimers.current.forEach(clearTimeout);
    orgTimers.current = [];
    const text = e.org;
    const STAGGER    = 50;
    const FRAMES     = 2;
    const FRAME_TIME = 50;
    for (let ci = 0; ci < text.length; ci++) {
      if (text[ci] === " ") continue;
      const start = ci * STAGGER;
      for (let f = 0; f < FRAMES; f++) {
        const t = setTimeout(() => {
          setOrgDisplay(cur => {
            const arr = [...cur];
            arr[ci] = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            return arr.join("");
          });
        }, start + f * FRAME_TIME);
        orgTimers.current.push(t);
      }
      const resolve = setTimeout(() => {
        setOrgDisplay(cur => {
          const arr = [...cur];
          arr[ci] = text[ci];
          return arr.join("");
        });
      }, start + FRAMES * FRAME_TIME);
      orgTimers.current.push(resolve);
    }
  }

  function revealBullet() {
    bulletTimers.current.forEach(clearTimeout);
    bulletTimers.current = [];
    const text = e.bullet;
    const charDelay = 600 / text.length;
    setBulletDisplay("");
    for (let ci = 0; ci < text.length; ci++) {
      const t = setTimeout(() => {
        setBulletDisplay(text.slice(0, ci + 1));
      }, ci * charDelay);
      bulletTimers.current.push(t);
    }
  }

  function resetAll() {
    orgTimers.current.forEach(clearTimeout);
    bulletTimers.current.forEach(clearTimeout);
    orgTimers.current = [];
    bulletTimers.current = [];
    setOrgDisplay(e.org);
    setBulletDisplay(e.bullet);
  }

  return (
    <div
      className={`experience-entry experience-entry-${i}`}
      onMouseEnter={() => { scrambleOrg(); revealBullet(); }}
      onMouseLeave={resetAll}
    >
      {/* Crossbar — data-exp-crossbar for entrance animation */}
      <div
        className="experience-crossbar"
        data-exp-crossbar=""
        style={{
          position: "absolute",
          left: `calc(50% - ${CONN_W}px)`,
          top: y - 7,
          width: CONN_W * 2,
          height: 14,
          background: "#ffffff",
          zIndex: 4,
        }}
      />

      {/* Card — data-exp-card + direction for entrance animation */}
      <div
        data-exp-card=""
        {...(e.right ? { "data-exp-right": "" } : { "data-exp-left": "" })}
        style={{
          position: "absolute",
          ...(e.right
            ? { left: `calc(50% + ${CONN_W + 20}px)` }
            : { right: `calc(50% + ${CONN_W + 20}px)` }
          ),
          top: y - 8,
          width: "clamp(280px, 30vw, 380px)",
          minHeight: "clamp(280px, 30vw, 380px)",
          padding: 20,
          boxSizing: "border-box",
          zIndex: 5,
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          flexDirection: "row",
          marginBottom: 6,
        }}>
          <LogoBox src={e.logo} className="experience-logo" />
          <div style={{ flex: 1, textAlign: "left" }}>
            <div className="experience-role" style={{
              fontSize: "1.8rem", color: "#ffffff",
              fontFamily: "var(--font-pixel)",
              lineHeight: 1.35, marginBottom: 4,
              whiteSpace: "nowrap",
            }}>{e.role}</div>
            <div style={{
              fontSize: "1.55rem", color: "#aaaaaa",
              fontFamily: "var(--font-pixel)",
              lineHeight: 1.35,
              whiteSpace: "nowrap",
            }}>{orgDisplay}</div>
          </div>
        </div>
        <div style={{
          fontSize: "1.3rem", color: "#555555",
          fontFamily: "var(--font-pixel)",
          marginBottom: 8,
        }}>{e.date}</div>
        <p style={{
          fontSize: "1.35rem",
          color: "#777777",
          fontFamily: "var(--font-pixel)",
          lineHeight: 1.6,
          margin: 0,
          textAlign: "left",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          minHeight: "3.2em",
        }}>{bulletDisplay}</p>
      </div>
    </div>
  );
}

export default function Experience() {
  const ref          = useReveal<HTMLElement>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();

        // Heading — immediate
        el.querySelector("[data-exp-heading]")?.classList.add("exp-in");

        // Center line — slight delay so heading leads
        setTimeout(() => {
          el.querySelector("[data-exp-line]")?.classList.add("exp-in");
        }, 150);

        // Cards — 200ms stagger starting at 200ms
        el.querySelectorAll("[data-exp-card]").forEach((card, i) => {
          setTimeout(() => card.classList.add("exp-in"), 200 + i * 200);
        });

        // Crossbars — 300ms after their card
        el.querySelectorAll("[data-exp-crossbar]").forEach((bar, i) => {
          setTimeout(() => bar.classList.add("exp-in"), 500 + i * 200);
        });
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="experience" ref={ref} className="reveal px-8 md:px-16 py-20" aria-label="Experience">
      <style>{`
        ${entryCSS}
        ${entranceCSS}

        .experience-crossbar {
          transition: background 0.4s ease-out, transform 0.4s ease-out;
        }
        .experience-logo {
          transition: box-shadow 0.5s ease-out;
        }
        .experience-role {
          transition: text-shadow 0.5s ease-out;
        }

        @keyframes line-stutter {
          0%     { opacity: 1; }
          94%    { opacity: 1; }
          94.4%  { opacity: 0.15; }
          94.8%  { opacity: 1; }
          95.2%  { opacity: 0.15; }
          95.6%  { opacity: 1; }
          96%    { opacity: 0.15; }
          96.4%  { opacity: 1; }
          100%   { opacity: 1; }
        }
        .experience-line {
          animation: line-stutter 8s infinite;
        }
      `}</style>

      <div ref={containerRef}>

        {/* Heading — entrance wrapper */}
        <div data-exp-heading="" className="mb-10">
          <DotMatrixText text="experience" dotSize={7} color="#ffffff" animate />
        </div>

        {/* ── Desktop timeline ── */}
        <div className="hidden md:block relative w-full" style={{ height: H }}>

          {/* Center line */}
          <div
            className="experience-line"
            data-exp-line=""
            style={{
              position: "absolute",
              left: "calc(50% - 1px)",
              top: 0,
              width: 2,
              height: H,
              background: "#222222",
              zIndex: 1,
            }}
          />

          {ENTRIES.map((e, i) => {
            const y = PAD_T + i * STEP;
            return <EntryCard key={i} e={e} i={i} y={y} />;
          })}

        </div>

        {/* ── Mobile fallback ── */}
        <div className="relative pl-8 flex flex-col gap-10 max-w-2xl md:hidden">
          <div className="tl-line" />
          {ENTRIES.map((e, i) => (
            <div key={i} className="relative">
              <div style={{
                position: "absolute", left: -4, top: 6,
                width: 8, height: 8, background: "#ffffff",
              }} />
              <div className="flex flex-col gap-1">
                <span style={{ fontSize: "1.1rem", color: "#ffffff", fontFamily: "var(--font-mono)" }}>{e.role}</span>
                <span style={{ fontSize: "0.95rem", color: "#aaaaaa", fontFamily: "var(--font-mono)" }}>{e.org}</span>
                <span style={{ fontSize: "0.75rem", color: "#555555", fontFamily: "var(--font-mono)" }}>{e.date}</span>
                <p style={{ fontSize: "0.85rem", color: "#777", fontFamily: "var(--font-pixel)", lineHeight: 1.6, marginTop: 4 }}>{e.bullet}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
