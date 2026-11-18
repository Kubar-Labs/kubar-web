import { straight } from "@/components/drawings/Arrow";
import { UnpaidStage } from "@/components/how/UnpaidStage";
import { cn } from "@/lib/utils";

/*
 * If a buyer doesn't pay · flow (Figma 333:2784 at 1440; 259:2120 before it,
 * 260:2285 at 768, 260:2529 at 390; below 1024 the prototype,
 * docs/rebuild/prototypes/motion-pieces.html, section D). Steps 01 to 03
 * (Kubar's) in a row joined by arrows; under step 03 a fork to two branches,
 * "No dispute" (steps 04 and 05) and "A dispute" (step 06); then "Kubar holds
 * none of the risk".
 *
 * Step 11: the path draws with the scroll. As the flow moves up the screen,
 * steps 01 to 03 and their arrows light in order, then the fork, then the
 * branch, and it runs back if the reader scrolls up. Each part carries its
 * beat (data-beat); UnpaidStage sets how many have come (data-lit) and the
 * CSS lights them (globals.css, .unpaid-flow). A lit step is raised
 * (--elevation-2, as the frame draws it) with its words in ink; before that it
 * sits flat with its words in the secondary colour, so they keep their
 * contrast. On laptops six marks inside the flow, 7svh apart, set the beats,
 * so the row of three lights one after another; below 1024 each step lights
 * as it crosses the line itself.
 *
 * The two fork labels are buttons, a pick (UnpaidStage): "No dispute" is
 * picked on load; the picked branch is lit and the other sits at 30%, inert.
 * Below 1024 the steps stack, the two buttons sit between step 03 and the
 * branch, and only the picked branch shows. Without script or with reduced
 * motion: everything lit and both branches, each under its label.
 *
 * Rendered on the server; only the buttons and the beats run in the browser.
 * Rule 11.4: the step numbers are in the secondary colour (the frames draw
 * them in rani).
 */
export type UnpaidStep = { no: string; party: string; step: string; branch: string | null };

// Between two boxes in a row (60 apart): a 44 px arrow, 8 px clear of each.
const ACROSS = straight(0, 5, 44, 5, 7);
// Between two boxes in a column (38 apart): a 24 px arrow.
const DOWN = straight(5, 0, 5, 24, 7);
// The fork's two branch arrows, from the bar to 8 px above the boxes.
const BRANCH = straight(5, 0, 5, 56, 7);

function Line({ geometry, width, height, beat, className }: { geometry: { d: string; head: string }; width: number; height: number; beat: number; className?: string }) {
  return (
    <svg aria-hidden="true" data-beat={beat} width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={cn("flow-arrow overflow-visible", className)}>
      <path d={geometry.d} pathLength={1} className="flow-line fill-none stroke-ink" strokeWidth={1.5} />
      <polygon points={geometry.head} className="flow-head fill-ink" />
    </svg>
  );
}

function Box({ step, beat }: { step: UnpaidStep; beat: number }) {
  return (
    <div
      data-mark="narrow"
      data-beat={beat}
      className="flow-box relative flex flex-col gap-1.5 border border-rule bg-raised px-[19px] pt-[15px] pb-[17px] lg:w-(--flow-box) lg:shrink-0 lg:gap-2 lg:px-5 lg:pt-4 lg:pb-[18px]"
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="t-code text-ink-muted">{step.no}</span>
        <span className="t-fine text-right text-ink-muted">{step.party}</span>
      </div>
      <p className="t-body-sm">{step.step}</p>
    </div>
  );
}

function Across({ beat }: { beat: number }) {
  return (
    <span aria-hidden="true" className="hidden w-[60px] shrink-0 items-center justify-center self-center lg:flex">
      <Line geometry={ACROSS} width={44} height={10} beat={beat} />
    </span>
  );
}

function Down({ beat }: { beat: number }) {
  return (
    <span aria-hidden="true" className="flex h-[38px] items-center justify-center lg:hidden">
      <Line geometry={DOWN} width={10} height={24} beat={beat} />
    </span>
  );
}

