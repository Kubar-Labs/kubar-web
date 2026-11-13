import { Illustrative } from "@/components/ui/Illustrative";

/*
 * Evidence sources (Figma C4 130:2584), Kubar Protocol "The evidence
 * package", desktop only: the ten elements, each with its source, joined by
 * dashed data-path stubs to one spine and one arrow into the record, which
 * three readers share. No pictograms. The register under it carries the same
 * content at every size, so the drawing's rows are hidden from assistive
 * technology; the record card is not.
 */
export function EvidenceSources({
  elements,
  from,
  record,
  readers,
  alt,
}: {
  elements: { element: string; from: string }[];
  from: (source: string) => string;
  record: string;
  readers: string[];
  alt: string;
}) {
  const spine = 109;
  return (
    <div className="relative hidden h-[560px] w-[1062px] lg:block">
      <ul aria-hidden="true">
        {elements.map((item, i) => (
          <li key={item.element} className="absolute left-0 flex w-[519px] flex-col gap-0.5 py-2" style={{ top: 56 * i }}>
            <span className="t-body-sm text-ink">{item.element}</span>
            <span className="t-tag text-ink-muted">{from(item.from)}</span>
          </li>
        ))}
      </ul>
      <svg
        role="img"
        aria-label={alt}
        className="absolute top-7 left-[543px] text-ink-muted"
        width={215}
        height={506}
        viewBox="0 -1 215 506"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        {elements.map((_, i) => (
          <line key={i} x1={0} y1={56 * i} x2={spine} y2={56 * i} strokeDasharray="5 4" />
        ))}
        <line x1={spine} y1={0} x2={spine} y2={504} strokeDasharray="5 4" />
        <line x1={spine} y1={252} x2={213} y2={252} strokeDasharray="5 4" />
        <path d="M208.7 246.7L214 252L208.7 257.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="absolute top-[121px] left-[760px] flex w-[302px] flex-col gap-4 border border-t-2 border-rule-strong bg-raised p-5">
        <div className="flex flex-col items-start gap-2">
          <p className="t-tag text-ink-muted">{record}</p>
          <Illustrative align="start" />
        </div>
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
