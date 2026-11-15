"use client";

import { useId, useState } from "react";
import { cx as cn } from "@/lib/cx";

/*
 * What you embed (Figma list 291:1349 and outline 291:1370 in the NavDhan
 * SDK hero, 170:53; REDRAW-2026-11-14.md, section 12, item 3). The H3 and
 * the six capabilities sit in the hero's left column beside the embed
 * sketch (component 140:2523): a schematic, not a screenshot.
 *
 * Picking a row (hover, focus or a tap) marks it with a 2 px ink rule on
 * its left and outlines its part of the sketch in 2 px ink. "Eligibility
 * check" is picked from the start. Two rows have no part in the sketch, so
 * the SDK panel's content swaps while they are picked: "Consented
 * onboarding" shows three filled marks, and "Events for your product" shows
 * a small "Purchased" status beside "Invoice" in the Shipment list.
 *
 * From 1000 up each row is a button (aria-pressed), so the pick works from
 * the keyboard. The sketch is one image for assistive technology (its
 * `alt`); the rows carry the words. No Illustrative tag (15 Nov).
 *
 * From 1000 to 1199 the sketch sits beside the list (the list about 45%
 * wide).
 *
 * Below 1000 there is no full sketch (reviews of 1ce9d8b and 685bd15), so
 * the picked part is never off-screen: the six rows are an accordion. Tapping a row opens it to show that row's own piece of
 * the sketch under its sentence, at the row's width: its block, the
 * Shipment list, the three marks, or "Invoice" with its "Purchased" status.
 * "Eligibility check" is open from the start; one row is open at a time;
 * the rows are buttons with aria-expanded.
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
  /** The panel's content while "Consented onboarding" is picked. */
  onboarding: string[];
  /** The status beside "Invoice" while "Events for your product" is picked. */
  purchased: string;
  alt: string;
};

// The six rows, in the copy's order.
const KEYS = [
  "onboarding",
  "shipment",
  "eligibility",
  "offer",
  "application",
  "events",
] as const;
type Key = (typeof KEYS)[number];

function Square({ kind }: { kind: "done" | "current" | "open" }) {
  return (
    <span
      className={cn(
        "size-2.5 shrink-0",
        kind === "done" && "bg-ink",
        kind === "current" && "bg-accent",
        kind === "open" && "border border-rule-strong",
      )}
    />
  );
}

const outline = "outline-2 outline-offset-[6px] outline-ink outline-solid";

