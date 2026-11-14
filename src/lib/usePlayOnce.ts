"use client";

import { useEffect, useRef, useState } from "react";

/*
 * One authored movement per drawing, played once (REDRAW-2026-11-14.md,
 * section 7): when 40% of the drawing is in view it plays, then stays in its
 * end state.
 *
 * Phases: "done" is the end state, which is what the server renders, what
 * readers without script or with reduced motion see, and what a drawing
 * already on screen when the page loads keeps. "armed" is the start state,
 * set only for a drawing still below the fold; "playing" runs the movement.
 */
export type PlayPhase = "done" | "armed" | "playing";

export function usePlayOnce<T extends Element>(threshold = 0.4) {
  const ref = useRef<T>(null);
  const [phase, setPhase] = useState<PlayPhase>("done");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return; // already in view: leave it drawn
    // A drawing taller than the screen can never be 40% in view; ask for what fits.
    const needed = Math.min(threshold, (window.innerHeight * 0.9) / Math.max(1, box.height));
    let observer: IntersectionObserver | null = null;
    const frame = requestAnimationFrame(() => {
      setPhase("armed");
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.intersectionRatio >= needed) {
            setPhase("playing");
            observer?.disconnect();
          }
        },
        { threshold: [0, needed, 1] },
      );
      observer.observe(el);
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [threshold]);

  return [ref, phase] as const;
}
