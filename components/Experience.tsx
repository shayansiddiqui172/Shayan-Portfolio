"use client";
import { useReveal } from "@/hooks/useReveal";

const ENTRIES = [
  { org: "Company Name",     role: "Role",   period: "Year – Year",    desc: "[Description]" },
  { org: "Institution Name", role: "Degree", period: "Year – Present", desc: "[Description]" },
];

export default function Experience() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="experience" ref={ref} className="reveal border-b border-[#1a1a1a] px-8 md:px-16 py-20" aria-label="Experience">
      <p className="section-label">/ experience</p>
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
