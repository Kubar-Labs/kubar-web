"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayOnce } from "@/lib/usePlayOnce";
import { cx as cn } from "@/lib/cx";

/*
 * The money path (step 8): one drawing on Kubar Protocol ("The money never
 * passes through Kubar.", Figma 325:2486) and How it works ("Where the money
 * moves.", 333:2736, centred in the section). Three plates in a row, Buyer,
 * Singapore; Financier, with a petrol top and a white opening (the
 * receivable, held by the financier); Exporter's bank. The three payments are
 * arrows above them, numbered 1 to 3 with their words. The face value stops
 * on its way (17 Nov): a ring at its line's midpoint, the collection account
 * in the exporter's name, with its caption ("Collection account, in the
 * exporter's name, swept to the financier"). Kubar sits below on a dashed
 * data path with a mark for each payment, matched, and "Kubar holds none"
 * (rule 11.4: the secondary colour). The line under the drawing stays.
 *
 * It plays once when 45% of it is in view (usePlayOnce): payment 1, then 2,
 * then 3, 1.1 s apart. For each the arrow draws in 700 ms, a rani dot runs
 * along it, its words go from 35% to full and its mark on Kubar's path fills
 * (globals.css, .money-run; the order, timing and easing of
 * docs/rebuild/prototypes/motion-pieces.html). The stop's ring appears with
 * the arrowhead and its caption with the payment's words; the dot runs
 * through it without pausing. Under it, four controls replay one payment or
 * all three. A payment that has played stays drawn: the other layout, shown
 * later (a tablet turned), doesn't play it again. Still (no script, reduced
 * motion, or the drawing already in view): all three arrows drawn, the stop
 * shown and every mark filled; the controls need script and motion, so they
 * are hidden then.
 *
 * From 900 px the plates sit in a row (760 × 424, never scaled); below that
 * they stack top to bottom and the arrows run down (320 × 652, the
 * prototype's narrow drawing fitted to a 360 px phone; narrower than that,
 * as at the 320 px reflow check, it is drawn at 0.875), so it never scrolls
 * sideways. The drawing is hidden from assistive technology: the table of
 * payments (from and to) and "Kubar holds none" stay in the markup for it.
 */
// A payment's motion: playing (remounted with its start), lit once it has played (still, whatever the
// phase, so a drawing shown later, as when a tablet turns, doesn't play again), or following the phase.
type Run = { seq: number; at: number } | "lit" | null;

// Where everything sits, in each drawing's own pixels.
type Layout = {
  width: number;
  height: number;
  /** Each plate's centre: buyer, financier, exporter's bank. */
  plates: [number, number][];
  /** A plate's half-width and thickness. */
  a: number;
  t: number;
  /** How far under each plate its name starts. */
  nameGap: number;
  /** Each payment's arrow: where it starts, its length and its direction. */
  arrows: { x: number; y: number; length: number; down: boolean }[];
  /** Each payment's number (left, top) and the box its words wrap in. */
  labels: { nx: number; ny: number; x: number; y: number; w: number; centred: boolean }[];
  /** The face value's stop: its ring's centre, and its caption, centred under the ring at `top` or, without one, under the payment's words. */
  stop: { x: number; y: number; caption: { top?: number; width: number } };
  /** Kubar's row: the line's y, the box, where the line starts and ends, the label's top, the chip and the marks' x. */
  kubar: { y: number; box: [number, number]; from: number; to: number; label: number; chip: [number, number]; marks: number[] };
};

const K = Math.tan(Math.PI / 6);

const WIDE: Layout = {
  width: 760,
  height: 424,
  plates: [[120, 210], [380, 210], [640, 210]],
  a: 92,
  t: 22,
  nameGap: 18,
  arrows: [
    { x: 410, y: 58, length: 200, down: false },
    { x: 150, y: 96, length: 200, down: false },
    { x: 410, y: 134, length: 200, down: false },
  ],
  labels: [
    { nx: 394, ny: 48, x: 510, y: 30, w: 280, centred: true },
    { nx: 134, ny: 86, x: 250, y: 68, w: 220, centred: true },
    // Two lines, broken after "the balance," as the frame breaks them.
    { nx: 394, ny: 124, x: 510, y: 86, w: 240, centred: true },
  ],
  // The line's midpoint (it stops 5 short of the head's tip); the caption on two lines, as the frame sets it.
  stop: { x: 247.5, y: 96, caption: { top: 106, width: 270 } },
  kubar: { y: 392, box: [28, 378], from: 100, to: 732, label: 364, chip: [610, 358], marks: [250, 400, 550] },
};

