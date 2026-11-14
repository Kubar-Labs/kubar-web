import { GroundShadow } from "@/components/drawings/iso";
import { PlayOnce } from "@/components/drawings/PlayOnce";
import { FootnoteMarker } from "@/components/ui/Footnote";
import { cn } from "@/lib/utils";

/*
 * Foundations · isometric (Figma 246:3160 in the tinted panel 242:3433 at
 * 1440; 248:3429 at 768; 248:3910 at 390; REDRAW-2026-11-14.md, Home and
 * About). Four solid blocks, widest at the bottom, and the venue as a dashed
 * outline on top, each tied by a leader to its title and sentence. Desktop
 * sets the labels beside the drawing; tablet and phone list them under it,
 * venue first.
 *
 * The labels are the content, an ordered list from the top of the stack
 * down; the drawing is aria-hidden.
 *
 * Motion (section 7): when 40% of the drawing is in view, the blocks rise
 * into place from the bottom one at a time, 80 ms apart; then the venue's
 * dashed outline draws (stroke-dashoffset, 480 ms), revealed through a mask
 * whose solid copy draws, since a dashed line can't draw with its own
 * dashoffset (section 9.4). Hover, focus or tap on a label highlights its
 * block's top face in accent-soft (CSS :has, globals.css). The markup is
 * rendered on the server; PlayOnce only sets the motion phase.
 */
export type Foundation = { name: string; line: string; where?: string; planned?: boolean };
type FootnoteRef = (suffix: string) => { target: string; refId: string };

// The drawing, from the Figma frame (its own pixels; desktop scale).
const CX = 280;
const SIDE = [300, 260, 220, 180, 140]; // bottom block to the venue
const STEP = 58;
const THICK = 40;
const BOTTOM_TOP = 242; // top vertex of the bottom block
const WIDTH = 560;
const HEIGHT = 640;
const k = 0.866;

function faces(level: number) {
  const s = SIDE[level];
  const y = BOTTOM_TOP - level * STEP;
  const top = { x: CX, y };
  const right = { x: CX + k * s, y: y + s / 2 };
  const front = { x: CX, y: y + s };
  const left = { x: CX - k * s, y: y + s / 2 };
  const pts = (...p: { x: number; y: number }[]) => p.map((q) => `${q.x.toFixed(2)},${q.y.toFixed(2)}`).join(" ");
  const down = (q: { x: number; y: number }) => ({ x: q.x, y: q.y + THICK });
  return {
    top: pts(top, right, front, left),
    left: pts(left, front, down(front), down(left)),
    right: pts(front, right, down(right), down(front)),
    // The visible edges as one path, for the dashed outline and its mask.
    outline: [
      `M${pts(top)} L${pts(right)} L${pts(front)} L${pts(left)} Z`,
      `M${pts(left)} L${pts(down(left))} L${pts(down(front))} L${pts(down(right))} L${pts(right)}`,
      `M${pts(front)} L${pts(down(front))}`,
    ].join(" "),
    leaderY: right.y + THICK / 2,
    leaderX: right.x + 8,
  };
}

export function IsoFoundations({
  title,
  foundations,
  footnote,
  plannedStyle = "tag",
  id,
  className,
}: {
  title: string;
  /** Top of the stack first: the venue, then down to the common standard. */
  foundations: Foundation[];
  footnote: FootnoteRef;
  /** Home sets "Planned¹" as a small rani label; About as the state word. */
  plannedStyle?: "tag" | "state";
  /** Unique on the page: names the outline's mask. */
  id: string;
  className?: string;
}) {
  const maskId = `${id}-outline`;
  const levels = foundations.length;
  // Label i (top first) belongs to block level (levels - 1 - i).
  const levelOf = (i: number) => levels - 1 - i;

  return (
    <div className={cn("flex flex-col gap-8 bg-inset px-5 pt-5 pb-8 md:px-8 md:pt-8 md:pb-10 lg:px-12 lg:pt-10 lg:pb-12", className)}>
      <h3 className="t-h3 text-ink">{title}</h3>
      <PlayOnce className="iso-foundations relative">
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width={WIDTH}
          height={HEIGHT}
          className="mx-auto block h-auto w-full max-w-[560px] overflow-visible lg:mx-0"
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x={-20} y={-20} width={WIDTH + 40} height={HEIGHT + 40}>
              <path d={faces(levels - 1).outline} pathLength={1} className="iso-outline-mask" />
            </mask>
          </defs>
          <GroundShadow cx={CX} cy={567} rx={230} ry={55} />
          {foundations
            .map((f, i) => ({ f, i, level: levelOf(i) }))
            .sort((a, b) => a.level - b.level)
            .map(({ f, level }) => {
              const shape = faces(level);
              if (f.planned) {
                return (
                  <g key={f.name}>
                    <path d={shape.outline} mask={`url(#${maskId})`} className="iso-venue" />
                    <line x1={shape.leaderX} x2={584} y1={shape.leaderY} y2={shape.leaderY} className="iso-leader-line is-dashed hidden lg:inline" />
                  </g>
                );
              }
              return (
                <g key={f.name} className="iso-rise" style={{ ["--level" as string]: level }}>
                  <g className="iso-block">
                    <polygon points={shape.left} className="fill-[var(--petrol-100)]" />
                    <polygon points={shape.right} className="fill-[var(--petrol-50)]" />
                    <polygon points={shape.top} data-level={level} className="iso-top" />
                  </g>
                  <line x1={shape.leaderX} x2={584} y1={shape.leaderY} y2={shape.leaderY} className="iso-leader-line hidden lg:inline" />
                </g>
              );
            })}
        </svg>

        <ol className="mt-6 lg:absolute lg:inset-y-0 lg:right-[-24px] lg:left-[600px] lg:mt-0">
          {foundations.map((f, i) => {
            const shape = faces(levelOf(i));
            return (
              <li
                key={f.name}
                // Not a tab stop: the highlight only points at the block (the
                // words are all here), so a tap or click focuses it but Tab skips it.
                tabIndex={f.planned ? undefined : -1}
                data-level={levelOf(i)}
                style={{ ["--label-top" as string]: `${shape.leaderY - 14}px` }}
                className="flex flex-col gap-1 border-t border-rule py-4 outline-offset-4 lg:absolute lg:right-0 lg:left-0 lg:top-(--label-top) lg:border-0 lg:py-0"
              >
                {f.planned && plannedStyle === "tag" ? (
                  <span className="t-tag text-accent lg:hidden">
                    {f.where}
                    <FootnoteMarker n={1} {...footnote("stack-where")} />
                  </span>
                ) : null}
                <span className="flex items-baseline justify-between gap-4">
                  <span className="t-ui-lg text-ink">{f.name}</span>
                  {f.planned ? (
                    <span className={cn(plannedStyle === "tag" ? "t-tag hidden text-accent lg:inline" : "t-state shrink-0 text-ink-muted")}>
                      {f.where}
                      {plannedStyle === "tag" ? <FootnoteMarker n={1} {...footnote("stack-where-desktop")} /> : null}
                    </span>
                  ) : null}
                </span>
                <span className="t-body-sm text-ink-muted">
                  {f.line}
                  {f.planned ? <FootnoteMarker n={1} {...footnote("stack-line")} /> : null}
                </span>
              </li>
            );
          })}
        </ol>
      </PlayOnce>
    </div>
  );
}
