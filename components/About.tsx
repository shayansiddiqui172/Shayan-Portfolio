"use client";
import { useReveal } from "@/hooks/useReveal";

export default function About() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="about" ref={ref} className="reveal border-b border-[#1a1a1a] px-8 md:px-16 py-20" aria-label="About">
      <p className="section-label">/ biography</p>
      <p style={{ fontSize: "var(--fs-body)" }} className="text-[#fff] leading-relaxed max-w-xl">
        [Bio goes here]
      </p>
    </section>
  );
}
