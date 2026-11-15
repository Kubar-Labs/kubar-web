import { PlayOnce } from "@/components/drawings/PlayOnce";
import { FootnoteMarker } from "@/components/ui/Footnote";
import { cn } from "@/lib/utils";

/*
 * Scale card (Figma 241:3412 at 1440, 248:3372 at 768, 248:3853 at 390;
 * REDRAW-2026-11-14.md, Home "The gap"). One raised card (its labels "A year" and "In total" were cut
 * after step 3; the sentences say it): "About $80bn" in
 * Mono/Figure large at desktop, "$126.92M" in rani Mono/Figure, a full-width
 * petrol bar, and under it a rani sliver at 0.16% of the bar's width with the
 * "Drawn to scale" caption. Desktop sets the two figures side by side above
 * the bars; below desktop the bars sit between them, as in the frames.
 *
 * Motion (section 7): when 40% of the card is in view, the bar grows from the
 * left over 600 ms; the sliver and its caption appear 200 ms after it
 * finishes. No count-up. Reduced motion and no script: drawn as it ends.
 */
export type Figure = { figure: string; caption: string; footnote: number };

export function ScaleCard({
  figures,
  scaleNote,
  scaleAlt,
  footnoteId,
  className,
}: {
  figures: [Figure, Figure];
  scaleNote: string;
  scaleAlt: string;
  /** Footnote ids: "fn-2" and markers "fnref-2". */
  footnoteId: (n: number) => { target: string; refId: string };
  className?: string;
}) {
  const [year, total] = figures;

  const figure = (item: Figure, large: boolean, extra?: string) => (
    <p className={cn("flex flex-col gap-3", extra)}>
      <span className={cn("whitespace-nowrap", large ? "t-figure text-ink lg:t-figure-lg" : "t-figure text-accent")}>{item.figure}</span>
      <span className="t-body text-ink">
        {item.caption}
        <FootnoteMarker n={item.footnote} {...footnoteId(item.footnote)} />
      </span>
    </p>
  );

  return (
    <PlayOnce
      className={cn(
        "grid gap-7 border border-rule bg-raised p-5 shadow-elevation-2 md:gap-7 md:p-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-x-8 lg:gap-y-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-x-16 lg:px-12 lg:pt-10 lg:pb-12",
        className,
      )}
    >
      {figure(year, true, "lg:[&>span:last-child]:max-w-[520px]")}
      {figure(total, false, "order-3 lg:order-none lg:self-end")}
      <div className="order-2 flex flex-col gap-2.5 lg:order-none lg:col-span-2 lg:gap-3">
        <div role="img" aria-label={scaleAlt} className="scale-bar h-12 origin-left bg-action lg:h-16" />
        <div className="scale-sliver flex items-center gap-3 lg:gap-4">
          <span aria-hidden="true" className="h-12 w-[max(1px,0.16%)] shrink-0 bg-accent lg:h-16" />
          <p className="t-fine text-ink-muted">{scaleNote}</p>
        </div>
      </div>
    </PlayOnce>
  );
}
