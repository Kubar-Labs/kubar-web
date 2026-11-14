import { Arrow, straight } from "@/components/drawings/Arrow";
import { GroundShadow, IsoSheetShape } from "@/components/drawings/iso";
import { type EvidenceCopy, SheetContent, type StackGeometry, STACK_DESKTOP, STACK_SMALL } from "@/components/how/IsoEvidence";
import { PickStage } from "@/components/how/PickStage";
import { KeepRefs } from "@/components/ui/KeepRefs";
import { cn } from "@/lib/utils";

/*
 * The evidence stack as the story's pinned drawing (How it works · 1440,
 * section 172:95: the story card on the left, the stack 258:1864 where the
 * lanes were; REDRAW-2026-11-14.md, section 13 A). The stack is pinned at
 * every width, per section 3a; the cards scroll past it.
 *
 * Each state's documents land on the stack as its card passes, bottom up:
 * state 01 brings Doc 01 to 03, state 02 Doc 04 and 05, state 03 Doc 06,
 * state 04 Doc 07, state 05 Doc 08. The four relying lines appear with their
 * states (05, 06, 06, 07). Once shown, each stays. Everything follows the
 * story's data-story-state in CSS (globals.css, [data-from]); the markup is
 * rendered on the server.
 *
 * Sizes come from the viewport, as the lanes' rows do: the stack's height
 * is what the screen leaves (--stack-h), its width follows, and the rows sit
 * beside it at the same proportions. Phones set a small stack beside the
 * rows, since eight rows under a full-width stack can't stay pinned.
 * Desktop pins the financier's line and the four relying lines under the
 * stack; below desktop they follow the cards (StoryStackAfter).
 *
 * Aria-hidden rows would hide content, so the rows are a real list; the
 * sheets are aria-hidden. A row lifts its sheet on hover or a tap, as built
 * in step 5 (PickStage).
 */
/** The state at which each document lands. */
const LANDS: Record<string, number> = { "01": 1, "02": 1, "03": 1, "04": 2, "05": 2, "06": 3, "07": 4, "08": 5 };
/** The state at which each relying line appears, in the copy's order: financier, insurer, bank, subvention. */
const RELIES = [5, 7, 6, 6];
const DOWN = straight(5, 0, 5, 28, 7);
const SIDE = straight(0, 5, 22, 5, 7);

function Sheets({ g, documents, className }: { g: StackGeometry; documents: EvidenceCopy["documents"]; className: string }) {
  const last = documents.length - 1;
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${g.width} ${g.height}`} className={cn("overflow-visible", className)}>
      <GroundShadow {...g.ground} />
      {documents.map((doc, i) => {
        const state = LANDS[doc.no];
        // Documents of one state land 80 ms apart.
        const seen = documents.slice(0, i).filter((d) => LANDS[d.no] === state).length;
        return (
          <g key={doc.no} data-from={state} className="stack-land" style={{ ["--j" as string]: seen }}>
            <g className="iso-lift" data-doc={doc.no}>
              <IsoSheetShape x={g.x} y={g.top + (last - i) * g.step} w={g.sheet.w} h={g.sheet.h} current={i === last}>
                <SheetContent no={doc.no} current={i === last} size={g.content} />
              </IsoSheetShape>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

function Relying({ copy, idPrefix, className }: { copy: EvidenceCopy; idPrefix: string; className?: string }) {
  return (
    <div className={className}>
      <div data-from={5} className="flex flex-col gap-1 md:flex-row md:items-center md:gap-6">
        <p className="t-fine text-ink-muted">{copy.from}</p>
        <p className="t-body-sm text-ink">{copy.proves}</p>
      </div>
      <ul className="grid gap-4 pt-5 md:grid-cols-2 md:gap-x-6 lg:grid-cols-4 lg:gap-5 lg:pt-4">
        {copy.relying.map((line, i) => (
          <li key={line} data-from={RELIES[i]} className="flex items-start gap-3 lg:flex-col lg:gap-2 lg:pl-1.5">
            <svg aria-hidden="true" width={10} height={28} viewBox="0 0 10 28" className="hidden shrink-0 overflow-visible lg:block">
              <Arrow id={`${idPrefix}-down-${i}`} kind="data" {...DOWN} />
            </svg>
            <svg aria-hidden="true" width={22} height={10} viewBox="0 0 22 10" className="mt-[3px] shrink-0 overflow-visible lg:hidden">
              <Arrow id={`${idPrefix}-side-${i}`} kind="data" {...SIDE} />
            </svg>
            <span className="t-ui text-ink">{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StoryStack({ copy }: { copy: EvidenceCopy }) {
  const last = copy.documents.length - 1;
  const rows = copy.documents.map((doc, i) => ({ doc, i })).reverse();
  return (
    <PickStage item="li[data-doc]" from="data-doc" className="iso-evidence story-stack flex flex-col">
      {/* Below desktop the story pins its own "Record RCV-0001" row above the drawing. */}
      <p className="t-tag hidden pb-2 text-ink lg:block">
        <KeepRefs>{copy.record}</KeepRefs>
      </p>
      <div className="stack-box flex items-center gap-3 md:block">
        <Sheets g={STACK_DESKTOP} documents={copy.documents} className="hidden size-full lg:block" />
        <Sheets g={STACK_SMALL} documents={copy.documents} className="block h-auto w-[30%] max-w-[110px] shrink-0 md:size-full md:max-w-none lg:hidden" />
        <ol className="stack-rows flex min-w-0 flex-1 flex-col md:absolute md:block">
          {rows.map(({ doc, i }) => {
            const current = i === last;
            return (
              <li
                key={doc.no}
                tabIndex={-1}
                data-doc={doc.no}
                data-from={LANDS[doc.no]}
                className="relative flex cursor-default items-start gap-2 outline-offset-2 md:h-[12.5%] md:items-center md:gap-2.5 lg:gap-3"
              >
                <span aria-hidden="true" className={cn("iso-leader hidden md:block", current && "is-current")} />
                <span className={cn("t-code shrink-0 whitespace-nowrap md:w-[49px]", current ? "text-accent" : "text-ink-muted")}>
                  {copy.docLabel.replace("{no}", doc.no)}
                </span>
                <span className="t-ui-sm min-w-0 flex-1 pt-px text-ink md:pt-0">{doc.name}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <Relying copy={copy} idPrefix="story-pin" className="hidden pt-2 lg:block" />
    </PickStage>
  );
}

/**
 * What follows the cards: below desktop, the financier's line and the four
 * relying lines (they can't stay pinned with the stack there); at every
 * width, the two notes under the stack.
 */
export function StoryStackAfter({ copy, className }: { copy: EvidenceCopy; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Relying copy={copy} idPrefix="story-after" className="lg:hidden" />
      <div className="flex flex-col gap-3">
        {copy.after.map((line) => (
          <p key={line} className="t-body-sm text-ink-muted lg:max-w-[660px]">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
