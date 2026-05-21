"use client";
import { useEffect, useState } from "react";

// Below-the-fold sections are hidden behind the full-screen hero canvas during the
// intro, but mounting them up front forces React to render+commit the entire page
// before the first animation frame can paint — the ~1s startup freeze on mobile.
// Defer their mount until the hero animation finishes (or the user interacts), so
// the intro gets a clean main thread.
export default function DeferredSections({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      // Push the (heavy) mount to the next frame so it doesn't compete with the
      // hero's canvas→DOM handoff frame.
      requestAnimationFrame(() => setShow(true));
    };
    window.addEventListener("hero-anim-done", reveal);
    window.addEventListener("scroll", reveal, { once: true, passive: true });
    window.addEventListener("touchmove", reveal, { once: true, passive: true });
    const fallback = window.setTimeout(reveal, 8000); // safety net
    return () => {
      window.removeEventListener("hero-anim-done", reveal);
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("touchmove", reveal);
      clearTimeout(fallback);
    };
  }, []);

  return show ? <>{children}</> : null;
}
