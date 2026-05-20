"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";

const PROJECTS = [
  {
    name: "CartSniper",
    year: "2026",
    subtitle: "HACKCANADA",
    desc: "Built at HackCanada 2026 — a multimodal grocery price intelligence app using Gemini Vision AI and barcode scanning to compare prices across 10+ Canadian retailers in real time.",
    tech: ["TypeScript", "React", "Node.js", "Firebase", "Gemini"],
    url: "https://cart-sniper.vercel.app/",
    screenshot: "/projects/cartsniper.png",
  },
  {
    name: "Tab Organizer",
    year: "2026",
    subtitle: "FEATURED BY GOOGLE",
    note: "600+ installs",
    desc: "Chrome extension featured by Google on the Chrome Web Store. Custom classification algorithm auto-groups 100+ tabs with 95%+ accuracy. Session persistence and crash recovery via chrome.storage API.",
    tech: ["JavaScript", "Chrome APIs"],
    url: "https://chromewebstore.google.com/detail/tab-it/ibjlmaiklkfchnggbjlkhjaafchmfcnb",
    screenshot: "/projects/tabphoto.png",
  },
  {
    name: "Content Engine",
    year: "2026",
    subtitle: "CLIENT PROJECT",
    desc: "End-to-end LinkedIn content intelligence pipeline built for a VC firm. Scrapes engagement data, runs AI analysis via Claude API, and outputs to structured Excel reports and an interactive dashboard.",
    tech: ["Python", "Claude API", "PhantomBuster", "Apify", "Vercel"],
    url: "https://content-engine-52ha.vercel.app/",
    screenshot: "/projects/contentengine.png",
  },
  {
    name: "Private Cloud",
    year: "2026",
    subtitle: "SYSTEMS PROJECT",
    desc: "Personal cloud file server running on my own hardware — an alternative to services like Google Drive or Dropbox, built entirely from scratch. Go on a raw TCP HTTP/1.1 server, no frameworks. Features JWT auth, SQLite-backed virtual folders, file versioning, and a Finder-style web UI. Deployed via Cloudflare Tunnel with no exposed home IP.",
    tech: ["Go", "TCP/IP", "SQLite", "JWT", "Cloudflare", "Linux"],
    url: "https://github.com/shayansiddiqui172/Private-Cloud",
    screenshot: "/projects/privatecloud.png",
  },
  {
    name: "StatLine",
    year: "2025",
    subtitle: "FULL STACK WEB APP",
    desc: "Full-stack NBA analytics platform with real-time data visualizations, sub-second page loads via Next.js SSR, and PostgreSQL optimized for 500+ players through strategic indexing and Prisma ORM.",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind"],
    url: "https://sport-analytics-platform.vercel.app/",
    screenshot: "/projects/statline.png",
  },
];

type Project = typeof PROJECTS[number];

const INFO_STYLE: React.CSSProperties = {
  fontSize: "1.2rem",
  letterSpacing: "0.05em",
  lineHeight: 1.6,
  fontFamily: "var(--font-pixel)",
};

function PreviewFrame({ src }: { src: string }) {
  return (
    <div style={{
      border: "1px solid #2a2a2a",
      background: "#0a0a0a",
      boxShadow: "0 0 0 1px #000, 0 10px 40px rgba(0,0,0,0.6)",
      position: "relative",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 8px",
        borderBottom: "1px solid #1a1a1a",
        background: "#111",
      }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#333" }} />
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#333" }} />
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#333" }} />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" style={{ width: "100%", display: "block" }} />
    </div>
  );
}

function ProjectPreview({ src, show, width = 720, slide = 260, right = -60 }: { src: string; show: boolean; width?: number; slide?: number; right?: number }) {
  const NUM     = 7;       // 1 main + 6 ghosts stacked behind
  const OFF_X   = 7;
  const OFF_Y   = 4;
  const STAGGER = 45;
  const SLIDE   = slide;    // px offset when hidden (slid off right)
  const DUR     = 700;
  const EASE    = "cubic-bezier(0.16, 1, 0.3, 1)";

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        right,
        top: "50%",
        transform: "translateY(-50%)",
        width,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {Array.from({ length: NUM }).map((_, i) => {
        // i=0 → front (main). Higher i sits further back/down-right.
        const enterDelay = i * STAGGER;                // cascade front→back
        const exitDelay  = (NUM - 1 - i) * STAGGER;    // reverse: ghosts leave first
        const delay      = show ? enterDelay : exitDelay;
        const tx         = (show ? 0 : SLIDE) + i * OFF_X;
        const ty         = i * OFF_Y;
        const op         = show ? (i === 0 ? 1 : 0.8) : 0;
        const isMain     = i === 0;

        return (
          <div
            key={i}
            style={{
              position: isMain ? "relative" : "absolute",
              top:   isMain ? undefined : 0,
              left:  isMain ? undefined : 0,
              width: "100%",
              zIndex: NUM - i,
              transform: `translate(${tx}px, ${ty}px)`,
              opacity: op,
              transition: `transform ${DUR}ms ${EASE} ${delay}ms, opacity ${DUR}ms ${EASE} ${delay}ms`,
              willChange: "transform, opacity",
            }}
          >
            <PreviewFrame src={src} />
          </div>
        );
      })}
    </div>
  );
}

