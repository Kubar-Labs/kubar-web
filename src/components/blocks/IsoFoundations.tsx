import { ViewTransition } from "react";
import { GroundShadow } from "@/components/drawings/iso";
import { PlayOnce } from "@/components/drawings/PlayOnce";
import { FootnoteMarker } from "@/components/ui/Footnote";
import { cn } from "@/lib/utils";

/*
 * Foundations · isometric (Figma: Home 246:3160 in the tinted panel 242:3433
 * at 1440, 248:3431 at 768, 248:3912 at 390; About 262:1578, 262:1776 and
 * 262:1971; REDRAW-2026-11-14.md, Home and About). Five solid blocks, widest
 * at the bottom, and the venue as a dashed outline on top, each tied by a
 * leader to its title and sentence (17 Nov: distribution is the fifth block,
 * on the footprint the venue had; the venue is smaller, one rise above it).
 * Desktop sets the labels beside the drawing; tablet and phone list them
 * under it, venue first.
 *
 * Beside the drawing the labels sit one of two ways. About's ("level") sit
 * on their blocks' levels, with straight leaders. Home's ("stacked") run to
 * three lines, so each sits 14 px under the one above and, at 1440, its
 * leader takes a short 45° dogleg into its title, as the frame draws it.
 * The doglegs are drawn to where the frame puts the labels, so they show only
 * where the labels' column is the frame's 584 px, from 1440. Narrower laptops
 * wrap Home's sentences to four to six lines, further from their blocks than
 * a 45° leader can reach, so there the labels stand beside the drawing
 * without leaders, and the drawing gives their column up to 80 px.
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
 * label; globals.css). Below desktop there is no highlight: the labels sit
 * under the drawing, in the blocks' order (REDRAW section 10). The markup is
 * rendered on the server; PlayOnce only sets the motion phase.
 */
/** The one view-transition name the foundations stack carries from page to page. */
export const STACK_TRANSITION = "foundations";

export type Foundation = { name: string; line: string; where?: string; planned?: boolean };
type FootnoteRef = (suffix: string) => { target: string; refId: string };

// The drawing, from the Figma frame (its own pixels; desktop scale).
const CX = 280;
const WIDTH = 560;
const k = 0.866;
// Each level, bottom block to the venue: the side of its square and its thickness. The top two are
// the frame's scaled copies: distribution is the record's block at 0.776, the venue the old venue at 0.715.
const SIDE = [300, 260, 220, 180, 139.62, 100.08];
const THICK = [40, 40, 40, 40, 31.02, 28.6];
/*
 * Two builds of the same stack. About's labels sit on their blocks' levels:
 * 78 to 83 apart as drawn in the frame. From 1024 to 1199 its labels' column
 * is narrow enough that a sentence takes two lines (72 px with its title),
 * so there every block is 35% thicker and the levels 72 apart: the six
 * labels keep 20 px or more between them. Home draws the frame's at every
 * width.
 */
type Geometry = { step: number; thick: number; bottomTop: number; height: number; ground: number };
const FRAME: Geometry = { step: 58, thick: 1, bottomTop: 300, height: 698, ground: 625 };
const BAND: Geometry = { step: 72, thick: 1.35, bottomTop: 370, height: 782, ground: 709 };
/** Where the leaders end, 16 px short of the labels' column. */
const LEADER_END = 584;
/*
 * Home's labels' tops at 1440, top first (246:3160): in the frame's 584 px
 * column they are 50, 94, 50, 94, 72 and 94 tall, each 14 px under the one
 * above from 26, and the last is level with its block.
 */
const STACKED_TOPS = [26, 90, 198, 262, 370, 456];

function faces(level: number, g: Geometry = FRAME) {
  const s = SIDE[level];
  const thick = THICK[level] * g.thick;
  const y = g.bottomTop - level * g.step;
  const top = { x: CX, y };
  const right = { x: CX + k * s, y: y + s / 2 };
  const front = { x: CX, y: y + s };
  const left = { x: CX - k * s, y: y + s / 2 };
  const pts = (...p: { x: number; y: number }[]) => p.map((q) => `${q.x.toFixed(2)},${q.y.toFixed(2)}`).join(" ");
  const down = (q: { x: number; y: number }) => ({ x: q.x, y: q.y + thick });
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
    leaderY: right.y + thick / 2,
    leaderX: right.x + 8,
  };
}

/** A leader along its block's level to `end`. */
function straight(level: number, g: Geometry, end: number) {
  const { leaderX, leaderY } = faces(level, g);
  return `M${leaderX.toFixed(2)} ${leaderY.toFixed(2)} H${end}`;
}

/** A leader from its block to a label whose top is `top`: along the level, up at 45° and 6 px into the title. */
function dogleg(level: number, top: number) {
  const { leaderX, leaderY } = faces(level);
  const end = top + 14;
  const rise = leaderY - end;
  return `M${leaderX.toFixed(2)} ${leaderY.toFixed(2)} H${(LEADER_END - 6 - rise).toFixed(2)} L${LEADER_END - 6} ${end} H${LEADER_END}`;
}

