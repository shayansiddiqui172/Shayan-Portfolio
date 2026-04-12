"use client";
import { useEffect, useState, useRef, useCallback } from "react";

const ROW1 = [
  { key: "^H", label: "HOME",         href: "#hero"       },
  { key: "^P", label: "PROJECTS",     href: "#projects"   },
  { key: "^T", label: "TECH",         href: "#stack"      },
  { key: "^C", label: "CONTACT",      href: "#contact"    },
];

const ROW2 = [
  { key: "^B", label: "BIO",          href: "#about"      },
  { key: "^E", label: "EXPERIENCE",   href: "#experience" },
  { key: "^A", label: "ABOUT",        href: "#hobbies"    },
  { key: "^?", label: "HELP",         href: null          },
];

const NOISE = ["+", ",", ".", "=", "/", "c", "x", "X", "p", "#", "%", "&"];
function randChar() { return NOISE[Math.floor(Math.random() * NOISE.length)]; }

/* ── Scramble text hook: cycles random chars then resolves left-to-right ── */
function useScramble(text: string, active: boolean, delay: number) {
  const [display, setDisplay] = useState("");
  const rafRef = useRef(0);

  useEffect(() => {
    if (!active) { setDisplay(""); return; }

    const DURATION = 600;   // total scramble time in ms
    const start = performance.now() + delay;

    function tick() {
      const now = performance.now();
      const elapsed = now - start;

      if (elapsed < 0) {
        // Still in delay — show noise
        setDisplay(Array.from({ length: text.length }, () => randChar()).join(""));
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min(1, elapsed / DURATION);
      // Characters resolve left-to-right with some easing
      const resolved = Math.floor(progress * progress * text.length);
      const out = text.split("").map((ch, i) => {
        if (i < resolved) return ch;
        if (ch === " ") return " ";
        return Math.random() < progress * 0.4 ? ch : randChar();
      }).join("");

      setDisplay(out);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [text, active, delay]);

  return display;
}

/* ── Entry with scramble ── */
function ScrambleEntry({ k, label, href, onClick, active, delay }: {
  k: string; label: string; href: string | null; onClick?: () => void;
  active: boolean; delay: number;
}) {
  const keyText   = useScramble(k, active, delay);
  const labelText = useScramble(label, active, delay + 100);

  const inner = (
    <span style={{ display: "inline-flex", gap: "0.5em", alignItems: "center" }}>
      <span style={{
        background: "#fff",
        color: "#000",
        padding: "0.05em 0.25em",
        lineHeight: "1.2",
        minWidth: `${k.length}ch`,
      }}>{active ? keyText : "\u00A0".repeat(k.length)}</span>
      <span>{active ? labelText : "\u00A0".repeat(label.length)}</span>
    </span>
  );

  if (href) {
    return (
      <a href={href} style={{ color: "inherit", textDecoration: "none" }}>
        {inner}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      style={{ color: "inherit", background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit", letterSpacing: "inherit", textAlign: "left" }}
    >
      {inner}
    </button>
  );
}

export default function KeyboardShortcuts() {
  const [legendOpen, setLegendOpen] = useState(false);
  const [pendingG, setPendingG]     = useState(false);
  const [animActive, setAnimActive] = useState(false);

  // Listen for hero animation completion
  useEffect(() => {
    const show = () => setAnimActive(true);
    window.addEventListener("hero-anim-done", show);
    return () => window.removeEventListener("hero-anim-done", show);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const go = (id: string) =>
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const k = e.key.toLowerCase();

      if (k === "?") { setLegendOpen(v => !v); return; }

      if (pendingG) {
        clearTimeout(timer);
        setPendingG(false);
        const map: Record<string, string> = {
          h: "hero", b: "about", e: "experience",
          p: "projects", t: "stack", a: "hobbies", c: "contact",
        };
        if (map[k]) go(map[k]);
        return;
      }
      if (k === "g") {
        setPendingG(true);
        timer = setTimeout(() => setPendingG(false), 800);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); clearTimeout(timer); };
  }, [pendingG]);

  return (
    <>
      <nav
        aria-label="Keyboard navigation"
        className="hidden md:grid"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          zIndex: 50,
          fontFamily: "var(--font-pixel)",
          fontSize: "clamp(20px, 1.6vw, 28px)",
          lineHeight: "1.4",
          color: "#fff",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          padding: "0 2rem 0.4rem 2rem",
          opacity: animActive ? 1 : 0,
          transform: animActive ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        {ROW1.map(({ key, label, href }, i) => (
          <ScrambleEntry
            key={key} k={key} label={label} href={href}
            active={animActive} delay={i * 80}
          />
        ))}
        {ROW2.map(({ key, label, href }, i) => (
          <ScrambleEntry
            key={key} k={key} label={label} href={href}
            active={animActive} delay={i * 80 + 40}
            onClick={href === null ? () => setLegendOpen(v => !v) : undefined}
          />
        ))}
      </nav>

      {legendOpen && (
        <div
          className="hidden md:block"
          style={{
            position: "fixed",
            bottom: "80px",
            left: "2rem",
            zIndex: 50,
            fontFamily: "var(--font-pixel)",
            fontSize: "clamp(20px, 1.6vw, 28px)",
            lineHeight: "1.5",
            color: "#fff",
          }}
        >
          {[
            ["g+h", "HOME"],
            ["g+b", "BIO"],
            ["g+e", "EXPERIENCE"],
            ["g+p", "PROJECTS"],
            ["g+t", "TECHNOLOGIES"],
            ["g+a", "ABOUT"],
            ["g+c", "CONTACT"],
            ["?",   "TOGGLE HELP"],
          ].map(([k, action]) => (
            <div key={k} style={{ display: "flex", gap: "0.6em" }}>
              <span style={{ minWidth: "3.5ch" }}>{k}</span>
              <span>{action}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
