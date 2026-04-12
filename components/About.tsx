"use client";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";

export default function About() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="about" ref={ref} className="reveal px-8 md:px-16 py-20" aria-label="About">
      <DotMatrixText text="biography" dotSize={7} color="#ffffff" className="mb-10" />
      <p style={{ fontSize: "var(--fs-body)" }} className="text-[#fff] leading-relaxed max-w-xl">
        [Bio goes here]
      </p>
    </section>
  );
}
