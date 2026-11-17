import { Arrow } from "@/components/drawings/Arrow";
import { PlayOnce } from "@/components/drawings/PlayOnce";
import { cn } from "@/lib/utils";

/*
 * Programme 1 · corridor (Figma 250:1843 at 1440, 257:2619 at 390;
 * REDRAW-2026-11-14.md, Kubar Protocol). Exporters and Buyers as two raised
 * cards (--elevation-2) joined by a 2 px arrow labelled "Terms / Open
 * account"; Financier and Cover as plain text; "Next" in a dashed box. On
 * phones the cards stack and the arrow points down. The labels are Sans/Fine
 * in the secondary colour at every width (rani is kept for footnote markers,
 * the current state and errors).
 *
 * The arrow draws once when the row is in view, over 600 ms (step 9;
 * globals.css, .draw-scene). Still (no script, reduced motion, or already in
 * view): drawn.
 */
type Row = [label: string, value: string];

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="t-fine text-ink-muted">{label}</dt>
      <dd className="t-h4 text-ink">{value}</dd>
    </>
  );
}

export function Corridor({ rows, className }: { rows: Row[]; className?: string }) {
  const [exporters, buyers, terms, financier, cover, next] = rows;
  const card = "flex flex-col gap-3 border border-rule bg-raised px-6 pt-5 pb-6 shadow-elevation-2 lg:px-7 lg:pt-6 lg:pb-7";

  return (
    <div className={cn("flex flex-col gap-7 lg:gap-10", className)}>
      <PlayOnce className="draw-scene flex flex-col md:flex-row md:items-stretch md:gap-6">
        <dl className={cn(card, "md:min-w-0 md:flex-1")}>
          <Pair label={exporters[0]} value={exporters[1]} />
        </dl>
        <dl className="flex flex-col items-center gap-2 py-2 text-center md:w-[120px] md:shrink-0 md:justify-center md:py-0 lg:w-[220px] lg:gap-2.5">
          <dt className="t-fine text-ink-muted">{terms[0]}</dt>
          <dd className="t-ui-lg text-ink">{terms[1]}</dd>
          <dd aria-hidden="true">
            {/* Down on phones; across, 100 wide on tablets and 200 from 1024. */}
            <svg width="12" height="28" viewBox="0 0 12 28" className="overflow-visible md:hidden">
              <Arrow id="corridor-down" kind="money" d="M6 0 L6 18" head="6,28 0.23,18 11.77,18" />
            </svg>
            <svg width="100" height="12" viewBox="0 0 100 12" className="hidden overflow-visible md:block lg:hidden">
              <Arrow id="corridor-tablet" kind="money" d="M0 6 L90 6" head="100,6 90,0.23 90,11.77" />
            </svg>
            <svg width="200" height="12" viewBox="0 0 200 12" className="hidden overflow-visible lg:block">
              <Arrow id="corridor" kind="money" d="M0 6 L190 6" head="200,6 190,0.23 190,11.77" />
            </svg>
          </dd>
        </dl>
        <dl className={cn(card, "md:min-w-0 md:flex-1")}>
          <Pair label={buyers[0]} value={buyers[1]} />
        </dl>
      </PlayOnce>
      <div className="grid gap-6 md:grid-cols-2 md:gap-12">
        <dl className="flex flex-col gap-3">
          <Pair label={financier[0]} value={financier[1]} />
        </dl>
        <dl className="flex flex-col gap-3">
          <Pair label={cover[0]} value={cover[1]} />
        </dl>
      </div>
      <dl className="flex flex-col gap-3 border border-dashed border-rule-strong px-6 pt-5 pb-6 lg:px-7 lg:pt-6 lg:pb-7">
        <Pair label={next[0]} value={next[1]} />
      </dl>
    </div>
  );
}
