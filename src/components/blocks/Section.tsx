import { cn } from "@/lib/utils";

/*
 * Page anatomy (HANDOFF section 4, REDRAW-2026-11-14.md rule 5): sections are
 * separated by space alone, --section-space above and below, with no hairline
 * between them. No section numbers and no label above a heading.
 *
 * Section head (Figma C4 91:288): at desktop the heading (400 wide) with its
 * lead beside it (680), 80 apart; "stacked" keeps the lead under the heading
 * for sections that put their whole body beside the head (400 + 800).
 * "wide" is a heading with no lead, up to 800. Below the laptop width everything
 * stacks. From 1024 to 1199 the heading column is 320 and the gap 48, so the
 * body keeps its room on an iPad in landscape.
 *
 * Pacing (SPEC section 8): a section may sit on the inset ground, the full
 * width of the screen, as the frames draw the sections a reader studies.
 * Two in a row share one ground.
 */
type SectionProps = {
  id?: string;
  labelledBy?: string;
  /** "inset": the quiet ground (--color-inset), edge to edge. */
  ground?: "page" | "inset";
  className?: string;
  children: React.ReactNode;
};

export function Section({ id, labelledBy, ground = "page", className, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={ground === "inset" ? "bg-inset" : undefined}>
      <div className={cn("page-container py-(--section-space)", className)}>{children}</div>
    </section>
  );
}

type SectionHeadProps = {
  id?: string;
  heading: React.ReactNode;
  lead?: React.ReactNode;
  layout?: "beside" | "stacked" | "wide";
  className?: string;
};

export function SectionHead({ id, heading, lead, layout = "beside", className }: SectionHeadProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        layout === "beside" && "lg:flex-row lg:gap-12 xl:gap-20",
        layout === "stacked" && "lg:w-[320px] lg:shrink-0 xl:w-[400px]",
        className,
      )}
    >
      <h2
        id={id}
        className={cn("t-h2 text-ink", layout === "wide" ? "lg:max-w-[800px]" : layout === "beside" && "lg:w-[320px] lg:shrink-0 xl:w-[400px]")}
      >
        {heading}
      </h2>
      {lead ? (
        <p className={cn("t-body-lg text-ink-muted max-lg:max-w-(--measure)", layout === "beside" && "lg:max-w-[680px]")}>{lead}</p>
      ) : null}
    </div>
  );
}
