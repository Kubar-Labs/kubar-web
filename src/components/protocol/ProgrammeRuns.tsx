import { Fragment } from "react";
import { Arrow, straight } from "@/components/drawings/Arrow";
import { FitStage } from "@/components/drawings/FitStage";
import { PickStage } from "@/components/how/PickStage";
import { ReturnArrow } from "@/components/map/ReturnArrow";
import { TextLink } from "@/components/ui/TextLink";
import { cn } from "@/lib/utils";

/*
 * How a programme runs (Figma 251:2015 at 1440, 257:2455 at 390;
 * REDRAW-2026-11-14.md, Kubar Protocol). "Set up once" as six numbered dots
 * on a vertical line; "Then, for every receivable" as five raised cards round
 * an ellipse with five direction arrows and the RCV line in the middle.
 * Below desktop the five cards run in a column with an arrow between each and
 * a return arrow up the left side. From 1200 up the two sit side by side as
 * at 1440: the set-up list narrows first (440 down to 300), and only below
 * 1280 does the loop scale down to its column (FitStage). The party tags were cut after step 3 (section 10): each
 * sentence names who acts.
 *
 * Motion (section 7), once at 40% in view: the ellipse draws clockwise from
 * step 01 (900 ms) and each card fades in as the line reaches it; then one
 * small sheet travels the loop and stops by 05. Below desktop the arrows draw
 * in order and the return arrow last. Hover, focus or tap raises a card to
 * --elevation-3 (no tab stop: it only highlights). The drawing is
 * aria-hidden; the list carries the steps.
 */
export type ProgrammeStep = { no: string; text: string };

// The loop at desktop, in its own 760 × 660 frame.
const CENTRE = { x: 380, y: 370 };
const RADIUS = { x: 252, y: 215 };
const ELLIPSE = `M${CENTRE.x} ${CENTRE.y - RADIUS.y} A${RADIUS.x} ${RADIUS.y} 0 0 1 ${CENTRE.x} ${CENTRE.y + RADIUS.y} A${RADIUS.x} ${RADIUS.y} 0 0 1 ${CENTRE.x} ${CENTRE.y - RADIUS.y}`;
const CARDS = [
  { x: 262, y: 103 },
  { x: 502, y: 230 },
  { x: 410, y: 468 },
  { x: 114, y: 470 },
  { x: 22, y: 252 },
];
const DRAW_MS = 900;

/** A direction arrowhead on the ellipse at `deg` clockwise from the top, pointing along it. */
function headOnEllipse(deg: number) {
  const t = (deg * Math.PI) / 180;
  const p = { x: CENTRE.x + RADIUS.x * Math.sin(t), y: CENTRE.y - RADIUS.y * Math.cos(t) };
  const d = { x: RADIUS.x * Math.cos(t), y: RADIUS.y * Math.sin(t) };
  const len = Math.hypot(d.x, d.y);
  const u = { x: d.x / len, y: d.y / len };
  const n = { x: -u.y, y: u.x };
  const pts = [
    [p.x + u.x * 4, p.y + u.y * 4],
    [p.x - u.x * 4 + n.x * 3.6, p.y - u.y * 4 + n.y * 3.6],
    [p.x - u.x * 4 - n.x * 3.6, p.y - u.y * 4 - n.y * 3.6],
  ];
  return pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
}

function SetUpOnce({ heading, steps, link }: { heading: string; steps: ProgrammeStep[]; link: { label: string; href: string } }) {
  return (
    <div className="flex flex-col gap-6 lg:w-[clamp(300px,calc(100%-808px),440px)] lg:shrink-0">
      <h3 className="t-h4 text-ink">{heading}</h3>
      <ol>
        {steps.map((step, i) => (
          <li key={step.no} className="flex gap-3.5 lg:gap-4">
            <span className="flex flex-col items-center">
              <span className="relative grid size-8 shrink-0 place-items-center">
                <svg aria-hidden="true" viewBox="0 0 32 32" className="setup-dot absolute inset-0 size-8 overflow-visible">
                  <circle cx={16} cy={16} r={15.5} className="fill-raised stroke-rule-strong" strokeWidth={1} />
                </svg>
                <span className="t-tag relative text-ink">{step.no}</span>
              </span>
              {i < steps.length - 1 ? <span aria-hidden="true" className="w-px flex-1 bg-rule" /> : null}
            </span>
            <span className="t-body-sm flex-1 pt-1 pb-5 text-ink lg:pb-[22px]">{step.text}</span>
          </li>
        ))}
      </ol>
      <TextLink href={link.href} kind="arrow" className="self-start">
        {link.label}
      </TextLink>
    </div>
  );
}

