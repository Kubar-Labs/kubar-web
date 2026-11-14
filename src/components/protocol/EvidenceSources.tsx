import { PickStage } from "@/components/how/PickStage";
import { KeepRefs } from "@/components/ui/KeepRefs";
import { cn } from "@/lib/utils";

/*
 * Evidence sources (Figma C4 130:2584; Kubar Protocol 1440 167:286, 768 and
 * 390 in the same page), "The evidence package": the ten elements, each
 * with its source, into one record that three readers share. Desktop:
 * dashed data-path stubs join the elements to one spine and one arrow into
 * the record. Tablets and phones: the elements stacked, one dashed arrow
 * down into the record. No pictograms.
 *
 * The ten elements show once (REDRAW-2026-11-14.md, section 13 B7): each
 * row has the element's name and source, and picking a row (hover or a tap)
 * opens its "Checked against" line under it, one at a time (PickStage sets
 * data-picked; globals.css, .evidence-sources). The visible register is
 * gone; the page keeps it as a table for screen readers, so these rows are
 * hidden from assistive technology and add no tab stops. The record card is
 * not hidden.
 */
export type EvidenceElement = { element: string; from: string; checked: string };

const dashH = "bg-[repeating-linear-gradient(to_right,var(--color-ink-muted)_0_5px,transparent_5px_9px)]";
const dashV = "bg-[repeating-linear-gradient(to_bottom,var(--color-ink-muted)_0_5px,transparent_5px_9px)]";

export function EvidenceSources({
  elements,
  from,
  checkedLabel,
  record,
  readers,
  className,
}: {
  elements: EvidenceElement[];
  from: (source: string) => string;
  /** "Checked against" */
  checkedLabel: string;
  record: string;
  readers: string[];
  className?: string;
}) {
  return (
    <PickStage item="li[data-el]" from="data-el" className={cn("evidence-sources relative flex flex-col gap-2 lg:block", className)}>
      <ul aria-hidden="true" className="relative">
        {elements.map((item, i) => (
          <li key={item.element} data-el={i} className="relative flex cursor-default flex-col gap-0.5 py-2 pl-9 lg:w-[48.9%]">
            <span className="t-body-sm text-ink">{item.element}</span>
            <span className="t-fine text-ink-muted">{from(item.from)}</span>
            <span className="evidence-checked t-fine flex-wrap gap-x-2 pt-0.5 text-ink-muted">
              <span>{checkedLabel}</span>
              <span className="t-body-sm text-ink">{item.checked}</span>
            </span>
            {/* The stub from this element to the spine. */}
            <span className={cn("absolute top-[27px] left-[104.5%] hidden h-[1.5px] w-[21%] lg:block", dashH)} />
          </li>
        ))}
        {/* The spine, from the first stub to the last. */}
        <li role="presentation" className={cn("absolute top-[27px] bottom-[28px] left-[61.4%] hidden w-[1.5px] lg:block", dashV)} />
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
    </PickStage>
  );
}
