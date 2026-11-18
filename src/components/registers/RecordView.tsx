"use client";

import { useId, useState } from "react";
import { GroundShadow, IsoSheetShape } from "@/components/drawings/iso";
import { TextLink } from "@/components/ui/TextLink";
import { reader } from "@/lib/copy";
import { cx as cn } from "@/lib/cx";

/*
 * Record RCV-0001 · isometric (Figma 245:3225 at 1440, 248:3239 at 768,
 * 353:3704 at 390; SPEC section 8, Home hero).
 *
 * The head (the identifier and the summary, which says "An example" in
 * words), then the eight documents as sheets, 08 on top and current (rani
 * edge, lifted shadow, "FILED"). Beside them eight rows, one line each: the
 * number and the name, tied to its sheet by a hairline. Under the sheets,
 * for the picked document, where it is from and what it proves, then the
 * link to How it works. 08 is picked until a row is: hover, focus or tap.
 *
 * Tablets and laptops draw the sheets at full size, 35 px apart. Phones draw
 * the compact record: the sheets at 0.53 (0.43 under 390 wide, so the longest
 * name keeps its line), 18.9 px apart, with the names alone beside them. One
 * drawing serves both: the sheets' scale and their spacing are the custom
 * properties --s and --step (globals.css, .iso-record), so the rows keep
 * their type size whatever the sheets do.
 *
 * The rows are the real content, an ordered list read top to bottom; the
 * drawing is aria-hidden. Each row carries its document's status, source and
 * what it proves for screen readers; the visible lines under the sheets
 * follow the picked row.
 *
 * Motion (SPEC section 12), on page load and once: sheets drop in from 24 px
 * above, 01 first and 08 last, 320 ms each, 80 ms apart; each row fades in
 * as its sheet lands. A picked row lifts its sheet 14 px to --elevation-3
 * over 200 ms. With reduced motion nothing moves and the lift becomes a
 * colour change (globals.css).
 */
type Document = { no: string; document: string; source: string; status: string; proves: string };

// A sheet in its own pixels, before --s: it draws 320 × 185, from 7 to 327 across.
const SHEET = { w: 230, h: 140 };
const ORIGIN_X = 128; // the top vertex

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
  className,
}: {
  /** The "record" messages. */
  copy: unknown;
  className?: string;
}) {
  const t = reader(copy);
  const documents = t.raw("documents") as Document[];
  const current = documents.length - 1;
  const [lifted, setLifted] = useState<number | null>(null);
  const descriptionId = useId();
  const shown = documents[lifted ?? current];
  // Top to bottom: 08 first.
  const order = documents.map((doc, index) => ({ doc, index })).reverse();
  /** How many sheets lie above this one: its place down the stack, in steps. */
  const place = (index: number) => ({ ["--n" as string]: current - index }) as React.CSSProperties;

  return (
    <div data-no-abbr className={cn("iso-record flex flex-col", className)} style={{ ["--count" as string]: documents.length }}>
      <p className="t-tag text-ink">{t("title")}</p>
      <p className="t-record pt-2 text-ink">{t("summary")}</p>
      <p id={descriptionId} className="sr-only">
        {t("description")}
      </p>

      <div className="record-stage relative">
        <svg aria-hidden="true" className="record-art block overflow-visible">
          <g className="record-place" style={place(0)}>
            <g className="record-scale">
              <GroundShadow cx={ORIGIN_X + 39} cy={170} rx={150} ry={35} />
            </g>
          </g>
          {documents.map((doc, index) => (
            <g key={doc.no} className="record-place" style={place(index)}>
              <g className="iso-drop" style={{ animationDelay: `${index * 80}ms` }}>
                <g className={cn("iso-lift", lifted === index && "is-lifted")}>
                  <g className="record-scale">
                    <IsoSheetShape x={ORIGIN_X} y={0} w={SHEET.w} h={SHEET.h} current={index === current}>
                      <SheetContent no={doc.no} current={index === current} />
                    </IsoSheetShape>
                  </g>
                </g>
              </g>
            </g>
          ))}
        </svg>

        <ol aria-describedby={descriptionId} className="record-rows absolute">
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
                className="iso-fade relative flex h-(--step) cursor-default items-center gap-3 outline-offset-2"
              >
                <span aria-hidden="true" className={cn("iso-leader", isCurrent && "is-current")} />
                {/* Phones show the names alone (the compact record); the number stays for screen readers. */}
                <span className={cn("t-code w-4 shrink-0 max-md:sr-only", isCurrent ? "text-accent" : "text-ink-muted")}>{doc.no}</span>
                <span className="t-ui-sm whitespace-nowrap text-ink">{doc.document}</span>
                <span className="sr-only">
                  {doc.status}. {t("fromLabel")}: {doc.source}. {t("provesLabel")}: {doc.proves}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* The picked document's source and what it proves. Phones set each under its label. */}
      <dl aria-hidden="true" className="flex flex-col gap-2 pt-3 md:gap-1 md:pt-2">
        <div className="flex flex-col gap-0.5 md:flex-row md:items-baseline md:gap-4">
          <dt className="t-fine shrink-0 text-ink-muted md:w-11">{t("fromLabel")}</dt>
          <dd className="t-body-sm text-ink">{shown.source}</dd>
        </div>
        <div className="flex flex-col gap-0.5 md:flex-row md:items-baseline md:gap-4">
          <dt className="t-fine shrink-0 text-ink-muted md:w-11">{t("provesLabel")}</dt>
          <dd className="t-body-sm text-ink md:min-h-[44px]">{shown.proves}</dd>
        </div>
      </dl>
      <TextLink href="/how-it-works" kind="arrow" className="tap-area mt-2 self-start md:mt-1">
        {t("link")}
      </TextLink>
    </div>
  );
}
