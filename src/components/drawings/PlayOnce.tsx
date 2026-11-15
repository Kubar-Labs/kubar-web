"use client";

import { usePlayOnce } from "@/lib/usePlayOnce";

/*
 * Wraps a drawing whose markup is rendered on the server and sets its motion
 * phase ("done", "armed", "playing") as data-phase; the drawing's CSS keys
 * its movement off that (globals.css). See usePlayOnce.
 */
export function PlayOnce({ className, children }: { className?: string; children: React.ReactNode }) {
  const [ref, phase] = usePlayOnce<HTMLDivElement>();
  return (
    <div ref={ref} data-phase={phase} className={className}>
      {children}
    </div>
  );
}
