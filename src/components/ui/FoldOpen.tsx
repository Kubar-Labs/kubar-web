"use client";

import { useEffect, useRef, useState } from "react";
import { FoldControl } from "@/components/ui/FoldControl";

/**
 * A list rendered on the server, shown in part: the items marked data-folded wait until the control
 * opens them (data-open, globals.css). Focus then moves to the first of them; a link to one opens the
 * list and goes there.
 */
export function FoldOpen({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  // Left out of the React Compiler: nothing here relies on memoization (How it works' script budget).
  "use no memo";
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) return;
    const reveal = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target || !ref.current?.contains(target) || !target.closest("[data-folded]")) return;
      setOpen(true);
      requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    };
    // A frame later, so the page has hydrated and React takes the state change as an update.
    const frame = requestAnimationFrame(reveal);
    window.addEventListener("hashchange", reveal);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", reveal);
    };
  }, [open]);

  // Now shown, its items' first uses of abbreviations can take their expansions (AbbreviationTips).
  useEffect(() => {
    if (open) document.dispatchEvent(new Event("unfold"));
  }, [open]);

  const show = () => {
    setOpen(true);
    requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>("[data-folded]")?.focus());
  };

  return (
    <div ref={ref} data-open={open ? "" : undefined} className={className}>
      {children}
      {open ? null : <FoldControl label={label} onShow={show} />}
    </div>
  );
}
