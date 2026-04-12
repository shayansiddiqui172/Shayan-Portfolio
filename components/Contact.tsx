"use client";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";

const LINKS = [
  { label: "email",    href: "mailto:[email]",                     display: "[email]"    },
  { label: "github",   href: "https://github.com/[username]",       display: "[github]"   },
  { label: "linkedin", href: "https://linkedin.com/in/[username]",  display: "[linkedin]" },
];

export default function Contact() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="contact" ref={ref} className="reveal px-8 md:px-16 py-20 pb-32" aria-label="Contact">
      <DotMatrixText text="/ contact" dotSize={5} color="#404040" className="mb-10" />
      <div className="flex flex-col gap-4 max-w-xs">
        {LINKS.map(l => (
          <div key={l.label} className="flex items-center gap-5">
            <span style={{ fontSize: "var(--fs-meta)" }} className="text-[#404040] w-16">{l.label}</span>
            <a
              href={l.href}
              style={{ fontSize: "var(--fs-small)" }}
              className="text-[#fff] hover:text-[#00ffa8] transition-colors duration-150"
            >
              {l.display}
            </a>
          </div>
        ))}
      </div>
      <p style={{ fontSize: "var(--fs-meta)" }} className="text-[#1a1a1a] mt-24">
        © {new Date().getFullYear()} Your Name
      </p>
    </section>
  );
}
