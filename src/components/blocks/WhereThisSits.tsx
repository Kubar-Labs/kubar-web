import { ViewTransition } from "react";
import { STACK_TRANSITION } from "@/components/blocks/IsoFoundations";
import { GroundShadow } from "@/components/drawings/iso";
import { FootnoteMarker } from "@/components/ui/Footnote";
import { TextLink } from "@/components/ui/TextLink";
import { cn } from "@/lib/utils";

/*
 * "Where this sits" (Figma: Kubar Protocol 309:2495 at 1440, 314:3130 at 768,
 * 314:2805 at 390; NavDhan SDK 310:1331, 320:1567, 320:1440; SPEC section
 * 8). A strip on the inset ground directly under a product page's hero: the
 * six foundations drawn small, the page's own level in petrol, then the
 * sentence and the link to Home's story. Side by side from 768, stacked
 * below.
 *
 * The stack is Home's (IsoFoundations) at a quarter of its size: five solid
 * blocks, widest at the bottom, and the venue dashed on top (17 Nov: the
 * drawing 34 taller for distribution, on the footprint the venue had). A
 * ruler stands beside it with a tick at each level, and the six names sit on
 * their levels. Rani marks the one element the drawing is about (rule 11.4):
 * the page's level has a rani tick; its block's top face is petrol and its
 * name is ink.
 *
 * The names are a real list, top of the stack first, with the page's level
 * as aria-current; the art is aria-hidden. The venue's name carries the
 * footnote marker ¹ (no "Planned" here). Nothing moves and nothing needs
 * script.
 *
 * Phones (below 768) draw the stack at 0.55 and name only the page's level;
 * the other five names stay in the list for screen readers (the venue's
 * shows while its marker has keyboard focus).
 */
const CX = 92;
const WIDTHS = [160, 136, 112, 90, 70, 50]; // the top faces, bottom block to the venue
const TOPS = [153.81, 126.74, 99.67, 72.02, 43.79, 15.57]; // each top vertex
// Each block's thickness: the top two are scaled like Home's (Figma 309:2495).
const THICK = [16, 16, 16, 16, 12.44, 11.43];
const RULER = 196;
/** Each level's line: the right corner of its block's top face. 200, 166, 132, 98, 64, 30. */
const levelY = (level: number) => TOPS[level] + WIDTHS[level] / (4 * 0.866);

function faces(level: number) {
  const half = WIDTHS[level] / 2;
  const rise = half / (2 * 0.866) * 2 * 0.5; // half the diamond's height
  const y = TOPS[level];
  const top = [CX, y], right = [CX + half, y + rise], front = [CX, y + 2 * rise], left = [CX - half, y + rise];
  const down = ([px, py]: number[]) => [px, py + THICK[level]];
  const pts = (...p: number[][]) => p.map(([px, py]) => `${px.toFixed(2)},${py.toFixed(2)}`).join(" ");
  return {
    top: pts(top, right, front, left),
    left: pts(left, front, down(front), down(left)),
    right: pts(front, right, down(right), down(front)),
    outline: `M${pts(top)} L${pts(right)} L${pts(front)} L${pts(left)} Z M${pts(left)} L${pts(down(left))} L${pts(down(front))} L${pts(down(right))} L${pts(right)} M${pts(front)} L${pts(down(front))}`,
    leaderFrom: CX + half + 6,
  };
}

export function WhereThisSits({
  label,
  line,
  link,
  foundations,
  current,
  footnote,
  className,
}: {
  /** "Where this sits". */
  label: string;
  line: string;
  link: { label: string; href: string };
  /** The six names, top of the stack first: the venue, then down to the common standard. */
  foundations: string[];
  /** The page's own level, as an index into `foundations`. */
  current: number;
  /** Footnote ¹ (the ITFS registration line), for the venue's name. */
  footnote: { target: string; refId: string };
  className?: string;
}) {
  const levels = foundations.length;
  const levelOf = (i: number) => levels - 1 - i;
  return (
    <section aria-label={label} className={cn("bg-inset", className)}>
      <div className="page-container flex flex-col gap-6 py-8 md:flex-row md:items-center md:gap-6 md:py-8 lg:gap-24 lg:py-9">
        <div className="sits-stack relative shrink-0">
          {/* The stack carries across a page change, to and from Home's and About's drawings (SPEC section 12). */}
          <ViewTransition name={STACK_TRANSITION} share="stack" default="none">
            <div className="sits-art">
              <svg aria-hidden="true" className="block size-full overflow-visible">
                <g className="sits-scale">
                  <GroundShadow cx={CX} cy={258} rx={70} ry={16} />
                  <line x1={RULER} x2={RULER} y1={levelY(levels - 1)} y2={levelY(0)} className="stroke-rule-control" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                  {/* Bottom block first, so each block covers the foot of the one under it. */}
                  {[...foundations.keys()].reverse().map((i) => {
                    const name = foundations[i];
                    const level = levelOf(i);
                    const shape = faces(level);
                    const here = i === current;
                    const planned = level === levels - 1;
                    const y = levelY(level);
                    return (
                      <g key={name}>
                        {planned ? (
                          <path d={shape.outline} className="fill-none stroke-ink" strokeWidth={1} strokeDasharray="3 2.5" vectorEffect="non-scaling-stroke" />
                        ) : (
                          <g className="stroke-rule" strokeWidth={1} strokeLinejoin="round">
                            <polygon points={shape.left} className="fill-[var(--petrol-100)]" vectorEffect="non-scaling-stroke" />
                            <polygon points={shape.right} className="fill-[var(--petrol-50)]" vectorEffect="non-scaling-stroke" />
                            <polygon points={shape.top} className={here ? "fill-[var(--petrol-900)] stroke-[var(--petrol-900)]" : "fill-raised"} vectorEffect="non-scaling-stroke" />
                          </g>
                        )}
                        <line
                          x1={shape.leaderFrom}
                          x2={RULER}
                          y1={y}
                          y2={y}
                          className={here ? "stroke-ink" : "stroke-rule-control"}
                          strokeWidth={1}
                          strokeDasharray={planned ? "2 2" : undefined}
                          vectorEffect="non-scaling-stroke"
                        />
                        <line x1={RULER} x2={RULER + (here ? 8 : 5)} y1={y} y2={y} className={here ? "stroke-accent" : "stroke-rule-control"} strokeWidth={here ? 2 : 1} vectorEffect="non-scaling-stroke" />
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </ViewTransition>
          {/* Top of the stack first. Each name is centred on its level (globals.css says where one may wrap). */}
          <ol className="sits-names absolute inset-y-0 right-0">
            {foundations.map((name, i) => (
              <li
                key={name}
                aria-current={i === current ? "true" : undefined}
                style={{ ["--level-y" as string]: `${levelY(levelOf(i))}px` }}
                className={cn(
                  "absolute right-0 left-0 top-[calc(var(--level-y)*var(--k))] -translate-y-1/2",
                  i === current ? "t-ui-sm text-ink" : "t-fine text-ink-muted max-md:sr-only max-md:focus-within:not-sr-only",
                )}
              >
                {name}
                {i === 0 ? <FootnoteMarker n={1} {...footnote} /> : null}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex min-w-0 flex-col items-start gap-3 md:max-w-[600px]">
          <p className="t-fine text-ink-muted">{label}</p>
          <p className="t-body text-ink md:t-body-lg">{line}</p>
          <TextLink href={link.href} kind="arrow" className="tap-area">
            {link.label}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
