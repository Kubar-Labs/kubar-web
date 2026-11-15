import { KubarMark } from "@/components/brand/KubarMark";
import { cx as cn } from "@/lib/cx";

/*
 * The lanes drawing of the pinned story (REDRAW-2026-11-14.md, section 3a;
 * Figma C4 118:1470 for the parts, 266:4120 for the compact version).
 *
 * Six parties as columns with lifelines; Kubar is the one filled box. Eight
 * states as rows. The data path is dashed (1.5 px, muted) and runs through
 * Kubar at every step; the money path is solid (2 px, ink) and never
 * touches Kubar. Rows written so far are drawn, the current one on the inset
 * ground with the rani marker at its left edge; later rows are empty.
 *
 * Positioned HTML sized by CSS (globals.css, .lanes): the columns divide the
 * drawing's own width, so it fits its column at any width, and the rows come
 * from the viewport in svh, so the phone's address bar doesn't make it jump.
 * Desktop adds the row numbers, the Kubar mark and the path labels; tablets
 * and phones get the compact drawing, where the cards carry the words.
 * Decorative for assistive technology: the cards (or the ledger) carry the
 * same eight states.
 *
 * Rendered on the server: which rows are written, where the current row sits
 * and the row numbers' colours follow data-story-state on the story, in CSS
 * (globals.css), so none of this ships as script.
 */
export type LaneLabels = {
  s1: string; s2: string; s3: string; s4: string; s5data: string; s5money: string;
  s6: string; s6face: string; s6balance: string; s7: string; s8: string;
};

type Arrow = { kind: "data" | "money"; from: number; to: number; label: keyof LaneLabels; dy?: -1 | 1 };
type Mark = { kind: "mark"; at: number; label: keyof LaneLabels; dy?: -1 | 1; planned?: boolean };

// Columns: 0 Exporter, 1 Kubar, 2 Insurer, 3 Buyer, 4 Financier, 5 Exporter's bank.
const ROWS: (Arrow | Mark)[][] = [
  [{ kind: "data", from: 0, to: 1, label: "s1" }],
  [{ kind: "mark", at: 1, label: "s2" }],
  [{ kind: "data", from: 2, to: 1, label: "s3" }],
  [{ kind: "data", from: 3, to: 1, label: "s4" }],
  [
    { kind: "data", from: 1, to: 4, label: "s5data", dy: -1 },
    { kind: "money", from: 4, to: 5, label: "s5money", dy: 1 },
  ],
  [
    { kind: "mark", at: 1, label: "s6", dy: -1 },
    { kind: "money", from: 3, to: 4, label: "s6face", dy: 1 },
    { kind: "money", from: 4, to: 5, label: "s6balance", dy: 1 },
  ],
  [{ kind: "mark", at: 1, label: "s7" }],
  [{ kind: "mark", at: 1, label: "s8", planned: true }],
];

const col = (c: number) => `calc(var(--gutter) + (100% - var(--gutter)) * ${2 * c + 1} / 12)`;
const span = (n: number) => `calc((100% - var(--gutter)) * ${n} / 6)`;
const rowTop = (n: number) => `calc(var(--party-h) + ${n - 1} * var(--row-h))`;
const rowMid = (n: number, dy = 0) => `calc(var(--party-h) + ${n - 0.5} * var(--row-h) + ${dy} * var(--dy))`;

function LaneArrow({ arrow, row }: { arrow: Arrow; row: number }) {
  const left = Math.min(arrow.from, arrow.to);
  const money = arrow.kind === "money";
  return (
    <span
      className={cn("absolute h-3 -translate-y-1/2", arrow.to < arrow.from && "-scale-x-100")}
      style={{ left: col(left), width: span(Math.abs(arrow.to - arrow.from)), top: rowMid(row, arrow.dy) }}
    >
      {/* Drawn from its origin to its head, which stops 4 px short of the lifeline. */}
      <svg className="absolute top-0 left-[3px] h-3 w-[calc(100%-14px)] overflow-visible">
        {money ? (
          <line x1="0" x2="100%" y1="6" y2="6" className="stroke-ink" strokeWidth={2} />
        ) : (
          <line x1="0" x2="100%" y1="6" y2="6" className="stroke-ink-muted" strokeWidth={1.5} strokeDasharray="5 3" />
        )}
      </svg>
      <svg className="absolute top-0 right-1 h-3 w-[7px] overflow-visible" viewBox="0 0 7 12">
        <polygon points="7,6 0,2.4 0,9.6" className={money ? "fill-ink" : "fill-ink-muted"} />
      </svg>
    </span>
  );
}

