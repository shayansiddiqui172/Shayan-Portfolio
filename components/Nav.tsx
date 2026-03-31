"use client";
import { useState, useEffect } from "react";

const ITEMS = [
  { id: "hero",       label: "home"       },
  { id: "about",      label: "about"      },
  { id: "stack",      label: "stack"      },
  { id: "experience", label: "experience" },
  { id: "projects",   label: "projects"   },
  { id: "contact",    label: "contact"    },
];

export default function Nav() {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const els = ITEMS.map(i => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      entries => { for (const e of entries) { if (e.isIntersecting) setActive(e.target.id); } },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <nav
      className="fixed top-0 right-0 h-screen hidden lg:flex flex-col justify-center pr-8 z-50"
      aria-label="Page navigation"
    >
      <div className="flex flex-col gap-3 items-end">
        {ITEMS.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="flex items-center gap-2 group"
            style={{ fontSize: "var(--fs-meta)" }}
          >
            {active === item.id && (
              <span className="text-[#00ffa8]" style={{ fontSize: "var(--fs-meta)" }}>
                {item.label}
              </span>
            )}
            <span
              className="block h-px transition-all duration-200"
              style={{
                width: active === item.id ? "24px" : "8px",
                background: active === item.id ? "#00ffa8" : "#1a1a1a",
              }}
            />
          </a>
        ))}
      </div>
    </nav>
  );
}