export function UnpaidFlow({ steps, none, className }: { steps: UnpaidStep[]; none: string; className?: string }) {
  const kubar = steps.filter((s) => !s.branch);
  const branches = [...new Set(steps.map((s) => s.branch).filter((b): b is string => !!b))].map((label) => ({
    label,
    steps: steps.filter((s) => s.branch === label),
  }));

  return (
    <UnpaidStage
      labels={branches.map((branch) => branch.label)}
      className={className}
      arrow={<Down beat={4} />}
      head={
        <>
          {/* On laptops the beats come from six marks 7svh apart, from the flow's top. */}
          {[1, 2, 3, 4, 5, 6].map((beat) => (
            <span key={beat} aria-hidden="true" data-mark="wide" data-beat={beat} className="absolute left-0 hidden h-px w-px lg:block" style={{ top: `${beat * 7}svh` }} />
          ))}

          {/* Kubar's three steps. */}
          <ol className="flex flex-col lg:flex-row">
            {kubar.map((step, i) => (
              <li key={step.no} className="flex flex-col lg:flex-row">
                {i > 0 ? (
                  <>
                    <Across beat={i + 1} />
                    <Down beat={i + 1} />
                  </>
                ) : null}
                <Box step={step} beat={i + 1} />
              </li>
            ))}
          </ol>

          {/* The fork, desktop only: a stem down from step 03's middle (870 = 2 × 360 + 150), the bar to each
              branch's middle in two halves from the stem, and an arrow down to each. */}
          <div aria-hidden="true" className="relative hidden h-[108px] lg:block">
            <span data-beat={4} className="fork-stem absolute top-1.5 left-[calc(2.5*var(--flow-box)+119.25px)] h-[38px] border-l-[1.5px] border-ink" />
            <span
              data-beat={4}
              data-branch="0"
              className="fork-half absolute top-[43.25px] left-[calc(var(--flow-box)/2-0.75px)] w-[calc(2*var(--flow-box)+121.5px)] border-t-[1.5px] border-ink"
            />
            <span
              data-beat={4}
              data-branch="1"
              className="fork-half absolute top-[43.25px] right-[calc(var(--flow-box)/2-0.75px)] left-[calc(2.5*var(--flow-box)+119.25px)] border-t-[1.5px] border-ink"
            />
            <span data-branch="0" className="fork-arrow absolute top-11 left-[calc(var(--flow-box)/2-5px)] flex">
              <Line geometry={BRANCH} width={10} height={56} beat={4} />
            </span>
            <span data-branch="1" className="fork-arrow absolute top-11 right-[calc(var(--flow-box)/2-5px)] flex">
              <Line geometry={BRANCH} width={10} height={56} beat={4} />
            </span>
          </div>
        </>
      }
      branches={
        // The two branches, each under its label (the label shows without script or with reduced motion).
        <ul className="flow-branches grid gap-7 pt-7 md:grid-cols-2 md:gap-6 lg:flex lg:justify-between lg:pt-0">
          {branches.map((branch, b) => (
            <li key={branch.label} data-branch={b} className={cn("flow-branch relative flex flex-col", b > 0 && "lg:items-end")}>
              <p
                className={cn(
                  "flow-label t-ui pb-2.5 text-ink-muted lg:absolute lg:-top-[52px] lg:pb-0",
                  b === 0 ? "lg:left-[calc(var(--flow-box)/2+14px)]" : "lg:right-[calc(var(--flow-box)/2+14px)] lg:text-right",
                )}
              >
                {branch.label}
              </p>
              <ol className="flex flex-col lg:flex-row">
                {branch.steps.map((step, i) => (
                  <li key={step.no} className="flex flex-col lg:flex-row">
                    {i > 0 ? (
                      <>
                        <Across beat={6} />
                        <Down beat={6} />
                      </>
                    ) : null}
                    <Box step={step} beat={i > 0 ? 6 : 5} />
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      }
      none={<p className="t-ui-lg pt-7 text-ink lg:pt-9">{none}</p>}
    />
  );
}