function LaneMark({ mark, row }: { mark: Mark; row: number }) {
  return (
    <span
      className={cn("absolute size-[7px] -translate-1/2", mark.planned ? "border border-dashed border-ink-muted" : "bg-ink")}
      style={{ left: col(mark.at), top: rowMid(row, mark.dy) }}
    />
  );
}

function LaneLabel({ item, row, text, marker }: { item: Arrow | Mark; row: number; text: string; marker?: React.ReactNode }) {
  if (item.kind === "mark") {
    return (
      <span
        className="t-fine absolute hidden -translate-y-1/2 whitespace-nowrap text-ink-muted lg:block"
        style={{ left: `calc(${col(item.at)} + 12px)`, top: rowMid(row, item.dy) }}
      >
        {text}
        {marker}
      </span>
    );
  }
  const money = item.kind === "money";
  const start = `calc(${col(Math.min(item.from, item.to))} + 10px)`;
  // Data labels sit above their line, money labels below it.
  return (
    <span
      className={cn("t-fine absolute hidden whitespace-nowrap lg:block", money ? "text-ink" : "text-ink-muted")}
      style={
        money
          ? { left: start, top: `calc(${rowMid(row, item.dy)} + 7px)`, lineHeight: "16px" }
          : { left: start, top: `calc(${rowMid(row, item.dy)} - 21px)`, lineHeight: "16px" }
      }
    >
      {text}
    </span>
  );
}

export function Lanes({
  parties,
  labels,
  className,
}: {
  parties: string[];
  labels: LaneLabels;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn("lanes select-none", className)}>
      {/* The current row's ground and marker, moved to the current state. */}
      <span className="lane-current absolute right-0 bg-inset" style={{ left: "var(--gutter)", top: rowTop(1), height: "var(--row-h)" }}>
        <span className="absolute inset-y-0 -left-2 w-1 bg-accent" />
      </span>

      {parties.map((party, c) => (
        <span key={`life-${party}`} className="absolute bottom-0 w-px bg-rule" style={{ left: col(c), top: "var(--box-h)" }} />
      ))}
      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <span key={n} className="absolute right-0 h-px bg-rule" style={{ left: "var(--gutter)", top: rowTop(n + 1) }} />
      ))}

      {parties.map((party, c) => (
        <span
          key={party}
          className={cn(
            "absolute top-0 flex flex-col items-center justify-center gap-1 border border-rule-strong px-0.5 text-center",
            "text-[10px] leading-3 md:t-fine md:leading-4 lg:t-ui",
            c === 1 ? "bg-action text-on-action" : "bg-raised text-ink",
          )}
          style={{
            left: `calc(var(--gutter) + (100% - var(--gutter)) * ${c} / 6 + var(--box-inset))`,
            width: `calc((100% - var(--gutter)) / 6 - 2 * var(--box-inset))`,
            height: "var(--box-h)",
          }}
        >
          {c === 1 ? <KubarMark height={20} className="hidden lg:block" /> : null}
          {party}
        </span>
      ))}

      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
        <span
          key={`no-${n}`}
          data-row={n}
          className="lane-no t-code absolute left-0 hidden -translate-y-1/2 lg:block"
          style={{ top: rowMid(n) }}
        >
          {String(n).padStart(2, "0")}
        </span>
      ))}

      {ROWS.map((items, i) => {
        const n = i + 1;
        return (
          <span key={n} data-row={n} className="lane-row absolute inset-0">
            {items.map((item) =>
              item.kind === "mark" ? (
                <LaneMark key={item.label} mark={item} row={n} />
              ) : (
                <LaneArrow key={item.label} arrow={item} row={n} />
              ),
            )}
            {items.map((item) => (
              <LaneLabel
                key={`label-${item.label}`}
                item={item}
                row={n}
                text={labels[item.label]}
                marker={item.kind === "mark" && item.planned ? <span className="text-accent">¹</span> : null}
              />
            ))}
          </span>
        );
      })}
    </div>
  );
}
