"use client";

import { useEffect, useRef, useState } from "react";
import { cx as cn } from "@/lib/cx";

/*
 * Fits a fixed-size laptop drawing to its column: from 1024 up the drawing
 * keeps its composition and scales down only when the column is narrower than
 * the drawing. Below 1024 the drawing lays itself out and this does nothing.
 *
 * Scaling shrinks type with the drawing, so it is only for drawings whose
 * words survive it: no sentence may fall under 15 px and no label under 12
 * (SPEC section 7). A label can hold its size with .fit-keep (globals.css).
 *
 * The scale is measured with a ResizeObserver; until then `estimate` stands
 * in (the scale at 1024, the narrowest laptop width), so nothing overflows
 * before the page hydrates.
 */
export function FitStage({
  width,
  height,
  estimate,
  className,
  children,
}: {
  width: number;
  height: number;
  /** The scale to draw at before the column is measured; leave out where the drawing always fits. */
  estimate?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  const vars = { ["--stage-w" as string]: `${width}px`, ["--stage-h" as string]: `${height}px` };
  if (scale !== null) vars["--fit"] = String(scale);
  else if (estimate !== undefined) vars["--fit"] = String(estimate);
  return (
    <div ref={ref} className={cn("fit-stage", className)} style={vars}>
      <div className="fit-stage-inner">{children}</div>
    </div>
  );
}
