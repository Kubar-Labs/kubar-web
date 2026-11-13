import { FootnoteMarker } from "@/components/ui/Footnote";
import { cn } from "@/lib/utils";

/*
 * Exchange comparison (Figma C4 121:1171) and Foundations stack (121:1424),
 * Home "An exchange needs more than a venue."
 *
 * Comparison: a register 628 wide; TReDS, the Indian Energy Exchange and
 * GIFT City · ITFS against who is on the exchange, whether the public is
 * admitted and where each stands today ("The rules exist; the asset doesn't
 * yet" in rani). A real table; below desktop, one block per exchange.
 *
 * Stack: the five foundations as ruled rows, the venue (planned, muted, with
 * footnote ¹) on top; at desktop a bottom-up arrow runs in the gutter.
 */
export type ComparisonRow = { label: string; cells: string[]; footnoteOnLast?: boolean; accentLast?: boolean };
export type Slab = { name: string; line: string; where: string; planned?: boolean };
type FootnoteRef = (suffix: string) => { target: string; refId: string };

export function ExchangeComparison({
  exchangeHead,
  exchanges,
  rows,
  footnote,
  className,
}: {
  exchangeHead: string;
  exchanges: string[];
  rows: ComparisonRow[];
  footnote: FootnoteRef;
  className?: string;
}) {
  const cellText = (row: ComparisonRow, i: number) => (
    <>
      {row.cells[i]}
      {row.footnoteOnLast && i === row.cells.length - 1 ? <FootnoteMarker n={1} {...footnote("comparison")} /> : null}
    </>
  );
  const cellClass = (row: ComparisonRow, i: number) =>
    cn("t-body-sm", row.accentLast && i === row.cells.length - 1 ? "text-accent" : "text-ink");

  return (
    <div className={className}>
      {/* Desktop: the register. */}
      <table className="hidden w-full table-fixed border-collapse text-left lg:table">
        <colgroup>
          <col className="w-[21.66%]" />
          <col className="w-[26.11%]" />
          <col className="w-[26.11%]" />
          <col className="w-[26.11%]" />
        </colgroup>
        <thead>
          <tr className="border-b-2 border-rule-strong">
            <th scope="col" className="pb-3">
              <span className="sr-only">{exchangeHead}</span>
            </th>
            {exchanges.map((name) => (
              <th key={name} scope="col" className="t-tag pb-3 pl-3 font-medium text-ink-muted">
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={row.label} className={r === rows.length - 1 ? "border-b-2 border-rule-strong" : "border-b border-rule"}>
              <th scope="row" className="t-tag py-4 align-top font-medium text-ink-muted">
                {row.label}
              </th>
              {row.cells.map((_, i) => (
                <td key={i} className={cn("py-4 pl-3 align-top", cellClass(row, i))}>
                  {cellText(row, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Below desktop: one block per exchange. */}
      <div className="flex flex-col border-t-2 border-rule-strong lg:hidden">
        {exchanges.map((name, i) => (
          <section key={name} className={cn("flex flex-col gap-3 py-4", i === exchanges.length - 1 ? "border-b-2 border-rule-strong" : "border-b border-rule")}>
            <h3 className="t-ui-lg text-ink">{name}</h3>
            <dl className="flex flex-col gap-3">
              {rows.map((row) => (
                <div key={row.label} className="flex flex-col gap-1">
                  <dt className="t-tag text-ink-muted">{row.label}</dt>
                  <dd className={cellClass(row, i)}>
                    {row.cells[i]}
                    {row.footnoteOnLast && i === row.cells.length - 1 ? (
                      <FootnoteMarker n={1} {...footnote("comparison-stacked")} />
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}

export function FoundationsStack({
  label,
  slabs,
  footnote,
  className,
}: {
  label: string;
  slabs: Slab[];
  footnote: FootnoteRef;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <p className="t-tag text-ink-muted">{label}</p>
      <div className="flex gap-6">
        {/* The bottom-up arrow in the gutter (desktop). */}
        <span aria-hidden="true" className="relative hidden w-0 shrink-0 lg:block">
          <span className="absolute inset-y-0 left-0 w-px -translate-x-1/2 bg-ink" />
          <svg viewBox="0 0 8 5" width="8" height="5" className="absolute top-0 left-0 -translate-x-1/2 text-ink" fill="none" stroke="currentColor">
            <path d="M0.5 4.2L4 0.7L7.5 4.2" strokeLinecap="round" />
          </svg>
        </span>
        <ol reversed className="flex min-w-0 flex-1 flex-col gap-2">
          {slabs.map((slab, i) => (
            <li
              key={slab.name}
              className={cn(
                "flex flex-col gap-2 border-b border-rule-strong py-5 lg:flex-row lg:gap-4",
                i === 0 && "border-t",
              )}
            >
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <h3 className={cn("t-ui-lg", slab.planned ? "text-ink-muted" : "text-ink")}>{slab.name}</h3>
                <p className="t-body-sm text-ink-muted">
                  {slab.line}
                  {slab.planned ? <FootnoteMarker n={1} {...footnote("stack-line")} /> : null}
                </p>
              </div>
              <p className="t-tag shrink-0 whitespace-nowrap text-ink lg:pt-[18px]">
                {slab.where}
                {slab.planned ? <FootnoteMarker n={1} {...footnote("stack-where")} /> : null}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
