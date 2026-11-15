"use client";

import { useState } from "react";
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
 * Each row is a button (aria-pressed), so the pick works from the
 * keyboard. The sketch is one image for assistive technology (its `alt`);
 * the rows carry the words. No Illustrative tag (15 Nov).
 *
 * Below 1200: the sketch, then the six rows stacked; the sketch's Shipment
 * list sits above its SDK panel, so every row still has its part to mark.
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
  const [picked, setPicked] = useState<Key>("eligibility");
  const on = (key: Key) => picked === key;

  return (
    <div
      className={cn(
        "flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12",
        className,
      )}
    >
      <div className="order-2 min-w-0 lg:order-none lg:w-[640px] lg:shrink">
        <h2 className="t-h3 pb-4 text-ink">{heading}</h2>
        <ul>
          {rows.map(([name, sees], i) => {
            const key = KEYS[i];
            return (
              <li
                key={name}
                className={cn(
                  "border-t border-rule",
                  on(key) && "border-t-transparent",
                )}
              >
                <button
                  type="button"
                  aria-pressed={on(key)}
                  onClick={() => setPicked(key)}
                  onFocus={() => setPicked(key)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setPicked(key);
                  }}
                  className={cn(
                    "flex w-full flex-col gap-0.5 border-l-2 py-[11px] pl-4 text-left outline-offset-2",
                    on(key) ? "border-ink" : "border-transparent",
                  )}
                >
                  <span className="t-ui-lg text-ink">{name}</span>
                  <span className="t-body-sm text-ink-muted">{sees}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        role="img"
        aria-label={copy.alt}
        className="order-1 flex w-full flex-col border border-rule-strong bg-raised lg:order-none lg:w-[519px] lg:shrink-0"
      >
        <div className="border-b border-rule px-4 py-3">
          <p className="t-fine text-ink-muted">{copy.platform}</p>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          <div className="flex shrink-0 flex-col border-b border-rule p-4 lg:w-[170px] lg:border-r lg:border-b-0">
            <div className={cn("flex flex-col", on("shipment") && outline)}>
              <p className="t-fine pb-2 text-ink-muted">{copy.shipment}</p>
              {copy.records.map((record, r) => (
                <p
                  key={record}
                  className={cn(
                    "t-body-sm flex items-center justify-between gap-2 border-b border-rule py-2 text-ink",
                    r === 1 && on("events") && outline,
                  )}
                >
                  {record}
                  {r === 1 ? (
                    <span
                      className={cn(
                        "t-state text-accent",
                        !on("events") && "hidden",
                      )}
                    >
                      {copy.purchased}
                    </span>
                  ) : null}
                </p>
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1 p-4">
            <div className="flex flex-col gap-3 border border-rule-strong bg-page p-4">
              <p className="t-fine text-ink">{copy.sdk}</p>

              {/* The panel's two contents share one grid cell, so the sketch keeps its height when they swap
                  and the rows beside or under it never move. */}
              <div className="grid">
                {/* While "Consented onboarding" is picked: its three marks, in place of the panel's content. */}
                <ul
                  className={cn(
                    "col-start-1 row-start-1 flex flex-col gap-2 self-start",
                    outline,
                    !on("onboarding") && "invisible",
                  )}
                >
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
                  </div>
                  <div className="border-t border-rule pt-3">
                    <div
                      className={cn(
                        "flex flex-col gap-2",
                        on("offer") && outline,
                      )}
                    >
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
                    </div>
                  </div>
                  <div className="border-t border-rule pt-3">
                    <div
                      className={cn(
                        "flex flex-col gap-2",
                        on("application") && outline,
                      )}
                    >
                      <p className="t-ui-sm text-ink">{copy.application}</p>
                      <ul className="flex flex-col gap-2">
                        {copy.states.map((state, i) => (
                          <li
                            key={state}
                            className="t-body-sm flex items-center gap-2 text-ink"
                          >
                            <Square
                              kind={
                                i < 2 ? "done" : i === 2 ? "current" : "open"
                              }
                            />
                            {state}
                          </li>
                        ))}
                      </ul>
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