const NARROW: Layout = {
  width: 320,
  height: 652,
  plates: [[74, 50], [74, 250], [74, 486]],
  a: 60,
  t: 16,
  nameGap: 10,
  arrows: [
    { x: 58, y: 340.6, length: 102.8, down: true },
    { x: 74, y: 140.6, length: 66.8, down: true },
    { x: 90, y: 340.6, length: 102.8, down: true },
  ],
  labels: [
    { nx: 116, ny: 340.6, x: 132, y: 340.6, w: 188, centred: false },
    // From the top of its arrow, with the stop's caption under it (the prototype's).
    { nx: 116, ny: 138.6, x: 132, y: 138.6, w: 188, centred: false },
    // Three lines, broken as the prototype breaks them.
    { nx: 116, ny: 384.6, x: 132, y: 384.6, w: 160, centred: false },
  ],
  // The caption in three lines, broken as the prototype breaks them.
  stop: { x: 74, y: 171.5, caption: { width: 164 } },
  kubar: { y: 620, box: [0, 607], from: 70, to: 320, label: 588, chip: [196, 584], marks: [130, 200, 270] },
};

const points = (list: [number, number][]) => list.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

/** An isometric plate: its top face, two side faces and its blurred ground shadow. */
function Plate({ cx, cy, a, t, financier }: { cx: number; cy: number; a: number; t: number; financier: boolean }) {
  const h = a * K;
  const hole = 0.414;
  return (
    <>
      <ellipse cx={cx} cy={cy + h + t + 1} rx={a * 0.815} ry={a * 0.163} className="money-ground" />
      <polygon points={points([[cx - a, cy], [cx, cy + h], [cx, cy + h + t], [cx - a, cy + t]])} className="fill-[var(--petrol-100)] stroke-rule" />
      <polygon points={points([[cx, cy + h], [cx + a, cy], [cx + a, cy + t], [cx, cy + h + t]])} className="fill-[var(--petrol-50)] stroke-rule" />
      <polygon points={points([[cx, cy - h], [cx + a, cy], [cx, cy + h], [cx - a, cy]])} className={financier ? "fill-ink stroke-rule" : "fill-raised stroke-rule"} />
      {financier ? (
        // The receivable, held by the financier: a white opening in the petrol top.
        <polygon points={points([[cx, cy - h * hole], [cx + a * hole, cy], [cx, cy + h * hole], [cx - a * hole, cy]])} className="fill-raised stroke-rule" strokeWidth={0.75} />
      ) : null}
    </>
  );
}

