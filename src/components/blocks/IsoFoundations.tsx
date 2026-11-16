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
 * dashoffset (section 9.4). On desktop, hover, focus or a click on a label
 * marks its block as the hero marks its current sheet: the face stays white
 * and its top edges turn rani at 2 px (drawn over the block from inside the
 * label; globals.css). Below desktop
 * there is no highlight: the labels sit under the drawing, in the blocks'
 * order (REDRAW section 10). The markup is rendered on the server;
 * PlayOnce only sets the motion phase.
 */
export type Foundation = { name: string; line: string; where?: string; planned?: boolean };
type FootnoteRef = (suffix: string) => { target: string; refId: string };

// The drawing, from the Figma frame (its own pixels; desktop scale).
const CX = 280;
const SIDE = [300, 260, 220, 180, 140]; // bottom block to the venue
const WIDTH = 560;
const k = 0.866;
/*
 * Two builds of the same stack. A label sits on its block's level, and the
 * levels are `step + 20` apart: 78 as drawn in the frame. From 1024 to 1199
 * the labels' column is narrow enough that every sentence takes two lines
 * (72 px with its title), so there the blocks are 14 px thicker and the
 * levels 92 apart: the five labels keep an even 20 px between them.
 */
type Geometry = { step: number; thick: number; bottomTop: number; height: number; ground: number };
const FRAME: Geometry = { step: 58, thick: 40, bottomTop: 242, height: 640, ground: 567 };
const BAND: Geometry = { step: 72, thick: 54, bottomTop: 298, height: 710, ground: 637 };

function faces(level: number, g: Geometry = FRAME) {
  const STEP = g.step;
  const THICK = g.thick;
  const BOTTOM_TOP = g.bottomTop;
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

/** The stack itself: four solid blocks and the venue's dashed outline, with a leader from each to its label. */
function Stack({ foundations, g, maskId, leaderEnd, className }: { foundations: Foundation[]; g: Geometry; maskId: string; leaderEnd: number; className: string }) {
  const levels = foundations.length;
  const levelOf = (i: number) => levels - 1 - i;
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${WIDTH} ${g.height}`} width={WIDTH} height={g.height} className={className}>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-20} y={-20} width={WIDTH + 40} height={g.height + 40}>
          <path d={faces(levels - 1, g).outline} pathLength={1} className="iso-outline-mask" />
        </mask>
      </defs>
      <GroundShadow cx={CX} cy={g.ground} rx={230} ry={55} />
      {foundations
        .map((f, i) => ({ f, i, level: levelOf(i) }))
        .sort((a, b) => a.level - b.level)
        .map(({ f, level }) => {
          const shape = faces(level, g);
          if (f.planned) {
            return (
              <g key={f.name}>
                <path d={shape.outline} mask={`url(#${maskId})`} className="iso-venue" />
                <line x1={shape.leaderX} x2={leaderEnd} y1={shape.leaderY} y2={shape.leaderY} className="iso-leader-line is-dashed hidden lg:inline" />
              </g>
            );
          }
          return (
            <g key={f.name} className="iso-rise" style={{ ["--level" as string]: level }}>
              <g className="iso-block">
                <polygon points={shape.left} className="fill-[var(--petrol-100)]" />
                <polygon points={shape.right} className="fill-[var(--petrol-50)]" />
                <polygon points={shape.top} className="iso-top" />
              </g>
              <line x1={shape.leaderX} x2={leaderEnd} y1={shape.leaderY} y2={shape.leaderY} className="iso-leader-line hidden lg:inline" />
            </g>
          );
        })}
    </svg>
  );
}

export function IsoFoundations({
  foundations,
  footnote,
  plannedStyle = "tag",
  id,
  className,
}: {
  /** Top of the stack first: the venue, then down to the common standard. */
  foundations: Foundation[];
  footnote: FootnoteRef;
  /** Home sets "Planned¹" as a small muted tag (rule 11.4; only its footnote marker is rani); About as the state word. */
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
    <div className={cn("bg-inset px-5 pt-5 pb-8 md:px-8 md:pt-8 md:pb-10 lg:px-6 lg:pt-10 lg:pb-12 xl:px-12", className)}>
      <PlayOnce className="iso-foundations relative">
        {/* The frame's drawing everywhere but 1024 to 1199, which has its own (taller levels, shorter leaders). */}
        <Stack foundations={foundations} g={FRAME} maskId={maskId} leaderEnd={584} className="mx-auto block h-auto w-full max-w-[560px] overflow-visible lg:mx-0 lg:max-xl:hidden" />
        <Stack foundations={foundations} g={BAND} maskId={`${maskId}-band`} leaderEnd={544} className="hidden overflow-visible lg:max-xl:block" />

        {/* From 1024 to 1199 the panel's padding is 24 and the leaders are 40 shorter, so each
            sentence keeps to two lines beside the drawing at its full size; the column is capped so
            every sentence but the last does take two, and the five labels read as one even list. */}
        <ol className="mt-6 lg:absolute lg:inset-y-0 lg:right-0 lg:left-[560px] lg:mt-0 lg:max-xl:w-[360px] xl:right-[-24px] xl:left-[600px]">
          {foundations.map((f, i) => {
            const shape = faces(levelOf(i));
            const band = faces(levelOf(i), BAND);
            return (
              <li
                key={f.name}
                // Not a tab stop: the highlight only points at the block (the
                // words are all here), so a tap or click focuses it but Tab skips it.
                tabIndex={f.planned ? undefined : -1}
                data-level={levelOf(i)}
                style={{ ["--label-top" as string]: `${shape.leaderY - 14}px`, ["--label-top-band" as string]: `${band.leaderY - 14}px` }}
                className="flex flex-col gap-1 border-t border-rule py-4 outline-offset-4 lg:absolute lg:right-0 lg:left-0 lg:top-(--label-top-band) lg:border-0 lg:py-0 xl:top-(--label-top)"
              >
                {/* The block's rani top edges, laid over the drawing from inside its label, so a plain
                    descendant rule shows them (Safari doesn't restyle :has(li:hover) on hover). Desktop only. */}
                {f.planned ? null : (
                  <>
                    <svg
                      aria-hidden="true"
                      viewBox={`0 0 ${WIDTH} ${FRAME.height}`}
                      width={WIDTH}
                      height={FRAME.height}
                      style={{ top: `${14 - shape.leaderY}px` }}
                      className="pointer-events-none absolute left-[-600px] hidden overflow-visible xl:block"
                    >
                      <polygon points={shape.top} data-level={levelOf(i)} className="iso-top-edge" />
                    </svg>
                    <svg
                      aria-hidden="true"
                      viewBox={`0 0 ${WIDTH} ${BAND.height}`}
                      width={WIDTH}
                      height={BAND.height}
                      style={{ top: `${14 - band.leaderY}px` }}
                      className="pointer-events-none absolute left-[-560px] hidden overflow-visible lg:max-xl:block"
                    >
                      <polygon points={band.top} data-level={levelOf(i)} className="iso-top-edge" />
                    </svg>
                  </>
                )}
                {f.planned && plannedStyle === "tag" ? (
                  <span className="t-tag text-ink-muted lg:hidden">
                    {f.where}
                    <FootnoteMarker n={1} {...footnote("stack-where")} />
                  </span>
                ) : null}
                <span className="flex items-baseline justify-between gap-4">
                  <span className="t-ui-lg text-ink">{f.name}</span>
                  {f.planned ? (
                    <span className={cn(plannedStyle === "tag" ? "t-tag hidden text-ink-muted lg:inline" : "t-state shrink-0 text-ink-muted")}>
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
