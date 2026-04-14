"use client";
import { useEffect, useRef } from "react";

export default function MorphText({
  children,
  className,
  style,
  delay = 0,
  duration = 1800,
}: {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
}) {
  const ref      = useRef<HTMLSpanElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = children;

    // Build one <span> per character. Non-space chars start invisible and
    // fade in via CSS transition at their own randomly-timed setTimeout.
    // No rAF loop, no noise chars — purely the browser's compositor doing
    // a smooth opacity 0→1 at scattered moments across the text.
    el.innerHTML = "";
    const charSpans: HTMLSpanElement[] = [];
    for (const ch of target) {
      const s = document.createElement("span");
      s.textContent = ch;
      if (ch !== " ") {
        s.style.cssText = "opacity:0;transition:opacity 450ms ease";
      }
      el.appendChild(s);
      charSpans.push(s);
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();

        const timers: ReturnType<typeof setTimeout>[] = [];
        charSpans.forEach((s, i) => {
          if (target[i] === " ") return;
          // Random fraction [0.04, 0.92] × duration, plus base delay
          const rt = 0.04 + Math.random() * 0.88;
          const ms = 350 + delay + Math.round(rt * duration);
          timers.push(setTimeout(() => { s.style.opacity = "1"; }, ms));
        });
        timersRef.current = timers;
      },
      { threshold: 0.4 },
    );

    obs.observe(el);
    return () => {
      obs.disconnect();
      timersRef.current.forEach(clearTimeout);
    };
  }, [children, delay, duration]);

  return (
    <span
      ref={ref}
      className={className}
      style={style}
      suppressHydrationWarning
    >
      {children}
    </span>
  );
}
