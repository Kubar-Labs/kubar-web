"use client";

import { useEffect, useRef, useState } from "react";
import { cx as cn } from "@/lib/cx";

/*
 * Fits a fixed-size desktop drawing to its column (Kubar Protocol's loop,
 * 760 × 660): from 1200 up the drawing keeps its composition and scales down
 * only when the column is narrower than the drawing, as on a 1200 laptop.
 * Below 1200 the drawing lays itself out and this does nothing.
 *
 * The scale is measured with a ResizeObserver; until then globals.css gives
 * a close estimate for 1200 to 1279 (.fit-stage), so nothing overflows
 * before the page hydrates.
 */
export function FitStage({
  width,
  height,
  className,
  children,
}: {
  width: number;
  height: number;
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
  return (
    <div ref={ref} className={cn("fit-stage", className)} style={vars}>
      <div className="fit-stage-inner">{children}</div>
    </div>
  );
}
