"use client";

import { useId, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { cx as cn } from "@/lib/cx";

/*
 * What you embed (Figma list 291:1349 in the NavDhan SDK hero, 170:53). The
 * H3 and the six capabilities sit in the hero beside the embed sketch, drawn
 * like the product (16 Nov, step 7: hero 318:1274, the six states on board
 * 316:1377, tablet 320:1661, phone 320:1536). The platform is square: a top
 * bar, the shipment's own records, and inside it the NavDhan SDK widget, a
 * card with 12 px corners and the raised shadow: a window strip, a back arrow
 * and mark, a five-part progress line (done ink, current rani), the part's
 * name as the screen's title, field rows with 8 px corners and a round ink
 * tick, and a button that names the next part. Each row shows its own state:
 * the onboarding checks (the records not yet captured), the records (with a
 * dashed path from the platform's list into the widget), the eligibility
 * checks, the indicative offer (two columns with empty dotted boxes, no
 * figures), the application's timeline, and for events the same timeline with
 * a "Purchased" chip in the platform. Every word comes from
 * navdhanSdk.sketch and the rows' own names.
 *
 * From 1000 the sketch sits beside the list at 580 px and the list takes the
 * rest (640 at 1440). The rows are a pick: "Eligibility check" is picked from
 * the start; hover (a mouse), a click or a tap picks a row, and the keyboard
 * reaches the group with Tab and moves within it with the arrow keys, Home and
 * End (`aria-pressed` on the picked row). The sketch is one image for
 * assistive technology (its `alt`); the rows carry the words.
 *
 * Below 1000 the rows are an accordion (`aria-expanded`), one open at a time,
 * "Eligibility check" open from the start, so the drawing is always under the
 * row that shows it (reviews of 1ce9d8b and 685bd15). An open row shows its
 * state under its sentence: from 768 the whole sketch, on phones the widget
 * card alone, at most 310 px wide. Its words are read as text there.
 */
export type SketchCopy = {
  platform: string;
  shipment: string;
  records: string[];
  sdk: string;
  eligibility: string;
  rules: string[];
  offer: string;
  prices: string[];
  application: string;
  states: string[];
  /** The fields while "Consented onboarding" is picked. */
  onboarding: string[];
  /** The chip in the platform while "Events for your product" is picked. */
  purchased: string;
  alt: string;
};

// The six rows, in the copy's order.
const KEYS = ["onboarding", "shipment", "eligibility", "offer", "application", "events"] as const;
type Key = (typeof KEYS)[number];

// The widget's part for each row (its five parts are the first five rows); events shows the last part.
const PART: Record<Key, number> = { onboarding: 0, shipment: 1, eligibility: 2, offer: 3, application: 4, events: 4 };

/** A field's round ink tick (18 px). */
function Tick() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
      <circle cx="9" cy="9" r="9" className="fill-ink" />
      <path d="M5.2 9.2L8 12L12.8 6" className="fill-none stroke-on-action" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A state on the application's timeline (14 px): done, current or to come. */
function Dot({ kind }: { kind: "done" | "current" | "open" }) {
  return (
    <svg aria-hidden="true" data-dot={kind} width="14" height="14" viewBox="0 0 14 14" className="shrink-0">
      {kind === "done" ? <circle cx="7" cy="7" r="7" className="fill-ink" /> : null}
      {kind === "current" ? <circle cx="7" cy="7" r="6" className="fill-raised stroke-accent" strokeWidth={2} /> : null}
      {kind === "open" ? <circle cx="7" cy="7" r="6.25" className="fill-raised stroke-rule" strokeWidth={1.5} /> : null}
    </svg>
  );
}

/** The widget's primary button, drawn: the next part's name and an arrow. */
function Next({ label, className }: { label: string; className?: string }) {
  return (
    <p aria-hidden="true" data-next="" className={cn("t-ui flex h-10 shrink-0 items-center justify-center gap-2 rounded-[8px] bg-action whitespace-nowrap text-on-action", className)}>
      {label}
      <Icon name="arrow-right" size={14} />
    </p>
  );
}

/** The NavDhan SDK widget in one row's state: 310 × 413, narrower on the smallest phones. */
function Widget({ k, names, copy }: { k: Key; names: string[]; copy: SketchCopy }) {
  const part = PART[k];
  const fields = k === "onboarding" ? copy.onboarding : k === "shipment" ? copy.records : k === "eligibility" ? copy.rules : null;
  return (
    <div data-widget="" className="flex h-[413px] w-full max-w-[310px] flex-col overflow-hidden rounded-[12px] border border-rule bg-raised shadow-elevation-2">
      <div className="flex h-[25px] shrink-0 items-center bg-inset pl-[11px]">
        <span aria-hidden="true" className="flex gap-1">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="size-1.5 rounded-full bg-rule" />
          ))}
        </span>
        <p className="t-tag ml-3 text-ink-muted">{copy.sdk}</p>
      </div>
      <div aria-hidden="true" className="mt-[13px] flex h-3 shrink-0 items-center gap-[13px] pl-[19px]">
        <svg width="5" height="10" viewBox="0 0 5 10" className="overflow-visible">
          <path d="M5 0L0 5L5 10" className="fill-none stroke-ink" strokeWidth={1.5} />
        </svg>
        <span className="h-3 w-[30px] rounded-[2px] bg-rule" />
      </div>
      <div aria-hidden="true" data-part={part} className="mt-3 flex shrink-0 gap-1">
        {[0, 1, 2, 3, 4].map((p) => (
          <span key={p} className={cn("h-0.5 flex-1", p < part ? "bg-ink" : p === part ? "bg-accent" : "bg-rule")} />
        ))}
      </div>
      <p className="t-ui-lg mt-[13px] shrink-0 px-[19px] text-ink">{names[part]}</p>
      <div aria-hidden="true" className="mt-3 h-px shrink-0 bg-rule" />
      <div className="flex min-h-0 flex-1 flex-col px-[19px] pt-[15px] pb-[19px]">
        {fields ? (
          <>
            <ul className="flex flex-col gap-2">
              {fields.map((field) => (
                <li key={field} data-field="" className="t-body-sm flex h-[38px] items-center justify-between gap-2 rounded-[8px] border border-rule pr-[10px] pl-[11px] text-ink">
                  {field}
                  <Tick />
                </li>
              ))}
            </ul>
            <Next label={names[part + 1]} className="mt-auto" />
          </>
        ) : null}
        {k === "offer" ? (
          // Two columns with empty dotted boxes: no figures.
          <div className="flex h-[178px] flex-col rounded-[12px] border border-rule px-[15px] pt-[15px]">
            <div className="grid grid-cols-2 gap-x-3">
              {copy.prices.map((price) => (
                <p key={price} className="t-fine text-ink-muted">
                  {price}
                </p>
              ))}
              {copy.prices.map((price) => (
                <span key={price} aria-hidden="true" data-empty="" className="mt-1.5 h-5 w-14 rounded-[3px] border border-dashed border-rule-strong" />
              ))}
            </div>
            <div aria-hidden="true" className="mt-4 h-px shrink-0 bg-rule" />
            <Next label={names[part + 1]} className="mt-4" />
          </div>
        ) : null}
        {k === "application" || k === "events" ? (
          // A connected timeline: two states done, the purchase current, settlement to come.
          <ol className="h-[188px] rounded-[12px] border border-rule px-[15px] pt-[21px]">
            {copy.states.map((state, i) => (
              <li key={state} className={cn("relative flex h-3.5 items-center gap-3", i < copy.states.length - 1 && "mb-[22px]")}>
                <Dot kind={i < 2 ? "done" : i === 2 ? "current" : "open"} />
                {i < copy.states.length - 1 ? (
                  <span aria-hidden="true" className={cn("absolute top-3.5 left-[6.25px] h-[22px] w-[1.5px]", i < 2 ? "bg-ink" : "bg-rule")} />
                ) : null}
                <span className={i === copy.states.length - 1 ? "t-body-sm text-ink-muted" : "t-ui text-ink"}>{state}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The sketch in one row's state. From 768 the square platform (580 × 489) with the widget in it;
 * on phones the widget alone (the platform's box is `display: contents` and its own parts hidden).
 * `image`: one image for assistive technology, with the sketch's alt.
 */
function Sketch({ k, names, copy, image = false, className }: { k: Key; names: string[]; copy: SketchCopy; image?: boolean; className?: string }) {
  return (
    <div role={image ? "img" : undefined} aria-label={image ? copy.alt : undefined} data-state={k} className={cn("embed-sketch", className)}>
      <div data-platform="" className="relative h-[489px] w-[580px] border border-rule-strong bg-raised max-md:contents">
        <span aria-hidden="true" className="absolute top-3 left-[15px] size-3.5 bg-rule max-md:hidden" />
        <p className="t-ui-sm absolute top-[9px] left-[39px] text-ink max-md:hidden">{copy.platform}</p>
        <span aria-hidden="true" className="absolute top-[17px] left-[379px] flex gap-4 max-md:hidden">
          {[0, 1, 2].map((item) => (
            <span key={item} className="h-1 w-9 bg-rule" />
          ))}
        </span>
        <span aria-hidden="true" className="absolute top-[39px] left-0 h-px w-full bg-rule max-md:hidden" />
        <div className="absolute top-[59px] left-[19px] w-[200px] max-md:hidden">
          <div className="flex h-5 items-center gap-3.5">
            <p className="t-fine text-ink-muted">{copy.shipment}</p>
            {k === "events" ? (
              <p data-chip="" className="t-ui-sm flex items-center gap-1.5 rounded-[10px] bg-inset px-2 py-0.5 whitespace-nowrap text-ink">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                {copy.purchased}
              </p>
            ) : null}
          </div>
          <ul className="mt-4 flex flex-col gap-2">
            {copy.records.map((record) => (
              <li key={record} className="t-body-sm flex items-center justify-between border-b border-rule pr-1 pb-[7px] text-ink">
                {record}
                {/* Captured from the platform's own records: every state after onboarding. */}
                {k !== "onboarding" ? <span aria-hidden="true" data-captured="" className="size-2 bg-ink" /> : null}
              </li>
            ))}
          </ul>
        </div>
        {k === "shipment" ? (
          // The records go into the widget along a dashed data path.
          <svg aria-hidden="true" data-path="" width="26" height="10" viewBox="0 0 26 10" className="absolute top-[158px] left-[222px] overflow-visible max-md:hidden">
            <path d="M1 5H23" className="fill-none stroke-ink-muted" strokeWidth={1.5} strokeDasharray="4.583 2.75" strokeDashoffset={2.292} />
            <path d="M19 1L24 5L19 9" className="fill-none stroke-ink-muted" strokeWidth={1.5} />
          </svg>
        ) : null}
        <div className="md:absolute md:top-[57px] md:left-[251px] md:w-[310px]">
          <Widget k={k} names={names} copy={copy} />
        </div>
      </div>
    </div>
  );
}

export function EmbedPicker({
  heading,
  rows,
  copy,
  className,
}: {
  heading: string;
  /** [capability, what your exporter or your platform sees] */
  rows: string[][];
  copy: SketchCopy;
  className?: string;
}) {
  // null only below 1000, where tapping the open row closes it.
  const [picked, setPicked] = useState<Key | null>("eligibility");
  const base = useId();
  const names = rows.map(([name]) => name);
  const pickRows = useRef<(HTMLButtonElement | null)[]>([]);
  // Below 1000: the open row, or none.
  const open = (key: Key) => picked === key;
  // From 1000 one row is always picked: a row closed on a phone falls back to the first pick.
  const current: Key = picked ?? "eligibility";

  // The pick's keyboard: Tab reaches the picked row; the arrow keys, Home and End move within the
  // six and pick as they go (focus picks).
  const move = (event: React.KeyboardEvent, i: number) => {
    const to = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: KEYS.length - 1 }[event.key];
    if (to === undefined) return;
    event.preventDefault();
    pickRows.current[(to + KEYS.length) % KEYS.length]?.focus();
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-10 min-[1000px]:flex-row min-[1000px]:items-start min-[1000px]:justify-between min-[1000px]:gap-8 lg:gap-12",
        className,
      )}
    >
      <div className="min-w-0 min-[1000px]:max-w-[640px] min-[1000px]:flex-1">
        <h2 className="t-h3 pb-4 text-ink">{heading}</h2>
        <ul>
          {rows.map(([name, sees], i) => {
            const key = KEYS[i];
            const words = (
              <>
                <span className="t-ui-lg text-ink">{name}</span>
                <span className="t-body-sm text-ink-muted">{sees}</span>
              </>
            );
            const row = "w-full flex-col gap-0.5 border-l-2 py-[11px] pl-4 text-left outline-offset-2";
            return (
              <li key={name} className={cn("border-t border-rule", current === key && "min-[1000px]:border-t-transparent")}>
                {/* Below 1000: an accordion row that opens its own state of the sketch. */}
                <button
                  type="button"
                  aria-expanded={open(key)}
                  aria-controls={`${base}-${key}`}
                  onClick={() => setPicked(open(key) ? null : key)}
                  className={cn(row, open(key) ? "border-ink" : "border-transparent", "flex min-[1000px]:hidden")}
                >
                  {words}
                </button>
                <div id={`${base}-${key}`} hidden={!open(key)} className="min-[1000px]:hidden">
                  {open(key) ? <Sketch k={key} names={names} copy={copy} className="mb-8 ml-4 max-md:mt-1" /> : null}
                </div>
                {/* From 1000: a row of the pick, which shows its state in the sketch. */}
                <button
                  ref={(el) => {
                    pickRows.current[i] = el;
                  }}
                  type="button"
                  aria-pressed={current === key}
                  tabIndex={current === key ? 0 : -1}
                  onClick={() => setPicked(key)}
                  onFocus={() => setPicked(key)}
                  onKeyDown={(event) => move(event, i)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setPicked(key);
                  }}
                  className={cn(row, current === key ? "border-ink" : "border-transparent", "hidden min-[1000px]:flex")}
                >
                  {words}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <Sketch image k={current} names={names} copy={copy} className="hidden shrink-0 min-[1000px]:block" />
    </div>
  );
}
