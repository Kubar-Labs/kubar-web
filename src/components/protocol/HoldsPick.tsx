"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { cx as cn } from "@/lib/cx";

/*
 * Who holds what, a pick (step 9; Figma 326:2432 at 1440; below that the
 * prototype, docs/rebuild/prototypes/motion-pieces.html). Left, the five
 * parties; "You, the financier" is picked on load. Right, the eight things
 * that can be held, as chips: picking a party fills what it holds in petrol
 * and outlines in rani what it doesn't hold (rule 11.4: the brief names it),
 * and the two sentences under them, "Holds" and "Doesn't hold", are that
 * party's own. The chips change colour over 250 ms (the prototype's).
 *
 * Hover (a mouse), a click or a tap picks a party; the keyboard reaches the
 * group with Tab and moves within it with the arrow keys, Home and End,
 * picking as it goes (`aria-pressed` on the picked one). Every chip keeps its
 * size from pick to pick (each has room for its dot), so the board never
 * reflows; the five parties' sentences share one cell, so the block keeps the
 * height of the longest. The chips are decoration for assistive technology:
 * the sentences say the same.
 *
 * With script only (`with-script`): without it the page shows today's cards
 * (HoldsCards), every party at once.
 */
type Party = [name: string, holds: string, doesntHold: string];

// What each party holds and doesn't hold, by the things' order (the brief, step 9; the second thing
// is the proceeds since 17 Nov): the financier holds the receivable, the proceeds, the policy and the
// buyer's credit risk, not recourse; the insurer the buyer's credit risk, not disputes; the exporter
// disputes, not the receivable; the exporter's bank the relationship, not the receivable; Kubar
// origination and servicing, not the proceeds or the buyer's credit risk.
const HOLDS = [[0, 1, 2, 3], [3], [4], [5], [6]];
const NOT = [[7], [4], [0], [0], [1, 3]];

export function HoldsPick({
  rows,
  labels,
  things,
  className,
}: {
  /** The five parties, the financier first: name, what it holds, what it doesn't. */
  rows: Party[];
  /** "Holds", "Doesn't hold". */
  labels: [string, string];
  /** The eight things that can be held. */
  things: string[];
  className?: string;
}) {
  const [picked, setPicked] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const state = (thing: number) => (HOLDS[picked].includes(thing) ? "held" : NOT[picked].includes(thing) ? "not" : "other");
  // Tab reaches the picked party; the arrow keys, Home and End move within the five, and focus picks.
  const move = (event: React.KeyboardEvent, i: number) => {
    const to = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: rows.length - 1 }[event.key];
    if (to === undefined) return;
    event.preventDefault();
    buttons.current[(to + rows.length) % rows.length]?.focus();
  };

  return (
    <div className={cn("with-script grid items-start gap-8 min-[900px]:grid-cols-[380px_minmax(0,1fr)] min-[900px]:gap-16", className)}>
      <ul data-pick="holds" className="border-t-2 border-ink">
        {rows.map(([name], i) => (
          <li key={name}>
            <button
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              aria-pressed={picked === i}
              tabIndex={picked === i ? 0 : -1}
              onClick={() => setPicked(i)}
              onFocus={() => setPicked(i)}
              onKeyDown={(event) => move(event, i)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setPicked(i);
              }}
              className={cn(
                "t-ui-lg flex w-full cursor-pointer items-center justify-between gap-3 border-b border-rule p-4 text-left outline-offset-2",
                picked === i ? "bg-action text-on-action" : "text-ink",
              )}
            >
              {name}
              {/* Every row keeps the arrow's room, so a name wraps the same picked or not. */}
              <Icon name="arrow-right" size={16} className={cn("shrink-0", picked !== i && "invisible")} />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex min-w-0 flex-col gap-8">
        <ul aria-hidden="true" className="flex flex-wrap gap-3">
          {things.map((thing, j) => (
            <li key={thing} data-state={state(j)} className="hold-chip t-ui">
              <svg width="8" height="8" viewBox="0 0 8 8" className="hold-dot">
                <circle cx="4" cy="4" r="3.25" strokeWidth={1.5} />
              </svg>
              {thing}
            </li>
          ))}
        </ul>
        {/* Every party's two sentences in one cell; only the picked party's show. */}
        <div className="grid border-t border-rule pt-6">
          {rows.map(([name, holds, doesnt], i) => (
            <dl key={name} className={cn("col-start-1 row-start-1 flex flex-col gap-4", picked !== i && "invisible")}>
              {[
                [labels[0], holds],
                [labels[1], doesnt],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1">
                  <dt className="t-fine text-ink-muted">{label}</dt>
                  <dd className="t-body text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          ))}
        </div>
      </div>
    </div>
  );
}
