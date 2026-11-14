"use client";

import { useEffect, useState } from "react";
import { usePlayOnce } from "@/lib/usePlayOnce";

/*
 * A drawing's stage that knows which of its items is picked: the one under
 * the pointer or focus, or the last one tapped. It sets the motion phase as
 * PlayOnce does (data-phase) and the picked item's key as data-picked, and
 * the drawing's CSS does the rest (globals.css: .iso-evidence lifts that
 * row's sheet; .signs-map dims the lines that don't touch that card). The
 * markup inside is rendered on the server. A script sets the attribute
 * because a `:has(…:hover)` rule isn't restyled on hover reliably in Safari.
 */
export function PickStage({
  item,
  from,
  className,
  children,
}: {
  /** Selector of the items that can be picked. */
  item: string;
  /** The attribute on an item that holds its key. */
  from: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [ref, phase] = usePlayOnce<HTMLDivElement>();
  const [picked, setPicked] = useState<string | null>(null);
  // A tap's pick stays when the finger lifts; a tap or click anywhere outside the stage clears it.
  useEffect(() => {
    if (picked === null) return;
    const clear = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setPicked(null);
    };
    document.addEventListener("pointerdown", clear);
    return () => document.removeEventListener("pointerdown", clear);
  }, [picked, ref]);
  const pick = (event: React.SyntheticEvent) => {
    const el = (event.target as Element).closest?.(item);
    setPicked(el ? el.getAttribute(from) : null);
  };
  // Only a mouse hovers: a touch picks with its tap, and keeps its pick when the finger lifts.
  const hover = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") pick(event);
  };
  const leave = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse") setPicked(null);
  };
  return (
    <div
      ref={ref}
      data-phase={phase}
      data-picked={picked ?? undefined}
      className={className}
      onPointerOver={hover}
      onPointerLeave={leave}
      onFocus={pick}
      onBlur={() => setPicked(null)}
      onClick={pick}
    >
      {children}
    </div>
  );
}
