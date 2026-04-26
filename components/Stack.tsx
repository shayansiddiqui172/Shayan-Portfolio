"use client";
import { useEffect, useRef } from "react";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";

const CATEGORIES = [
  { label: "languages",    items: ["Python", "JavaScript", "TypeScript", "Go", "C", "Java", "Swift"], speed: 0.5  },
  { label: "frameworks",   items: ["React", "Next.js", "Node.js", "Express.js"],                      speed: 0.7  },
  { label: "databases",    items: ["PostgreSQL", "MongoDB", "Firebase", "Supabase", "SQLite"],         speed: 0.55 },
  { label: "cloud/devops", items: ["AWS", "Azure", "Docker", "Kubernetes", "CI/CD", "Vercel"],         speed: 0.45 },
];

function BeltCopy({ items }: { items: string[] }) {
  return (
    <div className="flex shrink-0 whitespace-nowrap">
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center">
          <span
            className="font-mono uppercase cursor-default"
            style={{ fontSize: "1.5rem", color: "#cccccc", fontFamily: "var(--font-receipt)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#00ff88"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#cccccc"; }}
          >
            {item}
          </span>
          <span className="font-mono mx-4" style={{ fontSize: "1.5rem", color: "#444444", fontFamily: "var(--font-receipt)" }}>·</span>
        </span>
      ))}
    </div>
  );
}

function Belt({ items, speed }: { items: string[]; speed: number }) {
  const ref = useRef<HTMLDivElement>(null);

  // Pad each copy to ≥12 items so every copy is wider than the 600px belt window.
  // Without this, short lists leave blank gaps before the next copy enters the window.
  const padded: string[] = [];
  while (padded.length < 12) padded.push(...items);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let pos = 0;
    let rafId = 0;

    const tick = () => {
      const halfWidth = el.scrollWidth / 2;
      if (halfWidth > 0) {
        pos += speed;
        if (pos >= halfWidth) pos -= halfWidth;
        el.style.transform = `translateX(${-pos}px)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [speed]);

  return (
    <div ref={ref} className="flex" style={{ willChange: "transform" }}>
      <BeltCopy items={padded} />
      <BeltCopy items={padded} />
    </div>
  );
}

export default function Stack() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="stack" ref={ref} className="reveal px-8 md:px-16 py-20" aria-label="Technologies">
      <DotMatrixText text="technologies" dotSize={7} color="#ffffff" className="mb-16" animate />

      <div className="flex flex-col gap-7 mx-auto pt-20 pb-8" style={{ width: "fit-content" }}>
        {CATEGORIES.map(cat => (
          <div key={cat.label} className="flex items-center gap-12">
            <span
              className="font-mono text-[#666666] text-right shrink-0"
              style={{ fontSize: "1.75rem", width: "190px", fontFamily: "var(--font-receipt)" }}
            >
              {cat.label}
            </span>

            <div
              className="relative overflow-hidden shrink-0"
              style={{
                width: "900px",
                maskImage: "linear-gradient(to right, transparent 0px, black 110px, black 790px, transparent 900px)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0px, black 110px, black 790px, transparent 900px)",
              }}
            >
              <Belt items={cat.items} speed={cat.speed} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
