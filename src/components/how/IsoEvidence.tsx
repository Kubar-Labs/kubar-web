import { Arrow, straight } from "@/components/drawings/Arrow";
import { GroundShadow, IsoSheetShape } from "@/components/drawings/iso";
import { PickStage } from "@/components/how/PickStage";
import { KeepRefs } from "@/components/ui/KeepRefs";
import { cn } from "@/lib/utils";

/*
 * Evidence package · isometric (Figma 258:1864 at 1440, 260:2163 at 768,
 * 260:2412 at 390; REDRAW-2026-11-14.md, How it works). Since section 13 A
 * the story is told on this stack (StoryStack pins it and lands the
 * documents state by state); this is the complete stack, shown with the
 * ledger when the story can't run: with reduced motion or on a short screen. The record's identifier, then the eight documents as sheets
 * stacked 38 px apart (34 below desktop), Doc 08 on top and current (rani
 * edge, lifted shadow). Each sheet is tied by a hairline to its row: number
 * and name. Desktop and tablet set the rows beside the stack; phones list
 * them under it. Under the stack: "From · The financier" with what the
 * purchase confirmation proves, then the four parties that rely on the
 * record, each with a dashed arrow down from it (a short one before each
 * line below desktop, as the 768 and 390 frames draw it), then the two notes.
 * "05 Purchased" and ", 8 of 8" were cut after step 3 (section 10); there is
 * no Illustrative tag (15 Nov).
 *
 * The rows are the content, an ordered list read top to bottom; the
 * drawing is aria-hidden.
 *
 * Motion (section 7), once, when 40% of it is in view: as the Home hero
 * stack, the sheets drop in from 24 px above, 01 first and 08 last, 320 ms
 * each, 80 ms apart, and each row fades in as its sheet lands; then the four
 * dashed arrows draw together. Hover, focus or a tap on a row lifts its sheet
 * 14 px to --elevation-3 (PickStage marks the row; globals.css
 * .iso-evidence). The lift only points at the sheet, so the rows take
 * tabindex -1: a tap or click focuses one, Tab skips them (section 7). With
 * reduced motion nothing moves and the lift is a colour change. The markup
 * is rendered on the server; PickStage only sets the motion phase and the
 * picked row.
 */
export type EvidenceCopy = {
  /** "Doc {no}" */
  docLabel: string;
  documents: { no: string; name: string }[];
  from: string;
  proves: string;
  record: string;
  relying: string[];
  after: string[];
};

export type StackGeometry = {
  sheet: { w: number; h: number };
  /** The sheets' top vertex, horizontally. */
  x: number;
  /** Sheet 08's top vertex; the others follow `step` below it. */
  top: number;
  step: number;
  width: number;
  height: number;
  ground: { cx: number; cy: number; rx: number; ry: number };
  content: "large" | "small";
};

// 1440 frame (sheets 250 × 150, drawn 346 × 200), from just under the id row.
export const STACK_DESKTOP: StackGeometry = {
  sheet: { w: 250, h: 150 },
  x: 138.4,
  top: 28,
  step: 38,
  width: 360,
  height: 526,
  ground: { cx: 181.3, cy: 478, rx: 160, ry: 38 },
  content: "large",
};
// 768 and 390 frames (sheets 230 × 140, drawn 320 × 185), with 20 px above sheet 08 for the drop and the lift.
export const STACK_SMALL: StackGeometry = {
  sheet: { w: 230, h: 140 },
  x: 129,
  top: 20,
  step: 34,
  width: 336,
  height: 467,
  ground: { cx: 167.97, cy: 428, rx: 150, ry: 35 },
  content: "small",
};

export function SheetContent({
  no,
  current,
  size,
  numberClassName,
}: {
  no: string;
  current: boolean;
  size: StackGeometry["content"];
  /** For the number printed on the sheet (the story's small stack hides it on phones). */
  numberClassName?: string;
}) {
  const large = size === "large";
  return (
    <>
      <rect x={15} y={17} width={large ? 100 : 96} height={7} className="fill-ink" />
      <rect x={15} y={37} width={large ? 190 : 180} height={3} className="fill-rule" />
      <rect x={15} y={47} width={large ? 160 : 150} height={3} className="fill-rule" />
      {large ? <rect x={15} y={57} width={176} height={3} className="fill-rule" /> : null}
      <rect x={large ? 197 : 177} y={15} width={36} height={36} className="fill-inset" />
      <text x={15} y={large ? 133 : 124} className={cn("iso-text-code", current ? "fill-accent" : "fill-ink-muted", numberClassName)}>
        {no}
      </text>
    </>
  );
}

