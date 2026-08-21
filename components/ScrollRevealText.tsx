"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

type ScrollRevealTextProps = {
  text: string;
  className?: string;
};

export function ScrollRevealText({ text, className = "" }: ScrollRevealTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const paragraphs = Array.from(container.querySelectorAll("p"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      paragraphs.forEach((paragraph) => paragraph.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    paragraphs.forEach((paragraph) => observer.observe(paragraph));
    return () => observer.disconnect();
  }, [text]);

  return <div className={`${className} scroll-reveal-text`} ref={containerRef}>
    {text.split("\n\n").map((paragraph, index) => (
      <p key={`${index}-${paragraph}`} style={{ "--reveal-delay": `${Math.min(index, 3) * 55}ms` } as CSSProperties}>{paragraph}</p>
    ))}
  </div>;
}
