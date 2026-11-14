import { ISO_MATRIX } from "@/components/drawings/iso";
import { PlayOnce } from "@/components/drawings/PlayOnce";
import { cn } from "@/lib/utils";

/*
 * Eight states · isometric steps (Figma 258:1829 at 1440, 260:2130 at 768,
 * 260:2379 at 390; REDRAW-2026-11-14.md, How it works hero). Eight blocks
 * rising left to right on one ground, numbered 01 to 08 on their top faces;
 * 08's top is petrol. Each block is three polygons (section 4): the top face
 * white, the left face petrol/100, the right face petrol/50.
 *
 * Aria-hidden: the hero's words say what it shows, and the rail below names
 * the eight states. The numbers are part of the picture, as on Home's sheets.
 *
 * Motion (section 7), once: the blocks rise in order 01 to 08, 60 ms apart;
 * 08's top turns petrol last (its petrol face fades in over the white one,
 * so only opacity and transform move). At desktop the drawing is on the
 * first screen and plays as the page loads; where it starts below the fold
 * (phones) it waits until it is in view (PlayOnce; globals.css,
 * .steps-rise). Nothing moves with reduced motion.
 *
 * Coordinates are the 1440 frame's own (560 × 420). Smaller widths scale the
 * same drawing to their column: 0.625 at 390, as the 390 frame draws it. The
 * numbers scale less, as the 390 frame sets them (about 11 px there; 13 at
 * full size): their size follows the drawing's container (globals.css).
 */
const S = 64; // each top face, square before projection
const HALF = 0.866 * S; // half the projected face's width
const RISE = 12; // each block stands this much taller than the one before
const BASE = 16; // block 01's height
const FIRST = { x: 70, y: 318 }; // block 01's top vertex
const COUNT = 8;

type Pt = [number, number];
const pts = (...p: Pt[]) => p.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

function block(i: number) {
  const x = FIRST.x + i * HALF;
  const y = FIRST.y - i * (S / 2 + RISE);
  const t = BASE + i * RISE;
  const right: Pt = [x + HALF, y + S / 2];
  const front: Pt = [x, y + S];
  const left: Pt = [x - HALF, y + S / 2];
  const down = ([px, py]: Pt): Pt => [px, py + t];
  return {
    x,
    y,
    left: pts(left, front, down(front), down(left)),
    right: pts(front, right, down(right), down(front)),
  };
}

function TopFace({ x, y, no, petrol }: { x: number; y: number; no: string; petrol?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) ${ISO_MATRIX}`}>
      <rect
        width={S}
        height={S}
        className={petrol ? "fill-[var(--petrol-900)] stroke-[var(--petrol-700)]" : "fill-raised stroke-rule"}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <text x={9} y={21} className={cn("iso-text-code", petrol ? "fill-raised" : "fill-ink")}>
        {no}
      </text>
    </g>
  );
}

export function IsoSteps({ className }: { className?: string }) {
  const blocks = Array.from({ length: COUNT }, (_, i) => ({ i, no: String(i + 1).padStart(2, "0"), ...block(i) }));
  return (
    <PlayOnce className="@container">
      <svg aria-hidden="true" viewBox="0 0 560 420" width={560} height={420} className={cn("iso-steps block h-auto w-full overflow-visible", className)}>
        {/* The ground shadow along the staircase. */}
        <ellipse cx={283.5} cy={258.2} rx={260} ry={60} transform="rotate(-22 283.5 258.2)" className="iso-ground" />
        {/* Back to front: 08 first, so each nearer block covers the foot of the one behind it. */}
        {[...blocks].reverse().map(({ i, no, x, y, left, right }) => (
          <g key={no} className="steps-rise" style={{ ["--i" as string]: i }}>
            <polygon points={left} className="fill-[var(--petrol-100)] stroke-rule" strokeWidth={1} strokeLinejoin="round" />
            <polygon points={right} className="fill-[var(--petrol-50)] stroke-rule" strokeWidth={1} strokeLinejoin="round" />
            <TopFace x={x} y={y} no={no} />
            {i === COUNT - 1 ? (
              <g className="steps-petrol">
                <TopFace x={x} y={y} no={no} petrol />
              </g>
            ) : null}
          </g>
        ))}
      </svg>
    </PlayOnce>
  );
}
