import { FootnoteMarker } from "@/components/ui/Footnote";
import { cn } from "@/lib/utils";

/*
 * Three exchanges (Figma 242:3390; REDRAW-2026-11-14.md, Home): TReDS and
 * the Indian Energy Exchange as two quiet columns, GIFT City · ITFS as the
 * one raised card in the Petrol mode (480 wide at desktop), each with who is
 * on the exchange and where it stands today. A filled dot for "Running", a
 * hollow rani dot for "The rules exist; the asset doesn't yet". Below desktop
 * they stack.
 *
 * The foundations stack below (FoundationsStack) is About's until build
 * step 6; Home draws the foundations with IsoFoundations.
 *
 * Stack: the five foundations as ruled rows, the venue (planned, muted, with
 * footnote ¹) on top; at desktop a bottom-up arrow runs in the gutter.
 */
export type ComparisonRow = { label?: string; cells: string[]; footnoteOnLast?: boolean; accentLast?: boolean };
/** `where` is the state reference on Home; on About only the venue has one ("Planned"). */
export type Slab = { name: string; line: string; where?: string; planned?: boolean };
type FootnoteRef = (suffix: string) => { target: string; refId: string };

export function ExchangeColumns({
  exchanges,
  rows,
  footnote,
  className,
}: {
  exchanges: string[];
  rows: ComparisonRow[];
  footnote: FootnoteRef;
  className?: string;
}) {
  const picked = exchanges.length - 1;
  return (
    <ul className={cn("flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-10", className)}>
      {exchanges.map((name, i) => {
        const raised = i === picked;
        return (
          <li
            key={name}
            data-ground={raised ? "petrol" : undefined}
            className={cn(
              "flex flex-col gap-5 lg:gap-7",
              raised
                ? "border border-rule bg-page px-6 pt-5 pb-6 shadow-elevation-3 lg:w-[480px] lg:shrink-0 lg:px-9 lg:pt-8 lg:pb-10"
                : "pt-0 pb-3 lg:min-w-0 lg:flex-1 lg:pt-7 lg:pb-8",
            )}
          >
            <h3 className="t-h3 text-ink">{name}</h3>
            <div className="flex flex-col gap-5 lg:gap-7">
              {rows.map((row, r) => {
                const isState = Boolean(row.accentLast);
                return (
                  <div key={r} className="flex flex-col gap-1.5 lg:gap-2">
                    {row.label ? <p className="t-fine text-ink-muted">{row.label}</p> : null}
                    <p className={cn(isState ? "t-ui-lg flex items-start gap-2.5 text-ink" : "t-body text-ink")}>
                      {isState ? (
                        <svg aria-hidden="true" width="10" height="10" viewBox="0 0 10 10" className="mt-2 shrink-0">
                          {raised ? (
                            <circle cx="5" cy="5" r="4.25" fill="none" strokeWidth="1.5" className="stroke-accent" />
                          ) : (
                            <circle cx="5" cy="5" r="5" className="fill-ink" />
                          )}
                        </svg>
                      ) : null}
                      <span>
                        {row.cells[i]}
                        {row.footnoteOnLast && raised ? <FootnoteMarker n={1} {...footnote("exchange")} /> : null}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function FoundationsStack({
  label,
  slabs,
  footnote,
  statusOnly = false,
  className,
}: {
  label: string;
  slabs: Slab[];
  footnote: FootnoteRef;
  /** About: no state references; the venue alone keeps its status word. */
  statusOnly?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <p className="t-fine text-ink-muted">{label}</p>
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
              {slab.where && statusOnly ? (
                <p className="t-state shrink-0 whitespace-nowrap text-ink-muted">{slab.where}</p>
              ) : slab.where ? (
                <p className="t-tag shrink-0 whitespace-nowrap text-accent lg:pt-[18px]">
                  {slab.where}
                  {slab.planned ? <FootnoteMarker n={1} {...footnote("stack-where")} /> : null}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
