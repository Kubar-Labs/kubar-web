import { IsoSheetShape } from "@/components/drawings/iso";

/*
 * Three zones · isometric (Figma 290:2574 in About's section 173:417;
 * REDRAW-2026-11-14.md, section 12, item 4), beside "Why GIFT City". Three
 * platforms in a row, each with a title and a line under it: Onshore India,
 * GIFT City (petrol top, a small receivable sheet on it) and Abroad. Above
 * them a dashed arrow "The receivable" and a solid arrow "Purchase price"
 * between the first two, and a solid arrow "Payment on the due date" from
 * Abroad to GIFT City. A schematic, not a map. No motion.
 *
 * The words are real text; the art is aria-hidden. From 768 up the drawing
 * takes its column's width and the words sit on it at the frame's
 * proportions. On phones the platforms are too small to carry them, so the
 * three zones and then the three arrows are listed under the drawing.
 */
export type ZonesCopy = {
  zones: { title: string; line: string }[];
  /** The receivable (data), the purchase price and the payment on the due date (money). */
  arrows: [string, string, string];
};

const SIDE = 129.6;
const THICK = 28.8;
const TOP = 96;
const CX = [132.23, 399.23, 666.23];
const k = 0.866;
const W = 800;
const H = 262;

type Pt = [number, number];
const pts = (...p: Pt[]) =>
  p.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
function platform(cx: number) {
  const top: Pt = [cx, TOP];
  const right: Pt = [cx + k * SIDE, TOP + SIDE / 2];
  const front: Pt = [cx, TOP + SIDE];
  const left: Pt = [cx - k * SIDE, TOP + SIDE / 2];
  const down = ([x, y]: Pt): Pt => [x, y + THICK];
  return {
    top: pts(top, right, front, left),
    left: pts(left, front, down(front), down(left)),
    right: pts(front, right, down(right), down(front)),
  };
}
const pct = (x: number) => `${((x / W) * 100).toFixed(2)}%`;

function Glyph({ kind }: { kind: "data" | "money" }) {
  return (
    <svg
      aria-hidden="true"
      width={22}
      height={10}
      viewBox="0 0 22 10"
      className="shrink-0 overflow-visible"
    >
      {kind === "data" ? (
        <line
          x1={0}
          x2={15}
          y1={5}
          y2={5}
          className="stroke-ink-muted"
          strokeWidth={1.5}
          strokeDasharray="5 3"
        />
      ) : (
        <line
          x1={0}
          x2={15}
          y1={5}
          y2={5}
          className="stroke-ink"
          strokeWidth={2}
        />
      )}
      <polygon
        points="22,5 15,0.8 15,9.2"
        className={kind === "data" ? "fill-ink-muted" : "fill-ink"}
      />
    </svg>
  );
}

export function ThreeZones({
  copy,
  className,
}: {
  copy: ZonesCopy;
  className?: string;
}) {
  const [receivable, purchase, payment] = copy.arrows;
  return (
    <div className={className}>
      {/* The drawing and its arrow labels share one box, so the labels keep their places on it. */}
      <div className="relative">
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          className="block h-auto w-full overflow-visible"
        >
          {CX.map((cx, i) => {
            const p = platform(cx);
            const gift = i === 1;
            return (
              <g key={cx} className="iso-block">
                <polygon
                  points={p.left}
                  className="fill-[var(--petrol-100)] stroke-rule"
                />
                <polygon
                  points={p.right}
                  className="fill-[var(--petrol-50)] stroke-rule"
                />
                <polygon
                  points={p.top}
                  className={
                    gift
                      ? "fill-[var(--petrol-900)]"
                      : "fill-raised stroke-rule"
                  }
                />
              </g>
            );
          })}
          {/* The receivable, on GIFT City. */}
          <IsoSheetShape x={CX[1]} y={124} w={71.4} h={71.4} elevation={1}>
            <rect x={5.5} y={7} width={26} height={2.2} className="fill-ink" />
            <rect
              x={5.5}
              y={18.9}
              width={50.4}
              height={1.3}
              className="fill-rule"
            />
            <rect
              x={5.5}
              y={23.1}
              width={40.3}
              height={1.3}
              className="fill-rule"
            />
            <rect
              x={5.5}
              y={27.3}
              width={55.4}
              height={1.3}
              className="fill-rule"
            />
            <rect
              x={51.7}
              y={51.7}
              width={13.4}
              height={13.4}
              className="fill-inset"
            />
          </IsoSheetShape>
          {/* The receivable goes to GIFT City (data); the purchase price comes back; the buyer's payment comes in. */}
          <line
            x1={152}
            x2={372}
            y1={44}
            y2={44}
            className="stroke-ink-muted"
            strokeWidth={1.5}
            strokeDasharray="5 3"
          />
          <polygon
            points="379,44 372,39.8 372,48.2"
            className="fill-ink-muted"
          />
          <line
            x1={159}
            x2={379}
            y1={72}
            y2={72}
            className="stroke-ink"
            strokeWidth={2}
          />
          <polygon points="152,72 159,67.8 159,76.2" className="fill-ink" />
          <line
            x1={426}
            x2={646}
            y1={58}
            y2={58}
            className="stroke-ink"
            strokeWidth={2}
          />
          <polygon points="419,58 426,53.8 426,62.2" className="fill-ink" />
        </svg>

        {/* From 768 up: the arrow labels on the drawing, at the frame's proportions; the zones under it. */}
        <p
          className="t-fine absolute top-[15.3%] hidden -translate-y-full whitespace-nowrap text-ink-muted md:block"
          style={{ left: pct(221) }}
        >
          {receivable}
        </p>
        <p
          className="t-fine absolute top-[29.8%] hidden whitespace-nowrap text-ink-muted md:block"
          style={{ left: pct(220) }}
        >
          {purchase}
        </p>
        <p
          className="t-fine absolute top-[20.6%] hidden -translate-y-full whitespace-nowrap text-ink-muted md:block"
          style={{ left: pct(458) }}
        >
          {payment}
        </p>
      </div>
      <ul className="mt-4 hidden md:grid md:grid-cols-[28.1%_28.1%_28.1%] md:gap-x-[5.275%] md:pl-[2.5%]">
        {copy.zones.map((zone) => (
          <li key={zone.title} className="flex flex-col gap-1">
            <span className="t-ui-lg text-ink">{zone.title}</span>
            <span className="t-body-sm text-ink-muted">{zone.line}</span>
          </li>
        ))}
      </ul>

      {/* Phones: the zones, then the arrows, as lists under the drawing. */}
      <div className="mt-6 flex flex-col gap-5 md:hidden">
        <ul className="flex flex-col gap-3">
          {copy.zones.map((zone) => (
            <li key={zone.title} className="flex flex-col gap-0.5">
              <span className="t-ui-lg text-ink">{zone.title}</span>
              <span className="t-body-sm text-ink-muted">{zone.line}</span>
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-1.5">
          {([receivable, purchase, payment] as const).map((label, i) => (
            <li
              key={label}
              className="t-fine flex items-center gap-3 text-ink-muted"
            >
              <Glyph kind={i === 0 ? "data" : "money"} />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
