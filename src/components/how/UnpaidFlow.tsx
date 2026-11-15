import { Arrow, straight } from "@/components/drawings/Arrow";
import { PlayOnce } from "@/components/drawings/PlayOnce";
import { cn } from "@/lib/utils";

/*
 * If a buyer doesn't pay · flow (Figma 259:2120 at 1440, 260:2285 at 768,
 * 260:2529 at 390; REDRAW-2026-11-14.md, How it works). Steps 01 to 03
 * (Kubar's) in a row joined by arrows; under step 03 a fork, labelled "No
 * dispute" and "A dispute"; steps 04 and 05 on the first branch, 06 on the
 * second; then "Kubar holds none of the risk". Tablets keep the three steps
 * in a column and the two branches side by side; phones stack everything,
 * each branch under its label, with a short arrow between steps.
 *
 * The boxes are 300 wide where the row of three (1020) fits, from 1200 up;
 * from 1024 to 1199 they share the width (275 at 1024; --flow-box,
 * globals.css), so laptops keep the 1440 composition; step 06
 * keeps to the right edge and the fork's bar follows it.
 *
 * Rule 11.4: rani is kept for footnote markers, the current state and
 * errors, so the step numbers and branch labels are in the secondary colour
 * (the frames draw them in rani). Section 5 names no shadow here, so the
 * boxes are flat (the frames raise them).
 *
 * The steps are an ordered list in reading order, each branch a list under
 * its label; arrows and the fork are aria-hidden.
 *
 * Motion (section 7), once, when 40% of it is in view: steps 01 to 03
 * appear in order with their arrows; the fork draws; both branches appear
 * together. Nothing moves with reduced motion (globals.css, .unpaid-flow).
 */
export type UnpaidStep = { no: string; party: string; step: string; branch: string | null };

// Between two boxes in a row (60 apart): a 44 px arrow, 8 px clear of each.
const ACROSS = straight(0, 5, 44, 5, 7);
// Between two boxes in a column (38 apart): a 24 px arrow.
const DOWN = straight(5, 0, 5, 24, 7);
// The fork's two branch arrows, from the bar to 8 px above the boxes.
const BRANCH = straight(5, 0, 5, 56, 7);

const D = 120; // ms between the flow's beats

function Box({ step, className, style }: { step: UnpaidStep; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={cn(
        "flex flex-col gap-1.5 border border-rule bg-raised px-[19px] pt-[15px] pb-[17px] lg:w-(--flow-box) lg:shrink-0 lg:gap-2 lg:px-5 lg:pt-4 lg:pb-[18px]",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="t-code text-ink-muted">{step.no}</span>
        <span className="t-fine text-right text-ink-muted">{step.party}</span>
      </div>
      <p className="t-body-sm text-ink">{step.step}</p>
    </div>
  );
}

function Across({ id, delay }: { id: string; delay: number }) {
  return (
    <span aria-hidden="true" className="hidden w-[60px] shrink-0 items-center justify-center self-center lg:flex">
      <svg width={44} height={10} viewBox="0 0 44 10" className="overflow-visible">
        <Arrow id={id} kind="flow" {...ACROSS} delay={delay} />
      </svg>
    </span>
  );
}

function Down({ id, delay, className }: { id: string; delay: number; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex h-[38px] items-center justify-center lg:hidden", className)}>
      <svg width={10} height={24} viewBox="0 0 10 24" className="overflow-visible">
        <Arrow id={id} kind="flow" {...DOWN} delay={delay} />
      </svg>
    </span>
  );
}

export function UnpaidFlow({ steps, none, className }: { steps: UnpaidStep[]; none: string; className?: string }) {
  const kubar = steps.filter((s) => !s.branch);
  const branches = [...new Set(steps.map((s) => s.branch).filter((b): b is string => !!b))].map((label) => ({
    label,
    steps: steps.filter((s) => s.branch === label),
  }));
  // Kubar's steps and their arrows, then the stem, the bar and the branch arrows, then the branches.
  const forkAt = kubar.length * 2 * D;
  const barAt = forkAt + 160;
  const branchArrowsAt = forkAt + 320;
  const branchesAt = forkAt + 480;
  const beat = (n: number) => ({ ["--beat" as string]: `${n}ms` }) as React.CSSProperties;

  return (
    <PlayOnce className={cn("unpaid-flow flex flex-col", className)}>
      {/* Kubar's three steps. */}
      <ol className="flex flex-col lg:flex-row">
        {kubar.map((step, i) => (
          <li key={step.no} className="flex flex-col lg:flex-row">
            {i > 0 ? (
              <>
                <Across id={`unpaid-across-${step.no}`} delay={(2 * i - 1) * D} />
                <Down id={`unpaid-down-${step.no}`} delay={(2 * i - 1) * D} />
              </>
            ) : null}
            <Box step={step} className="flow-beat" style={beat(2 * i * D)} />
          </li>
        ))}
      </ol>

      {/* The fork, desktop only: a stem down from step 03's middle (870 = 2 × 360 + 150), a bar from the
          first branch's middle to the second's, and an arrow down to each. */}
      <div aria-hidden="true" className="relative hidden h-[108px] lg:block">
        <span className="fork-stem absolute top-1.5 left-[calc(2.5*var(--flow-box)+119.25px)] h-[38px] border-l-[1.5px] border-ink" style={beat(forkAt)} />
        <span className="fork-bar absolute top-[43.25px] right-[calc(var(--flow-box)/2-0.75px)] left-[calc(var(--flow-box)/2-0.75px)] border-t-[1.5px] border-ink" style={beat(barAt)} />
        <svg width={10} height={56} viewBox="0 0 10 56" className="absolute top-11 left-[calc(var(--flow-box)/2-5px)] overflow-visible">
          <Arrow id="unpaid-branch-1" kind="flow" {...BRANCH} delay={branchArrowsAt} />
        </svg>
        <svg width={10} height={56} viewBox="0 0 10 56" className="absolute top-11 right-[calc(var(--flow-box)/2-5px)] overflow-visible">
          <Arrow id="unpaid-branch-2" kind="flow" {...BRANCH} delay={branchArrowsAt} />
        </svg>
      </div>

      {/* The two branches, each under its label. */}
      <ul className="flow-beat grid gap-7 pt-7 md:grid-cols-2 md:gap-6 lg:flex lg:justify-between lg:pt-0" style={beat(branchesAt)}>
        {branches.map((branch, b) => (
          <li key={branch.label} className={cn("relative flex flex-col", b > 0 && "lg:items-end")}>
            <p
              className={cn(
                "t-ui pb-2.5 text-ink-muted lg:absolute lg:-top-[52px] lg:pb-0",
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
                      <Across id={`unpaid-across-${step.no}`} delay={branchesAt} />
                      <Down id={`unpaid-down-${step.no}`} delay={branchesAt} />
                    </>
                  ) : null}
                  <Box step={step} />
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ul>

      <p className="flow-beat t-ui-lg pt-7 text-ink lg:pt-9" style={beat(branchesAt)}>
        {none}
      </p>
    </PlayOnce>
  );
}
