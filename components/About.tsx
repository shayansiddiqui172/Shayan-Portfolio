"use client";
import { useReveal } from "@/hooks/useReveal";
import DotMatrixText from "./DotMatrixText";
import MorphText from "./MorphText";

export default function About() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="about" ref={ref} className="reveal px-8 md:px-16 py-20" aria-label="About">
      <DotMatrixText text="biography" dotSize={7} color="#ffffff" className="mb-10" animate />
      <p style={{ fontSize: "calc(var(--fs-body) * 0.88)", fontFamily: "var(--font-receipt)" }} className="text-[#fff] leading-relaxed max-w-5xl">
        <MorphText>{"I'm a software engineering student at Wilfrid Laurier University, expected to graduate May 2027. I build across the full stack — from HTTP servers in Go to production web apps — with a focus on systems-level thinking and clean product execution. Currently interning as a Software Engineer at Wealth Capital Connections."}</MorphText>
      </p>
    </section>
  );
}
