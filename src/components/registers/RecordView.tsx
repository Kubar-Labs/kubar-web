"use client";

import { useId, useState } from "react";
import { GroundShadow, IsoSheetShape } from "@/components/drawings/iso";
import { reader } from "@/lib/copy";
import { cx as cn } from "@/lib/cx";

/*
 * Record RCV-0001 · isometric (Figma 245:3225 at 1440, 248:3239 at 768,
 * 248:3731 at 390; REDRAW-2026-11-14.md, Home hero).
 *
 * The head (identifier and Illustrative), the summary in Serif/Record, then
 * the six documents as sheets stacked 46 px apart, 06 on top and current
 * (rani edge, lifted shadow). Each sheet is tied by a hairline to its row:
 * number, document, source, FILED. Under them the Proves line and
 * "05 Purchased". Tablet and desktop keep the rows beside the stack; phones
 * list them under it.
 *
 * The rows are the real content, an ordered list read top to bottom; the
 * drawing is aria-hidden. Each row carries what its document proves for
 * screen readers; the visible Proves line follows the row under the pointer
 * or focus, otherwise the current document's.
 *
 * Motion (section 7), on page load and once: sheets drop in from 24 px above,
 * 01 first and 06 last, 320 ms each, 80 ms apart; each row's hairline and
 * text fade in as its sheet lands. Hover, focus or tap on a row lifts its
 * sheet 14 px to --elevation-3 over 200 ms. With reduced motion nothing
 * moves and the lift becomes a colour change (globals.css).
 */
type Document = { no: string; document: string; source: string; status: string; proves: string };

// Geometry in the drawing's own pixels, from the Figma frames.
const SHEET = { w: 230, h: 140 }; // draws 320 × 185
const ORIGIN_X = 128; // the top vertex; the drawn sheet spans 7 to 327
const STEP = 46; // between sheets, up the screen
const WIDTH = 336;
const TOP = 20; // room above sheet 06 for the lift and the drop
const HEIGHT = TOP + 5 * STEP + 185 + 4 + 50; // to the foot of the ground shadow

function SheetContent({ no, current }: { no: string; current: boolean }) {
  return (
    <>
      <rect x={15} y={17} width={96} height={7} className="fill-ink" />
      <rect x={15} y={37} width={180} height={3} className="fill-rule" />
      <rect x={15} y={47} width={150} height={3} className="fill-rule" />
      <rect x={15} y={57} width={166} height={3} className="fill-rule" />
      <rect x={15} y={67} width={120} height={3} className="fill-rule" />
      <rect x={177} y={15} width={36} height={36} className="fill-inset" />
      <text x={15} y={122} className={cn("iso-text-code", current ? "fill-accent" : "fill-ink-muted")}>
        {no}
      </text>
      {current ? (
        <text x={170} y={122} className="iso-text-state fill-accent">
          FILED
        </text>
      ) : null}
    </>
  );
}

export function RecordView({
  copy,
  illustrative,
  className,
}: {
  /** The "record" messages. */
  copy: unknown;
  /** The Illustrative tag, rendered on the server. */
  illustrative: React.ReactNode;
  className?: string;
}) {
  const t = reader(copy);
  const documents = t.raw("documents") as Document[];
  const current = documents.length - 1;
  const [lifted, setLifted] = useState<number | null>(null);
  const descriptionId = useId();
  const shown = lifted ?? current;
  // Top to bottom: 06 first.
  const order = documents.map((doc, index) => ({ doc, index })).reverse();

  return (
    <div data-no-abbr className={cn("iso-record flex flex-col", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="t-tag text-ink">{t("title")}</p>
        {illustrative}
      </div>
      <p className="t-record pt-1 text-ink">{t("summary")}</p>
      <p id={descriptionId} className="sr-only">
        {t("description")}
      </p>

      <div className="relative mt-[calc(var(--iso-record-gap)-20px)]">
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width={WIDTH}
          height={HEIGHT}
          className="mx-auto block h-auto w-full max-w-[336px] overflow-visible md:mx-0"
        >
          <GroundShadow cx={ORIGIN_X + 39} cy={TOP + 5 * STEP + 135 + 35} rx={150} ry={35} />
          {documents.map((doc, index) => {
            const y = TOP + (current - index) * STEP;
            return (
              <g key={doc.no} className="iso-drop" style={{ animationDelay: `${index * 80}ms` }}>
                <g className={cn("iso-lift", lifted === index && "is-lifted")}>
                  <IsoSheetShape x={ORIGIN_X} y={y} w={SHEET.w} h={SHEET.h} current={index === current}>
                    <SheetContent no={doc.no} current={index === current} />
                  </IsoSheetShape>
                </g>
              </g>
            );
          })}
        </svg>

        <ol
          aria-describedby={descriptionId}
          className="mt-5 border-b border-rule md:absolute md:top-[124px] md:right-0 md:left-[356px] md:mt-0 md:border-0"
        >
          {order.map(({ doc, index }) => {
            const isCurrent = index === current;
            return (
              <li
                key={doc.no}
                tabIndex={0}
                aria-current={isCurrent ? "true" : undefined}
                onMouseEnter={() => setLifted(index)}
                onMouseLeave={() => setLifted(null)}
                onFocus={() => setLifted(index)}
                onBlur={() => setLifted(null)}
                onClick={() => setLifted(index)}
                style={{ animationDelay: `${index * 80 + 320}ms` }}
                className={cn(
                  "iso-fade relative flex cursor-default items-start gap-3 border-t border-rule py-[11px] outline-offset-2",
                  "md:h-[46px] md:border-0 md:py-0",
                )}
              >
                <span aria-hidden="true" className={cn("iso-leader hidden md:block", isCurrent && "is-current")} />
                <span className={cn("t-code w-4 shrink-0 pt-px", isCurrent ? "text-accent" : "text-ink-muted")}>{doc.no}</span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="t-ui-sm text-ink">{doc.document}</span>
                  <span className="t-fine text-ink-muted">{doc.source}</span>
                </span>
                <span className={cn("t-state shrink-0", isCurrent ? "text-accent" : "text-ink")}>{doc.status}</span>
                <span className="sr-only">
                  {t("provesLabel")}: {doc.proves}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div aria-hidden="true" className="flex flex-col gap-1 pt-6 md:flex-row md:items-baseline md:gap-4 md:pt-1">
        <span className="t-fine shrink-0 text-ink-muted">{t("provesLabel")}</span>
        <span className="t-body min-h-[50px] text-ink md:t-body-sm md:min-h-[22px]">{documents[shown].proves}</span>
      </div>
      <div className="t-tag mt-3.5 border-t border-rule pt-3.5 text-accent">{t("currentState")}</div>
    </div>
  );
}
