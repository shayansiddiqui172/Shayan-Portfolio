"use client";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";

const CATEGORIES = [
  { label: "languages",  items: ["Language 1", "Language 2", "Language 3"] },
  { label: "frameworks", items: ["Framework 1", "Framework 2", "Framework 3"] },
  { label: "tools",      items: ["Tool 1", "Tool 2", "Tool 3"] },
  { label: "platforms",  items: ["Platform 1", "Platform 2", "Platform 3"] },
];

export default function Stack() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="stack" ref={ref} className="reveal border-b border-[#1a1a1a] px-8 md:px-16 py-20" aria-label="Technologies">
      <DotMatrixText text="/ technologies" dotSize={5} color="#404040" className="mb-10" />
      <div className="flex flex-col gap-5 max-w-xl">
        {CATEGORIES.map(cat => (
          <div key={cat.label} className="flex gap-6 items-baseline">
            <span className="text-[#404040] w-24 shrink-0" style={{ fontSize: "var(--fs-meta)" }}>
              {cat.label}
            </span>
            <div className="flex flex-wrap gap-2">
              {cat.items.map(item => (
                <span
                  key={item}
                  style={{ fontSize: "var(--fs-small)" }}
                  className="text-[#fff] border border-[#1a1a1a] px-3 py-1 hover:border-[#00ffa8] hover:text-[#00ffa8] transition-colors duration-150"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
