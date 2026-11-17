"use client";

import { useEffect, useState } from "react";
import { FoldControl, useFold } from "@/components/ui/Fold";
import { cx as cn } from "@/lib/cx";

/*
 * Questions (Figma C4 93:384): each question a credit committee asks (an
 * h3, Sans/UI large, four columns) with its answer beside it (Body, six
 * columns). From 768 up the answers are always shown. Below 768 the
 * questions are an accordion with the first one open (REDRAW-2026-11-14.md,
 * section 13 B8): each question is a button that opens its answer and
 * closes the one that was open. Without script every answer shows.
 *
 * Pacing (16 Nov, Figma 312:2495): with `shown` and `showAll`, only the first
 * questions show at every width and "Show all 11 questions" opens the rest in
 * place (Fold). Without script all of them show and the control is hidden.
 */
export function QuestionList({
  items,
  shown,
  showAll,
  className,
}: {
  items: { q: string; a: string }[];
  /** How many questions show before the control opens the rest. */
  shown?: number;
  /** The control's words. */
  showAll?: string;
  className?: string;
}) {
  // null until the script runs: every answer shown.
  const [open, setOpen] = useState<number | null | "all">("all");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the folded state exists only with script
    setOpen(0);
  }, []);
  const { list, first, open: unfolded, show } = useFold<HTMLDivElement, HTMLDivElement>();
  const folds = shown !== undefined && showAll !== undefined && shown < items.length;

  return (
    <>
      <div ref={list} className={cn("flex flex-col border-t-2 border-rule-strong lg:max-w-[1062px]", className)}>
        {items.map((item, i) => {
          const shownAnswer = open === "all" || open === i;
          const id = `question-${i}`;
          const folded = folds && !unfolded && i >= shown;
          return (
            <div
              key={item.q}
              ref={folds && i === shown ? first : undefined}
              tabIndex={folds && i === shown ? -1 : undefined}
              data-folded={folded ? "" : undefined}
              className={cn(
                "flex flex-col outline-offset-4 md:gap-2 md:py-6 lg:flex-row lg:items-baseline lg:gap-6",
                i === items.length - 1 ? "border-b-2 border-rule-strong" : "border-b border-rule",
              )}
            >
              <h3 className="t-ui-lg text-ink lg:w-[410px] lg:shrink-0">
                <button
                  type="button"
                  aria-expanded={shownAnswer}
                  aria-controls={id}
                  onClick={() => setOpen(shownAnswer && open !== "all" ? null : i)}
                  className="flex min-h-11 w-full items-start justify-between gap-4 py-4 text-left md:hidden"
                >
                  <span>{item.q}</span>
                  <svg aria-hidden="true" width="12" height="8" viewBox="0 0 12 8" className={cn("mt-2 shrink-0 transition-transform duration-(--duration-disclose)", shownAnswer && "rotate-180")} fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M1 1.5L6 6.5L11 1.5" />
                  </svg>
                </button>
                <span className="hidden md:inline">{item.q}</span>
              </h3>
              <p id={id} className={cn("t-body text-ink max-md:pb-5 lg:max-w-[628px]", !shownAnswer && "max-md:hidden")}>
                {item.a}
              </p>
            </div>
          );
        })}
      </div>
      {folds && !unfolded ? <FoldControl label={showAll} onShow={show} /> : null}
    </>
  );
}
