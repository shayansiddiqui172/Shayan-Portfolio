"use client";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";
import MorphText from "./MorphText";

const LINKS = [
  { label: "email",    href: "mailto:shayansiddiqui172@gmail.com",              display: "shayansiddiqui172@gmail.com"  },
  { label: "github",   href: "https://github.com/shayansiddiqui172",            display: "github.com/shayansiddiqui172" },
  { label: "linkedin", href: "https://linkedin.com/in/shayansiddiqui172",       display: "linkedin.com/in/shayansiddiqui172" },
];

export default function Contact() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="contact" ref={ref} className="reveal px-8 md:px-16 py-20 pb-32" aria-label="Contact">
      <DotMatrixText text="contact" dotSize={7} color="#ffffff" className="mb-10" animate />
      <div className="flex flex-col gap-4 max-w-xs">
        {LINKS.map((l, i) => (
          <div key={l.label} className="flex items-center gap-5">
            <MorphText style={{ fontSize: "var(--fs-meta)", fontFamily: "var(--font-pixel)" }} className="text-[#404040] w-16" delay={i * 100}>{l.label}</MorphText>
            <a
              href={l.href}
              style={{ fontSize: "var(--fs-small)", fontFamily: "var(--font-pixel)" }}
              className="text-[#fff] hover:text-[#00ffa8] transition-colors duration-150"
            >
              <MorphText delay={i * 100 + 80}>{l.display}</MorphText>
            </a>
          </div>
        ))}
      </div>
      <p style={{ fontSize: "var(--fs-meta)" }} className="text-[#1a1a1a] mt-24">
        © {new Date().getFullYear()} Shayan Siddiqui
      </p>
    </section>
  );
}
