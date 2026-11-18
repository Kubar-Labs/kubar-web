import { KubarMark } from "@/components/brand/KubarMark";
import { cx as cn } from "@/lib/cx";

/*
 * The lanes of NavDhan SDK's pinned journey, "How it runs on your platform."
 * (step 10; Figma 331:1202 at 1440; on phones the prototype's narrow lanes,
 * docs/rebuild/prototypes/motion-pieces.html, section C).
 *
 * Three parties as columns with lifelines: Your platform, Kubar Protocol
 * (petrol, with the mark) and The financier; five numbered rows with
 * hairlines between them, drawn like Home's lanes. Row n lights with card n:
 * the inset band and the rani mark at its left move to it and its number
 * turns rani. Rows before it stay drawn; rows after it are empty.
 *   1  an ink square on Your platform
 *   2  a square and "NavDhan SDK"
 *   3  "With the exporter's consent" over a dashed arrow to Kubar Protocol
 *   4  "The evidence package" over a solid line to a square on The financier
 *   5  "Each step as it happens" over a dashed arrow back to Your platform,
 *      and a square on The financier
 *
 * Positioned HTML sized in CSS (globals.css, .run-lanes; the sizes live on the
 * story so the cards can read them): the columns divide the drawing's own
 * width, so it fits its column at any width without scaling its words, and
 * the rows come from the screen's height in svh. Phones get the prototype's
 * narrow drawing: smaller party boxes across the full width, 44 px rows.
 * Rendered on the server; which rows are drawn follows data-story-state, in
 * CSS. Decorative for assistive technology: the cards (or the register)
 * carry the five steps.
 */
type Paths = { sdk: string; consent: string; evidence: string; status: string };

/** A lifeline's x: the columns start at --run-cols and divide the rest in three. */
const lane = (c: number) => `calc(var(--run-cols) + (100% - var(--run-cols)) * ${2 * c + 1} / 6)`;
const columns = (n: number) => `calc((100% - var(--run-cols)) * ${n} / 3)`;
const rowTop = (n: number) => `calc(var(--run-party-h) + ${n - 1} * var(--run-row-h))`;
const rowMid = (n: number) => `calc(var(--run-party-h) + ${n - 0.5} * var(--run-row-h))`;
/** Where a row's arrow runs, and where the label over it starts. */
const arrowY = (n: number) => `calc(${rowMid(n)} + var(--run-arrow-dy))`;
const labelY = (n: number) => `calc(${rowMid(n)} + var(--run-label-dy))`;

/** An action within a lane, at the row's middle or on its arrow. */
function Square({ at, top }: { at: number; top: string }) {
  return <span className="absolute size-(--run-sq) -translate-1/2 bg-ink" style={{ left: lane(at), top }} />;
}

function Label({ left, top, children, centred }: { left: string; top: string; children: React.ReactNode; centred?: boolean }) {
  return (
    <span className={cn("t-ui-sm absolute whitespace-nowrap text-ink-muted", centred && "-translate-y-1/2")} style={{ left, top }}>
      {children}
    </span>
  );
}

/**
 * An arrow from one lifeline to another, drawn from its origin: dashed and muted for data, a solid
 * ink line for the evidence package, whose head stops at the square on the financier's lifeline.
 */
function Arrow({ from, to, row, kind }: { from: number; to: number; row: number; kind: "data" | "line" }) {
  const back = to < from;
  const data = kind === "data";
  return (
    <span
      className={cn("absolute h-[10px] -translate-y-1/2", back && "-scale-x-100")}
      style={{
        left: lane(Math.min(from, to)),
        width: data ? columns(Math.abs(to - from)) : `calc(${columns(Math.abs(to - from))} - var(--run-sq) / 2)`,
        top: arrowY(row),
      }}
    >
      <svg className="absolute inset-0 h-[10px] w-full overflow-visible">
        <line
          x1="0"
          x2="100%"
          y1="5"
          y2="5"
          className={data ? "stroke-ink-muted" : "stroke-ink"}
          strokeWidth={1.5}
          strokeDasharray={data ? "6 4" : undefined}
        />
      </svg>
      {/* The head: an open chevron, its tip on the end. */}
      <svg className="absolute top-0 -right-px h-[10px] w-2 overflow-visible" viewBox="0 0 8 10">
        <path d="M1.75 0.5L7.75 5L1.75 9.5" className={cn("fill-none", data ? "stroke-ink-muted" : "stroke-ink")} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function RunLanes({ lanes, paths, className }: { lanes: string[]; paths: Paths; className?: string }) {
  const label = (c: number) => `calc(${lane(c)} + var(--run-label-x))`;
  return (
    <div aria-hidden="true" className={cn("run-lanes select-none", className)}>
      {/* The current row's ground and the rani mark at its left, moved to the current step. */}
      <span className="run-current absolute right-0 bg-inset" style={{ left: "var(--run-gutter)", top: rowTop(1), height: "var(--run-row-h)" }}>
        <span className="absolute inset-y-0 right-full w-(--run-mark) bg-accent" />
      </span>

      {lanes.map((name, c) => (
        <span key={`life-${name}`} className="absolute w-px bg-rule" style={{ left: lane(c), top: "var(--run-box-h)", bottom: 0 }} />
      ))}
      {[2, 3, 4, 5].map((n) => (
        <span key={n} className="absolute right-0 h-px bg-rule" style={{ left: "var(--run-gutter)", top: rowTop(n) }} />
      ))}

      {lanes.map((name, c) => (
        <span
          key={name}
          className={cn(
            "run-party absolute top-0 flex flex-col items-center justify-center gap-2 px-1 text-center whitespace-nowrap md:px-2",
            "text-[12px] leading-4 font-medium md:t-ui",
            c === 1 ? "bg-action text-on-action" : "border border-rule-strong bg-raised text-ink",
          )}
          style={{ left: `calc(${lane(c)} - var(--box-w) / 2)` }}
        >
          {c === 1 ? <KubarMark height={20} className="hidden shrink-0 md:block" /> : null}
          {name}
        </span>
      ))}

      {[1, 2, 3, 4, 5].map((n) => (
        <span key={`no-${n}`} data-row={n} className="run-no t-tag absolute left-0 -translate-y-1/2" style={{ top: rowMid(n) }}>
          {String(n).padStart(2, "0")}
        </span>
      ))}

      <span data-row={1} className="run-row absolute inset-0">
        <Square at={0} top={rowMid(1)} />
      </span>
      <span data-row={2} className="run-row absolute inset-0">
        <Square at={0} top={rowMid(2)} />
        <Label left={`calc(${lane(0)} + var(--run-sq) / 2 + 9px)`} top={rowMid(2)} centred>
          {paths.sdk}
        </Label>
      </span>
      <span data-row={3} className="run-row absolute inset-0">
        <Label left={label(0)} top={labelY(3)}>
          {paths.consent}
        </Label>
        <Arrow from={0} to={1} row={3} kind="data" />
      </span>
      <span data-row={4} className="run-row absolute inset-0">
        <Label left={label(1)} top={labelY(4)}>
          {paths.evidence}
        </Label>
        <Arrow from={1} to={2} row={4} kind="line" />
        <Square at={2} top={arrowY(4)} />
      </span>
      <span data-row={5} className="run-row absolute inset-0">
        <Label left={label(0)} top={labelY(5)}>
          {paths.status}
        </Label>
        <Arrow from={1} to={0} row={5} kind="data" />
        <Square at={2} top={arrowY(5)} />
      </span>
    </div>
  );
}