function Drawing({ layout, parties, payments, stop, kubarNote, dataPath, runs, className }: {
  layout: Layout;
  parties: string[];
  payments: string[];
  /** The stop's caption, in two parts: the account, then where its payments go. */
  stop: [string, string];
  kubarNote: string;
  dataPath: string;
  runs: Run[];
  className?: string;
}) {
  const { width, height, plates, a, t, arrows, labels, kubar } = layout;
  const { caption } = layout.stop;
  const h = a * K;
  // A payment that plays is remounted (its key), so its movement starts again from the beginning.
  const run = (i: number) => {
    const r = runs[i];
    if (r === "lit") return { key: `${i}-lit`, className: "money-lit", style: undefined };
    return {
      key: `${i}-${r ? `run-${r.seq}` : "still"}`,
      className: r ? "money-run" : "money-still",
      style: r ? ({ ["--at" as string]: `${r.at}ms` } as React.CSSProperties) : undefined,
    };
  };
  return (
    <div className={cn("relative", className)} style={{ width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 overflow-visible">
        {plates.map(([cx, cy], i) => (
          <Plate key={i} cx={cx} cy={cy} a={a} t={t} financier={i === 1} />
        ))}
        {arrows.map(({ x, y, length, down }, i) => {
          const end = length - 5;
          const line = down ? { x1: x, y1: y, x2: x, y2: y + end } : { x1: x, y1: y, x2: x + end, y2: y };
          const head: [number, number][] = down
            ? [[x - 4.5, y + length - 8], [x, y + length], [x + 4.5, y + length - 8]]
            : [[x + length - 8, y - 4.5], [x + length, y], [x + length - 8, y + 4.5]];
          const { key, className: state, style } = run(i);
          const travel = { ["--dx" as string]: down ? "0px" : `${length - 8}px`, ["--dy" as string]: down ? `${length - 8}px` : "0px" };
          return (
            <g key={key} data-pay={i} className={cn("money-pay", state)} style={{ ...style, ...travel }}>
              <line {...line} pathLength={1} className="money-line stroke-ink" strokeWidth={1.5} />
              <polygon points={points(head)} className="money-head fill-ink" />
              <circle cx={x} cy={y} r={4} className="money-dot fill-accent" />
              {i === 1 ? <circle cx={layout.stop.x} cy={layout.stop.y} r={3.75} className="money-stop fill-raised stroke-ink" strokeWidth={1.5} /> : null}
            </g>
          );
        })}
        {/* Kubar's data path: dashed, in the secondary colour, with a mark for each payment as it's matched. */}
        <line x1={kubar.from} y1={kubar.y} x2={kubar.to} y2={kubar.y} className="stroke-ink-muted" strokeWidth={1.5} strokeDasharray="6 4" strokeDashoffset={3} />
        {kubar.marks.map((mx, i) => {
          const { key, className: state, style } = run(i);
          return <rect key={key} data-mark={i} x={mx - 4} y={kubar.y - 4} width={8} height={8} className={cn("money-mark", state)} style={style} />;
        })}
      </svg>
      {plates.map(([cx, cy], i) => (
        <p key={parties[i + 1]} className="t-ui-lg absolute -translate-x-1/2 whitespace-nowrap text-ink" style={{ left: cx, top: cy + h + t + layout.nameGap }}>
          {parties[i + 1]}
        </p>
      ))}
      {labels.map((label, i) => {
        const { key, className: state, style } = run(i);
        return (
          <div key={key} className={cn("money-words", state)} style={style}>
            <p className="iso-text-state absolute text-ink-muted" style={{ left: label.nx, top: label.ny, lineHeight: "20px" }}>
              {i + 1}
            </p>
            <p className={cn("t-fine absolute text-ink", label.centred && "-translate-x-1/2 text-center")} style={{ left: label.x, top: label.y, width: label.w }}>
              {payments[i]}
              {i === 1 && caption.top === undefined ? (
                <span data-stop="" className="block" style={{ width: caption.width }}>
                  {stop.join(" ")}
                </span>
              ) : null}
            </p>
            {i === 1 && caption.top !== undefined ? (
              <p data-stop="" className="t-fine absolute -translate-x-1/2 text-center whitespace-nowrap text-ink" style={{ left: layout.stop.x, top: caption.top, width: caption.width }}>
                <span className="block">{stop[0]}</span>
                <span className="block">{stop[1]}</span>
              </p>
            ) : null}
          </div>
        );
      })}
      <p className="t-ui-sm absolute bg-action px-3 py-1 text-on-action" style={{ left: kubar.box[0], top: kubar.box[1] }}>
        {parties[0]}
      </p>
      <p className="t-fine absolute whitespace-nowrap text-ink-muted" style={{ left: kubar.from, top: kubar.label }}>
        {dataPath}
      </p>
      <p className="t-fine absolute bg-page px-2 py-0.5 whitespace-nowrap text-ink-muted" style={{ left: kubar.chip[0], top: kubar.chip[1] }}>
        {kubarNote}
      </p>
      {kubar.marks.map((mx, i) => (
        <p key={mx} className="iso-text-state absolute text-ink-muted" style={{ left: mx - 4, top: kubar.y + 10, lineHeight: "20px" }}>
          {i + 1}
        </p>
      ))}
    </div>
  );
}

export function MoneyPath({
  parties,
  payments,
  routes,
  sweep,
  kubarNote,
  dataPath,
  under,
  columns,
  controls,
  alt,
  className,
}: {
  /** Kubar, the buyer, the financier, the exporter's bank. */
  parties: string[];
  /** Purchase price (financier to bank), face value (buyer to financier), deferred price (financier to bank). */
  payments: string[];
  /** Each payment's from and to, for the table that assistive technology reads. The face value's "to" is the collection account. */
  routes: [string, string][];
  /** Where the collection account's payments go ("swept to the financier"): the rest of the stop's caption. */
  sweep: string;
  kubarNote: string;
  /** The data path's label ("Data path · Kubar"). */
  dataPath: string;
  under: string;
  columns: { payment: string; from: string; to: string };
  /** The four controls: the three payments' short names, then "All three". */
  controls: string[];
  /** What the drawing shows, in a sentence: the table's caption. */
  alt: string;
  className?: string;
}) {
  const [ref, phase] = usePlayOnce<HTMLDivElement>(0.45);
  // A replay of one payment or all three; until then the first play, when the drawing is 45% in view.
  const [replays, setReplays] = useState<Run[]>([null, null, null]);
  const [played, setPlayed] = useState(false);
  const seq = useRef(0);
  const timers = useRef<number[]>([]);
  // A payment's movement is over 1.1 s after it starts; the first play, after the third.
  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setTimeout(() => setPlayed(true), 80 + 2 * 1100 + 1100);
    return () => window.clearTimeout(timer);
  }, [phase]);
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);
  const first = (i: number): Run => (phase === "playing" ? (played ? "lit" : { seq: 0, at: 80 + i * 1100 }) : null);
  const runs = replays.map((replay, i) => replay ?? first(i));
  const replay = (from: number, to: number) => {
    seq.current += 1;
    const n = seq.current;
    setReplays((current) => current.map((r, i) => (i >= from && i <= to ? { seq: n, at: 80 + (i - from) * 1100 } : r)));
    const lit = () => setReplays((current) => current.map((r) => (r && r !== "lit" && r.seq === n ? "lit" : r)));
    timers.current.push(window.setTimeout(lit, 80 + (to - from) * 1100 + 1100));
  };
  const stop: [string, string] = [`${routes[1][1]},`, sweep];
  const props = { parties, payments, stop, kubarNote, dataPath, runs };

  return (
    <div data-money="" className={cn("mx-auto w-full max-w-[760px]", className)}>
      <div ref={ref} data-phase={phase} aria-hidden="true" className="money-art">
        <Drawing layout={WIDE} {...props} className="hidden min-[900px]:block" />
        <Drawing layout={NARROW} {...props} className="money-narrow mx-auto min-[900px]:hidden" />
      </div>
      {/* Replays: one payment, or all three. They need script and motion. */}
      <div className="money-controls mt-5 flex flex-wrap justify-center gap-2 motion-reduce:hidden min-[900px]:justify-start min-[900px]:px-7">
        {controls.map((label, i) => (
          <button
            key={label}
            type="button"
            data-replay={i < 3 ? i : "all"}
            onClick={() => (i < 3 ? replay(i, i) : replay(0, 2))}
            className="t-ui flex min-h-11 cursor-pointer items-center gap-2 border border-rule-strong bg-page px-3.5 text-ink transition-colors duration-(--duration-hover) hover:bg-action hover:text-on-action lg:min-h-10"
          >
            {i < 3 ? <span className="t-code opacity-70">{i + 1}</span> : null}
            {label}
          </button>
        ))}
      </div>
      {/* For assistive technology, in place of the drawing: each payment with its from and to. (The
          wrapper is what's visually hidden: a table can't be made narrower than its words.) */}
      <div className="sr-only">
        <table>
          <caption>{alt}</caption>
          <thead>
            <tr>
              {[columns.payment, columns.from, columns.to].map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, i) => (
              <tr key={payment}>
                <th scope="row">{payment}</th>
                <td>{routes[i][0]}</td>
                <td>{i === 1 ? stop.join(" ") : routes[i][1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>{kubarNote}</p>
      </div>
      <p className="t-body-sm mx-auto mt-4 max-w-[44em] text-center text-ink-muted min-[900px]:mx-0 min-[900px]:max-w-none min-[900px]:px-7 min-[900px]:text-left">{under}</p>
    </div>
  );
}
