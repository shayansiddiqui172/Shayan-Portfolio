"use client";
import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";

const PROJECTS = [
  {
    name: "CartSniper",
    year: "HackCanada 2026",
    desc: "Multimodal grocery recognition system using Gemini Vision AI and barcode scanning to compare prices across 10+ Canadian retailers in under 1 second.",
    tech: ["TypeScript", "React", "Node.js", "Firebase", "Gemini"],
  },
  {
    name: "Tab Organizer Extension",
    year: "200+ installs",
    desc: "Chrome extension with custom tab classification algorithm, auto-grouping 100+ tabs with 95%+ accuracy. Session persistence and crash recovery via chrome.storage API.",
    tech: ["JavaScript", "Chrome APIs"],
  },
  {
    name: "HTTP/1.1 Server & Private Cloud",
    year: "",
    desc: "HTTP/1.1 server built from scratch in Go without external frameworks. Self-hosted private cloud with streaming file I/O for multi-gigabyte transfers at constant memory overhead.",
    tech: ["Go", "TCP/IP", "Linux"],
  },
  {
    name: "StatLine",
    year: "",
    desc: "Full-stack NBA analytics platform with sub-second page loads. PostgreSQL optimized for 500+ players via strategic indexing, reducing query latency by 15%.",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Prisma"],
  },
];

function Card({ p }: { p: typeof PROJECTS[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-[#1a1a1a]">
      <button
        className="w-full flex items-center justify-between py-4 group text-left"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className="flex items-baseline gap-4">
          <span
            style={{ fontSize: "var(--fs-small)" }}
            className="text-[#fff] group-hover:text-[#00ffa8] transition-colors duration-150"
          >
            {p.name}
          </span>
          {p.year && (
            <span style={{ fontSize: "var(--fs-meta)" }} className="text-[#404040]">{p.year}</span>
          )}
        </div>
        <span
          className="text-[#404040] transition-transform duration-200"
          style={{ display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", fontSize: "var(--fs-meta)" }}
        >
          ↓
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? "300px" : "0" }}
      >
        <div className="pb-6 flex flex-col gap-3">
          <p style={{ fontSize: "var(--fs-meta)" }} className="text-[#404040] leading-relaxed max-w-lg">
            {p.desc}
          </p>
          <div className="flex flex-wrap gap-2">
            {p.tech.map(t => (
              <span
                key={t}
                style={{ fontSize: "var(--fs-meta)" }}
                className="text-[#404040] border border-[#1a1a1a] px-2 py-0.5"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="projects" ref={ref} className="reveal px-8 md:px-16 py-20" aria-label="Projects">
      <DotMatrixText text="projects" dotSize={7} color="#ffffff" className="mb-10" animate />
      <div className="max-w-xl">
        {PROJECTS.map((p, i) => <Card key={i} p={p} />)}
        <div className="border-t border-[#1a1a1a]" />
      </div>
    </section>
  );
}
