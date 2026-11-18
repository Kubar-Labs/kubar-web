"use client";

import { useEffect, useRef, useState } from "react";
import { cx as cn } from "@/lib/cx";

/*
 * What runs in the browser for If a buyer doesn't pay (UnpaidFlow, which
 * renders the drawing on the server): how far the path has drawn, and the
 * pick between the two cases.
 *
 * The beats: an IntersectionObserver watches a line 80% of the way down the
 * screen, with no scroll handler. A mark is past once its top is above the
 * line; the root reaches far above the screen, so a mark scrolled out of the
 * top still counts. On laptops the marks are six spans 7svh apart inside the
 * flow; below 1024 they are the steps and the buttons themselves. data-lit is
 * the highest beat past; the CSS lights every part up to it.
 *
 * The pick: hover (a mouse), a click or a tap picks; Tab reaches the picked
 * case and the arrow keys, Home and End move between the two and pick
 * (aria-pressed). Where the pick shows (no reduced motion), the other branch
 * is inert.
 *
 * Left out of the React Compiler ("use no memo"): nothing here relies on
 * memoization, and How it works' script stays inside 170 KB without its
 * caches (acceptance test, performance budget).
 */
const DESKTOP = "(min-width: 1024px)";
const MOTION = "(prefers-reduced-motion: no-preference)";

export function UnpaidStage({
  labels,
  head,
  arrow,
  branches,
  none,
  className,
}: {
  /** The two cases. */
  labels: string[];
  /** The marks, steps 01 to 03 and the fork. */
  head: React.ReactNode;
  /** Below 1024, the arrow from step 03 to the buttons. */
  arrow: React.ReactNode;
  /** The branches, each under its label. */
  branches: React.ReactNode;
  /** Kubar holds none of the risk. */
  none: React.ReactNode;
  className?: string;
}) {
  "use no memo";
  const ref = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  // The server draws none of the path; CSS shows it whole without script or with reduced motion.
  const [lit, setLit] = useState(0);
  const [picked, setPicked] = useState(0);

  useEffect(() => {
    const flow = ref.current;
    if (!flow) return;
    const marks = [...flow.querySelectorAll<HTMLElement>("[data-mark]")];
    const past = new Set<Element>();
    const wide = window.matchMedia(DESKTOP);
    const count = () => {
      const kind = wide.matches ? "wide" : "narrow";
      setLit(Math.max(0, ...marks.filter((mark) => mark.dataset.mark === kind && past.has(mark)).map((mark) => Number(mark.dataset.beat))));
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) past.add(entry.target);
          else past.delete(entry.target);
        }
        count();
      },
      { rootMargin: "100000px 0px -20% 0px" },
    );
    for (const mark of marks) observer.observe(mark);
    wide.addEventListener("change", count);
    return () => {
      observer.disconnect();
      wide.removeEventListener("change", count);
    };
  }, []);

  // The branch not picked is inert where the pick shows; with reduced motion both stand whole.
  useEffect(() => {
    const flow = ref.current;
    if (!flow) return;
    const motion = window.matchMedia(MOTION);
    const sync = () => {
      for (const branch of flow.querySelectorAll<HTMLElement>(".flow-branch")) branch.inert = motion.matches && Number(branch.dataset.branch) !== picked;
    };
    sync();
    motion.addEventListener("change", sync);
    return () => motion.removeEventListener("change", sync);
  }, [picked]);

  const move = (event: React.KeyboardEvent, i: number) => {
    const to = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: labels.length - 1 }[event.key];
    if (to === undefined) return;
    event.preventDefault();
    buttons.current[(to + labels.length) % labels.length]?.focus();
  };

  return (
    <div ref={ref} data-lit={lit} data-case={picked === 0 ? "no" : "yes"} className={cn("unpaid-flow relative flex flex-col", className)}>
      {head}
      {/* The pick: by each branch's arrow on laptops; below 1024 an arrow from step 03, then the two buttons. */}
      <div className="flow-pick" data-mark="narrow" data-beat={4}>
        {arrow}
        <div className="flow-buttons">
          {labels.map((label, b) => (
            <button
              key={label}
              ref={(el) => {
                buttons.current[b] = el;
              }}
              type="button"
              data-branch={b}
              aria-pressed={picked === b}
              tabIndex={picked === b ? 0 : -1}
              onClick={() => setPicked(b)}
              onFocus={() => setPicked(b)}
              onKeyDown={(event) => move(event, b)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setPicked(b);
              }}
              className={cn("t-ui cursor-pointer border border-ink px-3.5 py-2 whitespace-nowrap outline-offset-2", picked === b ? "bg-action text-on-action" : "bg-raised text-ink")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {branches}
      {none}
    </div>
  );
}
