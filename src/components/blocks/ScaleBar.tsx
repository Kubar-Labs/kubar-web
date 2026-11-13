"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/*
 * The gap's scale drawing (Figma C4 92:332): an 8 px bar for about $80bn a
 * year over a hairline track holding a 2 px tick for $126.92M, both to scale.
 * Motion (HANDOFF section 7): once, on entering the viewport, the bar draws
 * from zero to full width (scene, 600 ms); the tick and hairline appear at
 * the end. Without JavaScript, or with reduced motion, it is simply drawn.
 */
export function ScaleBar({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"drawn" | "waiting" | "drawing">("drawn");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already on screen: leave it drawn
    setPhase("waiting");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("drawing");
          observer.disconnect();
        }
      },
      { threshold: 1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const waiting = phase === "waiting";
  return (
    <div ref={ref} role="img" aria-label={label} className="flex flex-col gap-3">
      <div
        className={cn(
          "h-2 origin-left bg-action transition-transform duration-(--duration-scene) ease-standard",
          waiting && "scale-x-0",
        )}
      />
      <div
        className={cn(
          "relative h-2 transition-opacity duration-(--duration-disclose) ease-standard",
          waiting ? "opacity-0" : phase === "drawing" ? "delay-(--duration-scene)" : "",
        )}
      >
        <span className="absolute inset-x-0 top-1 h-px bg-rule" />
        <span className="absolute top-0 left-0 h-2 w-0.5 bg-action" />
      </div>
    </div>
  );
}