export function ProgrammeRuns({
  setUp,
  each,
  link,
  note,
  noteAfter,
  refs,
  refsLine,
  className,
}: {
  setUp: { heading: string; steps: ProgrammeStep[] };
  each: { heading: string; steps: ProgrammeStep[] };
  link: { label: string; href: string };
  /** "The credit decision is yours…", under the step it follows. */
  note: string;
  noteAfter: string;
  refs: string;
  refsLine: string;
  className?: string;
}) {
  const last = each.steps.length - 1;
  return (
    <div className={cn("flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-12", className)}>
      <SetUpOnce heading={setUp.heading} steps={setUp.steps} link={link} />

      <FitStage width={760} height={660} className="lg:max-w-[760px] lg:min-w-0 lg:flex-1">
      {/* The stage plays the loop once; after that a click, a tap or focus on a card moves the
          travelling sheet to it and raises the card (section 12, item 6). */}
      <PickStage item=".loop-card[data-step]" from="data-step" hover={false} className="programme-loop relative flex flex-col gap-5 lg:block lg:h-[660px] lg:w-[760px] lg:shrink-0">
        <h3 className="t-h4 text-ink lg:absolute lg:top-0 lg:left-0">{each.heading}</h3>

        {/* Desktop: the ellipse, its five direction arrows and the travelling sheet. */}
        <svg aria-hidden="true" viewBox="0 0 760 660" width={760} height={660} className="absolute inset-0 hidden overflow-visible lg:block">
          <path d={ELLIPSE} pathLength={1} className="loop-line fill-none stroke-ink" strokeWidth={1.5} />
          {[36, 108, 180, 252, 324].map((deg) => (
            <polygon
              key={deg}
              points={headOnEllipse(deg)}
              className="loop-head fill-ink"
              style={{ ["--draw-delay" as string]: `${Math.round((DRAW_MS * deg) / 360)}ms` }}
            />
          ))}
        </svg>
        <span aria-hidden="true" className="loop-sheet hidden lg:block" style={{ offsetPath: `path("${ELLIPSE}")` }} />

        {/* The steps: a list, placed round the ellipse at desktop. Below it the
            left gutter holds the return arrow. */}
        <div className="relative pl-9 lg:static lg:pl-0">
          <ol className="flex flex-col lg:block">
            {each.steps.map((step, i) => (
              <li
                key={step.no}
                className="flex flex-col lg:absolute lg:top-(--y) lg:left-(--x) lg:w-[236px]"
                style={{ ["--x" as string]: `${CARDS[i].x}px`, ["--y" as string]: `${CARDS[i].y}px` }}
              >
                <div
                  data-step={step.no}
                  tabIndex={-1}
                  className="loop-card raise-card flex flex-col gap-2 border border-rule bg-raised px-[18px] pt-3.5 pb-4 shadow-elevation-2 outline-offset-2"
                  style={{ ["--card-delay" as string]: `${Math.round((DRAW_MS * i) / each.steps.length)}ms` }}
                >
                  <span className="t-code text-accent">{step.no}</span>
                  <span className="t-body-sm text-ink">{step.text}</span>
                  {step.no === noteAfter ? <span className="t-body-sm text-ink-muted">{note}</span> : null}
                </div>
                {i < last ? (
                  <div aria-hidden="true" className="flex h-9 justify-center lg:hidden">
                    <svg width="12" height="36" viewBox="0 0 12 36" className="overflow-visible">
                      <Arrow id={`loop-next-${step.no}`} {...straight(6, 6, 6, 28)} kind="flow" delay={i * 160} />
                    </svg>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
          <ReturnArrow
            from={each.steps[last].no}
            to={each.steps[0].no}
            attr="data-step"
            side="left"
            kind="flow"
            delay={last * 160}
          />
        </div>

        <div className="flex flex-col gap-1.5 lg:absolute lg:top-[316px] lg:left-[274px] lg:w-[212px] lg:items-center lg:gap-2 lg:text-center">
          {/* Each reference stays on one line; the line breaks only between them. */}
          <p className="t-code text-ink">
            {refs.split(" · ").map((ref, i, all) => (
              <Fragment key={ref}>
                <span className="whitespace-nowrap">{ref}</span>
                {i < all.length - 1 ? " · " : null}
              </Fragment>
            ))}
          </p>
          <p className="t-body-sm text-ink">{refsLine}</p>
        </div>
      </PickStage>
      </FitStage>
    </div>
  );
}