function Stack({ g, documents, className }: { g: StackGeometry; documents: EvidenceCopy["documents"]; className: string }) {
  const last = documents.length - 1;
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${g.width} ${g.height}`} width={g.width} height={g.height} className={cn("h-auto overflow-visible", className)}>
      <GroundShadow {...g.ground} />
      {documents.map((doc, i) => (
        <g key={doc.no} className="phase-drop" style={{ ["--i" as string]: i }}>
          <g className="iso-lift" data-doc={doc.no}>
            <IsoSheetShape x={g.x} y={g.top + (last - i) * g.step} w={g.sheet.w} h={g.sheet.h} current={i === last}>
              <SheetContent no={doc.no} current={i === last} size={g.content} />
            </IsoSheetShape>
          </g>
        </g>
      ))}
    </svg>
  );
}

// The dashed arrows to the relying parties: down from the record at desktop, a short one before each line below it.
const DOWN = straight(5, 0, 5, 28, 7);
const SIDE = straight(0, 5, 22, 5, 7);
const ARROWS_AT = 7 * 80 + 320; // as the last sheet lands

export function IsoEvidence({ copy, className }: { copy: EvidenceCopy; className?: string }) {
  const last = copy.documents.length - 1;
  // Top to bottom: Doc 08 first.
  const rows = copy.documents.map((doc, i) => ({ doc, i })).reverse();

  return (
    <PickStage item="li[data-doc]" from="data-doc" className={cn("iso-evidence flex flex-col", className)}>
      <p className="t-tag text-ink">
        <KeepRefs>{copy.record}</KeepRefs>
      </p>

      <div className="relative mt-1 lg:mt-0">
        <Stack g={STACK_DESKTOP} documents={copy.documents} className="hidden w-[360px] lg:block" />
        <Stack g={STACK_SMALL} documents={copy.documents} className="mx-auto block w-full max-w-[336px] md:mx-0 lg:hidden" />

        <ol className="mt-6 md:absolute md:top-[124px] md:right-0 md:left-[356px] md:mt-0 lg:top-[142px] lg:left-[383px]">
          {rows.map(({ doc, i }) => {
            const current = i === last;
            return (
              <li
                key={doc.no}
                // Not a tab stop: the lift only points at the sheet (the words are all here),
                // so a tap or click focuses the row but Tab skips it.
                tabIndex={-1}
                data-doc={doc.no}
                style={{ ["--i" as string]: i }}
                className="phase-fade relative flex cursor-default items-start gap-3 pb-2.5 outline-offset-2 md:h-[34px] md:gap-2.5 md:pb-0 lg:h-[38px] lg:gap-3"
              >
                <span aria-hidden="true" className={cn("iso-leader hidden md:block", current && "is-current")} />
                <span className={cn("t-code w-[49px] shrink-0 whitespace-nowrap", current ? "text-accent" : "text-ink-muted")}>
                  {copy.docLabel.replace("{no}", doc.no)}
                </span>
                <span className="t-ui-sm min-w-0 flex-1 pt-px text-ink">{doc.name}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex flex-col gap-1 pt-6 md:flex-row md:items-center md:gap-6 lg:pt-0">
        <p className="t-fine text-ink-muted">{copy.from}</p>
        <p className="t-body-sm text-ink">{copy.proves}</p>
      </div>

      <ul className="grid gap-4 pt-6 md:grid-cols-2 md:gap-x-6 lg:grid-cols-4 lg:gap-6 lg:pt-8">
        {copy.relying.map((line, i) => (
          <li key={line} className="flex items-start gap-3 lg:flex-col lg:pl-1.5">
            <svg aria-hidden="true" width={10} height={28} viewBox="0 0 10 28" className="hidden shrink-0 overflow-visible lg:block">
              <Arrow id={`evidence-down-${i}`} kind="data" {...DOWN} delay={ARROWS_AT} />
            </svg>
            <svg aria-hidden="true" width={22} height={10} viewBox="0 0 22 10" className="mt-[3px] shrink-0 overflow-visible lg:hidden">
              <Arrow id={`evidence-side-${i}`} kind="data" {...SIDE} delay={ARROWS_AT} />
            </svg>
            <span className="t-ui text-ink">{line}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 pt-6 lg:pt-7">
        {copy.after.map((line) => (
          <p key={line} className="t-body-sm text-ink-muted lg:max-w-[660px]">
            {line}
          </p>
        ))}
      </div>
    </PickStage>
  );
}
