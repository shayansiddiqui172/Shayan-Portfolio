"use client";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";

const CATEGORIES = [
  { label: "languages",    items: ["Python", "Java", "JavaScript", "TypeScript", "C", "Go", "Swift"] },
  { label: "frameworks",   items: ["React", "Next.js", "Node.js", "Express.js"] },
  { label: "databases",    items: ["PostgreSQL", "MongoDB", "Firebase", "Supabase", "SQLite"] },
  { label: "cloud/devops", items: ["AWS", "Azure", "Docker", "Kubernetes", "CI/CD", "Vercel"] },
  { label: "tools",        items: ["Git", "Bash", "Linux", "Chrome APIs"] },
];

export default function Stack() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="stack" ref={ref} className="reveal px-8 md:px-16 py-20" aria-label="Technologies">
      <DotMatrixText text="technologies" dotSize={7} color="#ffffff" className="mb-10" animate />
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
