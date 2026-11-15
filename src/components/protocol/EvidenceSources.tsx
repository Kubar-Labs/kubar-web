"use client";

import { useId, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { KeepRefs } from "@/components/ui/KeepRefs";
import { cx as cn } from "@/lib/cx";

/*
 * Evidence sources (Figma C4 130:2584; Kubar Protocol 1440 167:286, 768 and
 * 390 in the same page), "The evidence package": the ten elements, each
 * with its source, into one record that three readers share. Desktop:
 * dashed data-path stubs join the elements to one spine and one arrow into
 * the record. Tablets and phones: the elements stacked, one dashed arrow
 * down into the record. No pictograms.
 *
 * The ten elements show once (REDRAW-2026-11-14.md, section 13 B7, and the
 * review of 95868f5). Each row is a button with the element's name and
 * source and a small plus at its right; a click, a tap or Enter/Space opens
 * its "Checked against" line under it and turns the plus to a minus, as
 * "How we estimate this" does. One row is open at a time. The rows are in
 * the tab order and carry aria-expanded, so this list is the content for
 * everyone and there is no separate table.
 */
/** `from` is the whole line, "From Indian Customs". */
export type EvidenceElement = { element: string; from: string; checked: string };

const dashH = "bg-[repeating-linear-gradient(to_right,var(--color-ink-muted)_0_5px,transparent_5px_9px)]";
const dashV = "bg-[repeating-linear-gradient(to_bottom,var(--color-ink-muted)_0_5px,transparent_5px_9px)]";

export function EvidenceSources({
  elements,
  checkedLabel,
  record,
  readers,
  className,
}: {
  elements: EvidenceElement[];
  /** "Checked against" */
  checkedLabel: string;
  record: string;
  readers: string[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const base = useId();

  return (
    <div className={cn("evidence-sources relative flex flex-col gap-2 lg:block", className)}>
      <ul className="relative">
        {elements.map((item, i) => {
          const shown = open === i;
          const id = `${base}-${i}`;
          return (
            <li key={item.element} className="relative lg:w-[48.9%]">
              <button
                type="button"
                aria-expanded={shown}
                aria-controls={id}
                onClick={() => setOpen(shown ? null : i)}
                className="flex w-full items-start justify-between gap-4 py-2 pl-9 text-left outline-offset-2"
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="t-body-sm text-ink">{item.element}</span>
                  <span className="t-fine text-ink-muted">{item.from}</span>
                </span>
                <Icon name={shown ? "minus" : "plus"} className="mt-0.5 shrink-0 text-ink-muted" />
              </button>
              <p id={id} hidden={!shown} className="t-fine flex flex-wrap gap-x-2 pb-2 pl-9 text-ink-muted">
                <span>{checkedLabel}</span>
                <span className="t-body-sm text-ink">{item.checked}</span>
              </p>
              {/* The stub from this element to the spine. */}
              <span aria-hidden="true" className={cn("absolute top-[27px] left-[104.5%] hidden h-[1.5px] w-[21%] lg:block", dashH)} />
            </li>
          );
        })}
        {/* The spine, from the first stub to the last. */}
        <li role="presentation" aria-hidden="true" className={cn("absolute top-[27px] bottom-[28px] left-[61.4%] hidden w-[1.5px] lg:block", dashV)} />
      </ul>

      {/* Desktop: one arrow from the spine into the record. */}
      <span aria-hidden="true" className={cn("absolute top-1/2 left-[61.4%] hidden h-[1.5px] w-[9.8%] lg:block", dashH)}>
        <svg width="7" height="12" viewBox="0 0 7 12" className="absolute -top-[5.25px] right-0 overflow-visible text-ink-muted" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M0.7 0.7L6 6L0.7 11.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {/* Tablets and phones: one dashed arrow down into the record. */}
      <svg aria-hidden="true" width="12" height="32" viewBox="0 0 12 32" className="shrink-0 overflow-visible text-ink-muted lg:hidden" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <line x1={6} y1={0} x2={6} y2={30} strokeDasharray="3 3" />
        <path d="M0.7 25.7L6 31L11.3 25.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className="flex flex-col gap-4 border border-t-2 border-rule-strong bg-raised p-5 lg:absolute lg:top-1/2 lg:right-0 lg:w-[28.4%] lg:-translate-y-1/2">
        <p className="t-tag text-ink-muted">
          <KeepRefs>{record}</KeepRefs>
        </p>
        <ul>
          {readers.map((reader) => (
            <li key={reader} className="t-body border-t border-rule py-3 text-ink">
              {reader}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
