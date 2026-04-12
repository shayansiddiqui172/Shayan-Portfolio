"use client";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";

const ENTRIES = [
  { org: "Company Name",     role: "Role",   period: "Year – Year",    desc: "[Description]" },
  { org: "Institution Name", role: "Degree", period: "Year – Present", desc: "[Description]" },
];

export default function Experience() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="experience" ref={ref} className="reveal border-b border-[#1a1a1a] px-8 md:px-16 py-20" aria-label="Experience">
      <DotMatrixText text="/ experience" dotSize={5} color="#404040" className="mb-10" />
      <div className="relative pl-8 flex flex-col gap-12 max-w-xl">
        <div className="tl-line" />
        {ENTRIES.map((e, i) => (
          <div key={i} className="relative">
            <div className="tl-dot" />
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span style={{ fontSize: "var(--fs-small)" }} className="text-[#fff] font-bold">{e.org}</span>
                <span style={{ fontSize: "var(--fs-small)" }} className="text-[#00ffa8]">— {e.role}</span>
              </div>
              <span style={{ fontSize: "var(--fs-meta)" }} className="text-[#404040]">{e.period}</span>
              <p style={{ fontSize: "var(--fs-meta)" }} className="text-[#404040] mt-2 leading-relaxed">{e.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
