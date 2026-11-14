"use client";

import { useEffect, useRef, useState } from "react";
import { Arrow, headAt } from "@/components/drawings/Arrow";

/*
 * The map's return arrow below desktop (REDRAW-2026-11-14.md, section 9.3):
 * Kubar to Financiers, dashed, up the right side inside the tinted panel,
 * where the cards leave a 28 px gutter. The cards' heights depend on their
 * words, so this measures them and draws the path between their middles.
 * It draws last in the map's movement.
 */
export function ReturnArrow({ from, to, delay }: { from: string; to: string; delay: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [path, setPath] = useState<{ d: string; head: string; height: number } | null>(null);

  useEffect(() => {
    const svg = ref.current;
    const map = svg?.parentElement;
    if (!svg || !map) return;
    const measure = () => {
      const start = map.querySelector<HTMLElement>(`[data-party="${from}"]`);
      const end = map.querySelector<HTMLElement>(`[data-party="${to}"]`);
      if (!start || !end || getComputedStyle(svg).display === "none") return setPath(null);
      const box = map.getBoundingClientRect();
      const a = start.getBoundingClientRect();
      const b = end.getBoundingClientRect();
      const edge = a.right - box.left + 6;
      const out = edge + 14;
      const y1 = a.top + a.height / 2 - box.top;
      const y2 = b.top + b.height / 2 - box.top;
      setPath({
        d: `M${edge} ${y1} H${out} V${y2} H${edge + 6}`,
        head: headAt(edge, y2, "left"),
        height: box.height,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(map);
    return () => observer.disconnect();
  }, [from, to]);

  return (
    <svg ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible lg:hidden">
      {path ? <Arrow id="map-return" d={path.d} head={path.head} kind="data" delay={delay} touches={`${from} ${to}`} /> : null}
    </svg>
  );
}
