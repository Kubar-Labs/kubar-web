import { GroundShadow, IsoSheetShape } from "@/components/drawings/iso";

/*
 * Limit and receivables · isometric (Figma 250:1744 at 1440, 257:2383 at
 * 390; REDRAW-2026-11-14.md, Kubar Protocol hero). The programme limit as a
 * dashed box on an inset floor; RCV-0001 and RCV-0002 inside it at rest
 * (--elevation-1); RCV-0003 above it with a rani edge (--elevation-3), the
 * next receivable that fits. Aria-hidden: the hero's words say it.
 *
 * Motion (section 7), on page load and once: RCV-0003 starts 40 px higher
 * and settles to its place above the box (.limit-settle, globals.css). No
 * movement with reduced motion.
 *
 * Coordinates are the frame's own (500 × 440); the viewBox crops the empty
 * margin so phones get the drawing at the frame's scale.
 */
const SIDE = 230; // the limit's floor, square before projection
const SHEET = 170; // each receivable
const CX = 250; // the top vertex of everything

function Sheet({ label, current }: { label: string; current?: boolean }) {
  return (
    <>
      <text x={13} y={27} className={current ? "iso-text-code fill-accent" : "iso-text-code fill-ink"}>
        {label}
      </text>
      <rect x={13} y={45} width={120} height={3} className="fill-rule" />
      <rect x={13} y={55} width={96} height={3} className="fill-rule" />
      <rect x={13} y={65} width={132} height={3} className="fill-rule" />
      <rect x={13} y={75} width={84} height={3} className="fill-rule" />
      <rect x={123} y={123} width={32} height={32} className="fill-inset" />
    </>
  );
}

export function LimitDrawing({
  className,
  still = false,
  full = false,
}: {
  className?: string;
  /** No settling movement (the insurance section's copy of the box). */
  still?: boolean;
  /** The frame's whole 500 × 440, so overlays in its coordinates line up. */
  full?: boolean;
}) {
  // The floor's corners, projected: top, right, front, left.
  const half = 0.866 * SIDE;
  const floor = (y: number) => ({ top: [CX, y], right: [CX + half, y + SIDE / 2], front: [CX, y + SIDE], left: [CX - half, y + SIDE / 2] });
  const base = floor(185);
  const rim = floor(65);
  const line = (...pts: number[][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y}`).join(" ");
  const edge = "limit-edge";

  return (
    <svg aria-hidden="true" viewBox={full ? "0 0 500 440" : "13 25 474 415"} width={full ? 500 : 474} height={full ? 440 : 415} className={className}>
      <GroundShadow cx={250} cy={400} rx={180} ry={45} />
      {/* The floor and the back of the box. */}
      <path d={`${line(base.top, base.right, base.front, base.left)} Z`} className="fill-inset" />
      <path d={line(base.left, base.top, base.right)} className={edge} />
      <path d={line([CX, rim.top[1]], base.top)} className={edge} />
      <path d={line(rim.left, rim.top, rim.right)} className={edge} />
      {/* The two receivables already bought, inside the limit. */}
      <IsoSheetShape x={CX} y={211} w={SHEET} h={SHEET} elevation={1}>
        <Sheet label="RCV-0001" />
      </IsoSheetShape>
      <IsoSheetShape x={CX} y={199} w={SHEET} h={SHEET} elevation={1}>
        <Sheet label="RCV-0002" />
      </IsoSheetShape>
      {/* The front of the box. */}
      <path d={line(base.left, base.front, base.right)} className={edge} />
      <path d={line([CX, rim.front[1]], base.front)} className={edge} />
      <path d={line(rim.left, base.left)} className={edge} />
      <path d={line(rim.right, base.right)} className={edge} />
      <path d={line(rim.left, rim.front, rim.right)} className={edge} />
      {/* The next receivable that fits. */}
      <g className={still ? undefined : "limit-settle"}>
        <IsoSheetShape x={CX} y={45} w={SHEET} h={SHEET} current>
          <Sheet label="RCV-0003" current />
        </IsoSheetShape>
      </g>
    </svg>
  );
}
