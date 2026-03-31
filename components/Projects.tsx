"use client";
import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";

const PROJECTS = [
  { name: "Project Name", year: "2024", desc: "[Description]", tech: ["Tech 1", "Tech 2", "Tech 3"] },
  { name: "Project Name", year: "2023", desc: "[Description]", tech: ["Tech 1", "Tech 2"] },
  { name: "Project Name", year: "2023", desc: "[Description]", tech: ["Tech 1", "Tech 2", "Tech 3"] },
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
          <span style={{ fontSize: "var(--fs-meta)" }} className="text-[#404040]">{p.year}</span>
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
    <section id="projects" ref={ref} className="reveal border-b border-[#1a1a1a] px-8 md:px-16 py-20" aria-label="Projects">
      <p className="section-label">/ projects</p>
      <div className="max-w-xl">
        {PROJECTS.map((p, i) => <Card key={i} p={p} />)}
        <div className="border-t border-[#1a1a1a]" />
      </div>
    </section>
  );
}