/** The stack itself: five solid blocks and the venue's dashed outline, with a leader from each to its label. */
function Stack({
  foundations,
  g,
  maskId,
  leader,
  leaderClass,
  className,
}: {
  foundations: Foundation[];
  g: Geometry;
  maskId: string;
  /** Each block's leader, by level. */
  leader: (level: number) => string;
  /** Where the leaders show. */
  leaderClass: string;
  className: string;
}) {
  const levels = foundations.length;
  const levelOf = (i: number) => levels - 1 - i;
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${WIDTH} ${g.height}`} width={WIDTH} height={g.height} className={className}>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-20} y={-20} width={WIDTH + 40} height={g.height + 40}>
          {/* It draws once the last solid block has risen. */}
          <path d={faces(levels - 1, g).outline} pathLength={1} className="iso-outline-mask" style={{ ["--after" as string]: levels - 2 }} />
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
                {/* Dashed, like the venue's outline (Home's corrected in 246:3160, 1 px, dash 6 5). */}
                <path d={leader(level)} className={cn("iso-leader-line is-dashed", leaderClass)} />
              </g>
            );
          }
          return (
            <g key={f.name} data-level={level} className="iso-rise" style={{ ["--level" as string]: level }}>
              <g className="iso-block">
                <polygon points={shape.left} className="fill-[var(--petrol-100)]" />
                <polygon points={shape.right} className="fill-[var(--petrol-50)]" />
                <polygon points={shape.top} className="iso-top" />
              </g>
              <path d={leader(level)} className={cn("iso-leader-line", leaderClass)} />
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
  labels = "level",
  id,
  className,
}: {
  /** Top of the stack first: the venue, then down to the common standard. */
  foundations: Foundation[];
  footnote: FootnoteRef;
  /** Home sets "Planned¹" as a small muted tag (rule 11.4; only its footnote marker is rani); About as the state word. */
  plannedStyle?: "tag" | "state";
  /** Beside the drawing: About's labels on their blocks' levels; Home's stacked, 14 px apart. */
  labels?: "level" | "stacked";
  /** Unique on the page: names the outline's mask. */
  id: string;
  className?: string;
}) {
  const maskId = `${id}-outline`;
  const levels = foundations.length;
  // Label i (top first) belongs to block level (levels - 1 - i).
  const levelOf = (i: number) => levels - 1 - i;
  const stacked = labels === "stacked";

  return (
    <div className={cn("bg-inset px-5 pt-5 pb-8 md:px-8 md:pt-8 md:pb-10 lg:px-6 lg:pt-10 lg:pb-12 xl:px-12", className)}>
      <PlayOnce className={cn("iso-foundations relative", stacked && "iso-stacked lg:flex lg:items-start")}>
        {/* About: the frame's drawing everywhere but 1024 to 1199, which has its own (taller
            levels, shorter leaders). Home: the frame's everywhere. The stack carries across a page
            change: the strips on the product pages and About's and Home's drawings share one
            view-transition name (SPEC section 12). */}
        <ViewTransition name={STACK_TRANSITION} share="stack" default="none">
          <div className={cn("mx-auto w-full max-w-[560px] lg:mx-0", stacked && "lg:w-(--iso-w) lg:max-w-none lg:shrink-0")}>
            {stacked ? (
              <Stack
                foundations={foundations}
                g={FRAME}
                maskId={maskId}
                leader={(level) => dogleg(level, STACKED_TOPS[levelOf(level)])}
                leaderClass="hidden min-[1440px]:inline"
                className="block h-auto w-full overflow-visible"
              />
            ) : (
              <>
                <Stack
                  foundations={foundations}
                  g={FRAME}
                  maskId={maskId}
                  leader={(level) => straight(level, FRAME, LEADER_END)}
                  leaderClass="hidden lg:inline"
                  className="block h-auto w-full overflow-visible lg:max-xl:hidden"
                />
                <Stack
                  foundations={foundations}
                  g={BAND}
                  maskId={`${maskId}-band`}
                  leader={(level) => straight(level, BAND, 544)}
                  leaderClass="hidden lg:inline"
                  className="hidden overflow-visible lg:max-xl:block"
                />
              </>
            )}
          </div>
        </ViewTransition>

        {/* About, from 1024 to 1199: the panel's padding is 24 and the leaders are 40 shorter, so
            each sentence keeps to two lines beside the drawing at its full size; the column is
            capped so the six labels read as one even list. Home: the labels in the page's flow,
            14 px apart from the top of the drawing, where the frame puts them at 1440. */}
        <ol
          className={
            stacked
              ? "mt-6 lg:mt-0 lg:ml-10 lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-3.5 lg:pt-[26px]"
              : "mt-6 lg:absolute lg:inset-y-0 lg:right-0 lg:left-[560px] lg:mt-0 lg:max-xl:w-[360px] xl:right-[-24px] xl:left-[600px]"
          }
        >
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
                style={stacked ? undefined : { ["--label-top" as string]: `${shape.leaderY - 14}px`, ["--label-top-band" as string]: `${band.leaderY - 14}px` }}
                className={cn(
                  "flex flex-col gap-1 border-t border-rule py-4 outline-offset-4 lg:border-0 lg:py-0",
                  !stacked && "lg:absolute lg:right-0 lg:left-0 lg:top-(--label-top-band) xl:top-(--label-top)",
                )}
              >
                {/* The block's rani top edges, laid over the drawing from inside its label, so a plain
                    descendant rule shows them (Safari doesn't restyle :has(li:hover) on hover). Desktop
                    only. Home's labels are in the flow, so its edges are placed on the drawing itself. */}
                {f.planned ? null : stacked ? (
                  <svg
                    aria-hidden="true"
                    viewBox={`0 0 ${WIDTH} ${FRAME.height}`}
                    className="pointer-events-none absolute top-0 left-0 hidden h-auto w-(--iso-w) overflow-visible lg:block"
                  >
                    <polygon points={shape.top} data-level={levelOf(i)} className="iso-top-edge" />
                  </svg>
                ) : (
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