function ProjectRow({ p, index, isActive, typedCount, allGreen, onEnter, onLeave }: {
  p: Project;
  index: number;
  isActive: boolean;
  typedCount: number;
  allGreen: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const screenshot = "screenshot" in p ? (p as typeof p & { screenshot?: string }).screenshot : undefined;
  return (
    <div
      className="relative"
      data-project-row={index}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {screenshot && (
        <>
          <div className="hidden md:block">
            <ProjectPreview src={screenshot} show={isActive} />
          </div>
          <div className="md:hidden">
            <ProjectPreview src={screenshot} show={isActive} width={200} slide={150} right={-16} />
          </div>
        </>
      )}
      <a
        href={p.url.startsWith("http") ? p.url : `https://${p.url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block py-6 md:py-11"
        style={{ zIndex: 1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[0.7fr_1.4fr_auto] gap-4 md:gap-6 items-start">
          {/* LEFT — project name column */}
          <div className="min-w-0">
            <div className="mb-4">
              <DotMatrixText text="/ PR NAME" dotSize={2} color="#888888" />
            </div>

            {/* Project name — always per-char to avoid canvas unmount/remount flash */}
            <div
              className="mb-5"
              style={{
                display: "inline-flex",
                flexWrap: "wrap",
                alignItems: "flex-start",
                gap: "6px 18px",
                background: allGreen ? "#00ff88" : "transparent",
                padding: allGreen ? "2px 4px" : 0,
                transition: "background 80ms, padding 80ms",
              }}
            >
              {(() => {
                const words = p.name.split(" ");
                let offset = 0;
                return words.map((word, wi) => {
                  const wordStart = offset;
                  offset += word.length + 1;
                  return (
                    <span key={wi} style={{ display: "inline-flex", alignItems: "flex-start" }}>
                      {word.split("").map((ch, ci) => {
                        const charIdx   = wordStart + ci;
                        const isTyping  = isActive && typedCount > 0;
                        const shown     = !isTyping || charIdx < typedCount;
                        const isCurrent = isTyping && charIdx === typedCount - 1;
                        const highlight = allGreen || isCurrent;
                        return (
                          <span
                            key={ci}
                            style={{
                              display: "inline-block",
                              visibility: shown ? "visible" : "hidden",
                              background: highlight ? "#00ff88" : "transparent",
                              marginRight: ci < word.length - 1 ? 6 : 0,
                            }}
                          >
                            {/* color always #ffffff — invert via CSS so canvas never repaints */}
                            <DotMatrixText
                              text={ch}
                              dotSize={3}
                              color="#ffffff"
                              fine
                              style={{ filter: highlight ? "invert(1)" : "none" }}
                            />
                          </span>
                        );
                      })}
                    </span>
                  );
                });
              })()}
            </div>

            <div className="flex flex-col gap-0">
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "var(--fs-meta)", fontFamily: "var(--font-receipt)", color: "#555555" }}>
                  {p.year}
                </span>
                <span style={{ width: 20, height: 20, background: "#00ff88", display: "inline-block", flexShrink: 0 }} />
                {p.subtitle && (
                  <DotMatrixText text={p.subtitle} dotSize={1.5} color="#555555" fine />
                )}
              </div>
              {"note" in p && (p as typeof p & { note?: string }).note && (
                <div style={{ paddingLeft: 107 }}>
                  <DotMatrixText text={(p as typeof p & { note: string }).note} dotSize={1.5} color="#555555" fine />
                </div>
              )}
            </div>
          </div>

          {/* CENTER — info column */}
          <div className="min-w-0">
            <div className="mb-4">
              <DotMatrixText text="/ INFO" dotSize={2} color="#888888" />
            </div>
            <p style={{ ...INFO_STYLE, color: "#777777", marginBottom: "0.6rem" }}>
              {p.desc}
            </p>
            <p style={{ ...INFO_STYLE, marginBottom: "0.4rem" }}>
              <span style={{ color: "#00ff88" }}>TECH:</span>{" "}
              <span style={{ color: "#999999" }}>{p.tech.join(", ")}</span>
            </p>
          </div>

          {/* RIGHT — visit site */}
          <div className="self-center whitespace-nowrap hidden md:block">
            <span style={{ fontSize: "var(--fs-small)", color: "#ffffff", fontFamily: "var(--font-receipt)" }}>
              VISIT SITE →
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}

export default function Projects() {
  const ref = useReveal<HTMLElement>();
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [typedCount, setTypedCount] = useState(0);
  const [allGreen, setAllGreen] = useState(false);
  const timersRef     = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef       = useRef<HTMLDivElement>(null);
  const activeRef     = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("proj-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const startAnimation = useCallback((index: number) => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setTypedCount(0);
    setAllGreen(false);
    setActiveProject(index);
    activeRef.current = index;
    const name = PROJECTS[index].name;
    name.split("").forEach((_, i) => {
      const t = setTimeout(() => {
        setTypedCount(i + 1);
        if (i === name.length - 1) setAllGreen(true);
      }, (i + 1) * 40);
      timersRef.current.push(t);
    });
  }, []);

  const stopAnimation = useCallback(() => {
    if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setTypedCount(0);
    setAllGreen(false);
    setActiveProject(null);
    activeRef.current = null;
  }, []);

  // Mobile only: when a project sits at the viewport center for >0.75s, trigger
  // the same active state desktop uses on hover (slides the small preview in).
  useEffect(() => {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    const list = listRef.current;
    if (!list) return;
    const rows = list.querySelectorAll<HTMLElement>("[data-project-row]");
    if (!rows.length) return;

    let dwellTimer: ReturnType<typeof setTimeout> | null = null;
    let pendingIdx: number | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.getAttribute("data-project-row"));
          if (entry.isIntersecting) {
            pendingIdx = idx;
            if (dwellTimer) clearTimeout(dwellTimer);
            dwellTimer = setTimeout(() => {
              if (pendingIdx === idx) startAnimation(idx);
            }, 250);
          } else {
            if (pendingIdx === idx) {
              if (dwellTimer) { clearTimeout(dwellTimer); dwellTimer = null; }
              pendingIdx = null;
            }
            if (activeRef.current === idx) stopAnimation();
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    rows.forEach((row) => observer.observe(row));
    return () => {
      observer.disconnect();
      if (dwellTimer) clearTimeout(dwellTimer);
    };
  }, [startAnimation, stopAnimation]);

  return (
    <section
      id="projects"
      ref={ref}
      className="reveal px-8 md:px-16 py-20"
      aria-label="Projects"
    >
      <DotMatrixText
        text="projects"
        dotSize={7}
        color="#ffffff"
        className="mb-10"
        animate
      />
      <div ref={listRef} className="proj-row">
        {PROJECTS.map((p, i) => (
          <ProjectRow
            key={i}
            p={p}
            index={i}
            isActive={activeProject === i}
            typedCount={activeProject === i ? typedCount : 0}
            allGreen={activeProject === i ? allGreen : false}
            onEnter={() => {
                if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = setTimeout(() => startAnimation(i), 250);
              }}
            onLeave={stopAnimation}
          />
        ))}
      </div>
    </section>
  );
}
