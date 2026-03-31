"use client";
import { useReveal } from "@/hooks/useReveal";

const BOOKS = [
  { title: "Book Title", author: "Author" },
  { title: "Book Title", author: "Author" },
  { title: "Book Title", author: "Author" },
];

export default function Hobbies() {
  const ref = useReveal<HTMLElement>();
  return (
    <section id="hobbies" ref={ref} className="reveal border-b border-[#1a1a1a] px-8 md:px-16 py-20" aria-label="Currently Reading">
      <p className="section-label">/ currently reading</p>
      <div className="flex flex-col gap-3 max-w-sm">
        {BOOKS.map((b, i) => (
          <div key={i} className="flex items-baseline gap-2">
            <span style={{ fontSize: "var(--fs-meta)" }} className="text-[#404040]">
              {String(i + 1).padStart(2, "0")}.
            </span>
            <span style={{ fontSize: "var(--fs-small)" }} className="text-[#fff]">{b.title}</span>
            <span style={{ fontSize: "var(--fs-meta)" }} className="text-[#404040]">— {b.author}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