/** One piece of the sketch: what a capability shows, in the sketch and on its own in the phone accordion. */
function Piece({
  k,
  copy,
  events = false,
}: {
  k: Key;
  copy: SketchCopy;
  events?: boolean;
}) {
  switch (k) {
    case "onboarding":
      return (
        <ul className="flex flex-col gap-2">
          {copy.onboarding.map((mark) => (
            <li
              key={mark}
              className="t-body-sm flex items-center gap-2 text-ink"
            >
              <Square kind="done" />
              {mark}
            </li>
          ))}
        </ul>
      );
    case "shipment":
      return (
        <>
          <p className="t-fine pb-2 text-ink-muted">{copy.shipment}</p>
          {copy.records.map((record, r) => (
            <p
              key={record}
              className={cn(
                "t-body-sm flex items-center justify-between gap-2 border-b border-rule py-2 text-ink",
                r === 1 && events && outline,
              )}
            >
              {record}
              {r === 1 ? (
                <span
                  className={cn("t-state text-accent", !events && "hidden")}
                >
                  {copy.purchased}
                </span>
              ) : null}
            </p>
          ))}
        </>
      );
    case "eligibility":
      return (
        <>
          <p className="t-ui-sm text-ink">{copy.eligibility}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {copy.rules.map((rule) => (
              <li
                key={rule}
                className="t-body-sm flex items-center gap-2 text-ink"
              >
                <Square kind="done" />
                {rule}
              </li>
            ))}
          </ul>
        </>
      );
    case "offer":
      return (
        <>
          <p className="t-ui-sm text-ink">{copy.offer}</p>
          {copy.prices.map((price) => (
            <p
              key={price}
              className="t-body-sm flex items-center justify-between gap-3 text-ink"
            >
              {price}
              <span className="h-5 w-14 shrink-0 border border-dashed border-rule-strong" />
            </p>
          ))}
        </>
      );
    case "application":
      return (
        <>
          <p className="t-ui-sm text-ink">{copy.application}</p>
          <ul className="flex flex-col gap-2">
            {copy.states.map((state, i) => (
              <li
                key={state}
                className="t-body-sm flex items-center gap-2 text-ink"
              >
                <Square kind={i < 2 ? "done" : i === 2 ? "current" : "open"} />
                {state}
              </li>
            ))}
          </ul>
        </>
      );
    case "events":
      // "Invoice" with its status, as it shows in the Shipment list.
      return (
        <p className="t-body-sm flex items-center justify-between gap-2 border-b border-rule py-2 text-ink">
          {copy.records[1]}
          <span className="t-state text-accent">{copy.purchased}</span>
        </p>
      );
  }
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
  // null only on phones, where tapping the open row closes it.
  const [picked, setPicked] = useState<Key | null>("eligibility");
  const base = useId();
  // Phones: the open row, or none.
  const open = (key: Key) => picked === key;
  // From 1000 up one row is always picked: a row closed on a phone falls back to the first pick.
  const on = (key: Key) => (picked ?? "eligibility") === key;

  return (
    <div
      className={cn(
        "flex flex-col gap-10 min-[1000px]:flex-row min-[1000px]:items-start min-[1000px]:justify-between min-[1000px]:gap-8 lg:gap-12",
        className,
      )}
    >
      <div className="min-w-0 min-[1000px]:w-[45%] lg:w-[640px] lg:shrink">
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
            const row = cn(
              "w-full flex-col gap-0.5 border-l-2 py-[11px] pl-4 text-left outline-offset-2",
              on(key) ? "border-ink" : "border-transparent",
            );
            return (
              <li
                key={name}
                className={cn(
                  "border-t border-rule",
                  on(key) && "min-[1000px]:border-t-transparent",
                )}
              >
                {/* Below 1000: an accordion row that opens its own piece of the sketch. */}
                <button
                  type="button"
                  aria-expanded={open(key)}
                  aria-controls={`${base}-${key}`}
                  onClick={() => setPicked(open(key) ? null : key)}
                  className={cn(
                    "w-full flex-col gap-0.5 border-l-2 py-[11px] pl-4 text-left outline-offset-2",
                    open(key) ? "border-ink" : "border-transparent",
                    "flex min-[1000px]:hidden",
                  )}
                >
                  {words}
                </button>
                <div
                  id={`${base}-${key}`}
                  hidden={!open(key)}
                  className="min-[1000px]:hidden"
                >
                  <div className="mb-4 ml-4 flex flex-col gap-2 border border-rule-strong bg-raised p-4">
                    <Piece k={key} copy={copy} />
                  </div>
                </div>
                {/* From 1000 up: a row that marks its part of the sketch. */}
                <button
                  type="button"
                  aria-pressed={on(key)}
                  onClick={() => setPicked(key)}
                  onFocus={() => setPicked(key)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setPicked(key);
                  }}
                  className={cn(row, "hidden min-[1000px]:flex")}
                >
                  {words}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        role="img"
        aria-label={copy.alt}
        className="hidden min-w-0 flex-1 flex-col border border-rule-strong bg-raised min-[1000px]:flex lg:w-[519px] lg:flex-none lg:shrink-0"
      >
        <div className="border-b border-rule px-4 py-3">
          <p className="t-fine text-ink-muted">{copy.platform}</p>
        </div>
        <div className="flex items-stretch">
          <div className="flex w-[170px] shrink-0 flex-col border-r border-rule p-4">
            <div className={cn("flex flex-col", on("shipment") && outline)}>
              <Piece k="shipment" copy={copy} events={on("events")} />
            </div>
          </div>
          <div className="min-w-0 flex-1 p-4">
            <div className="flex flex-col gap-3 border border-rule-strong bg-page p-4">
              <p className="t-fine text-ink">{copy.sdk}</p>
              {/* The panel's two contents share one grid cell, so the sketch keeps its height when they
                  swap and the rows beside or under it never move. */}
              <div className="grid">
                {/* While "Consented onboarding" is picked: its three marks, in place of the panel's content. */}
                <div
                  className={cn(
                    "col-start-1 row-start-1 self-start",
                    outline,
                    !on("onboarding") && "invisible",
                  )}
                >
                  <Piece k="onboarding" copy={copy} />
                </div>
                <div
                  className={cn(
                    "col-start-1 row-start-1 flex flex-col gap-3",
                    on("onboarding") && "invisible",
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-col gap-2",
                      on("eligibility") && outline,
                    )}
                  >
                    <Piece k="eligibility" copy={copy} />
                  </div>
                  <div className="border-t border-rule pt-3">
                    <div
                      className={cn(
                        "flex flex-col gap-2",
                        on("offer") && outline,
                      )}
                    >
                      <Piece k="offer" copy={copy} />
                    </div>
                  </div>
                  <div className="border-t border-rule pt-3">
                    <div
                      className={cn(
                        "flex flex-col gap-2",
                        on("application") && outline,
                      )}
                    >
                      <Piece k="application" copy={copy} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
