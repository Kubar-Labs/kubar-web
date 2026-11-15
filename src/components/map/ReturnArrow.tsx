"use client";

import { useEffect, useRef, useState } from "react";
import { Arrow, headAt } from "@/components/drawings/Arrow";
import { cx as cn } from "@/lib/cx";

/*
 * A return arrow down the side of a column of cards, from one card back to
 * an earlier one, drawn inside their container's gutter (REDRAW-2026-11-14.md,
 * section 9.3 for the map; Kubar Protocol's programme loop below desktop).
 * The cards' heights depend on their words, so this measures them and draws
 * the path between their middles. It draws last in its drawing's movement.
 *
 * `side` "right": the map, dashed (data), the cards inset 28 px on the right.
 * `side` "left": the loop, solid, the cards inset 36 px on the left.
 */
export function ReturnArrow({
  from,
  to,
  delay,
  attr = "data-party",
  side = "right",
  kind = "data",
  className = "lg:hidden",
}: {
  from: string;
  to: string;
  delay: number;
  /** The attribute that names the cards. */
  attr?: string;
  side?: "left" | "right";
  kind?: "data" | "money" | "flow";
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [path, setPath] = useState<{ d: string; head: string } | null>(null);

  useEffect(() => {
    const svg = ref.current;
    const box = svg?.parentElement;
    if (!svg || !box) return;
    const measure = () => {
      const start = box.querySelector<HTMLElement>(`[${attr}="${from}"]`);
      const end = box.querySelector<HTMLElement>(`[${attr}="${to}"]`);
      if (!start || !end || getComputedStyle(svg).display === "none") return setPath(null);
      const frame = box.getBoundingClientRect();
      const a = start.getBoundingClientRect();
      const b = end.getBoundingClientRect();
      const y1 = a.top + a.height / 2 - frame.top;
      const y2 = b.top + b.height / 2 - frame.top;
      if (side === "right") {
        const edge = a.right - frame.left + 6;
        setPath({ d: `M${edge} ${y1} H${edge + 14} V${y2} H${edge + 6}`, head: headAt(edge, y2, "left") });
      } else {
        const edge = a.left - frame.left - 2;
        setPath({ d: `M${edge} ${y1} H${edge - 26} V${y2} H${edge - 6}`, head: headAt(edge, y2, "right") });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [from, to, attr, side]);

  return (
    <svg ref={ref} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 h-full w-full overflow-visible", className)}>
      {path ? <Arrow id={`return-${from}-${to}`} d={path.d} head={path.head} kind={kind} delay={delay} touches={`${from} ${to}`} /> : null}
    </svg>
  );
}
