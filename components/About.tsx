"use client";
import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/hooks/useReveal";

const SCRAMBLE_NOISE = "+,./|~!@#%^&*=xXkK";

function AsciiBanner() {
  const preRef   = useRef<HTMLPreElement>(null);
  const stateRef = useRef({ text: "", started: false, rafId: 0 });
  const wrapRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/banner2.txt").then(r => r.text()).then(text => {
      stateRef.current.text = text;
    });
  }, []);

  // Trigger scramble when visible via IntersectionObserver
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !stateRef.current.started) {
          stateRef.current.started = true;
          if (stateRef.current.text) scramble(stateRef.current.text);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(wrap);
    return () => obs.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function scramble(text: string) {
    const pre = preRef.current;
    if (!pre) return;
    cancelAnimationFrame(stateRef.current.rafId);
    const DURATION = 700;
    const start = performance.now();
    const el = pre;

    function tick() {
      const progress = Math.min(1, (performance.now() - start) / DURATION);
      if (progress >= 1) { el.textContent = text; return; }
      const resolved = Math.floor(progress * progress * text.length);
      const out: string[] = new Array(text.length);
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === "\n" || ch === " " || i < resolved) { out[i] = ch; continue; }
        out[i] = Math.random() < progress * 0.4
          ? ch
          : SCRAMBLE_NOISE[Math.floor(Math.random() * SCRAMBLE_NOISE.length)];
      }
      el.textContent = out.join("");
      stateRef.current.rafId = requestAnimationFrame(tick);
    }

    stateRef.current.rafId = requestAnimationFrame(tick);
  }

  useEffect(() => () => cancelAnimationFrame(stateRef.current.rafId), []);

  return (
    <div ref={wrapRef}>
      <pre
        ref={preRef}
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-jetbrains)",
          fontSize: "0.17rem",
          lineHeight: 1,
          color: "#aaaaaa",
          margin: 0,
          whiteSpace: "pre",
          overflow: "hidden",
          maxWidth: "100%",
        }}
      />
    </div>
  );
}

export default function About() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="about" ref={ref} className="reveal border-b border-[#1a1a1a] px-8 md:px-16 py-20" aria-label="About">
      <p className="section-label">/ about me</p>
      <div className="flex flex-col md:flex-row gap-10 md:gap-16">
        <div className="md:w-1/2">
          <p style={{ fontSize: "var(--fs-body)" }} className="text-[#fff] leading-relaxed max-w-xl">
            [Bio goes here]
          </p>
        </div>
        <div className="hidden md:flex md:w-1/2 items-center overflow-hidden">
          <AsciiBanner />
        </div>
      </div>
    </section>
  );
}
