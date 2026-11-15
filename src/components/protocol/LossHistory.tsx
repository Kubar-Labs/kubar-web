import { GroundShadow, IsoSheetShape } from "@/components/drawings/iso";
import { PlayOnce } from "@/components/drawings/PlayOnce";
import { cn } from "@/lib/utils";

/*
 * Loss history · isometric (Figma 288:2663 in Kubar Protocol's section
 * 167:387; REDRAW-2026-11-14.md, section 12, item 1). Four settled sheets
 * stacked, and RCV-0003 hovering above them on two dashed drop lines.
 * Labels: "Settled" on the hovering sheet; "The loss history", with
 * "Recorded by buyer, exporter and commodity" under it, on the stack; and
 * two dashed arrows out of the stack to what the history does.
 *
 * The labels carry the section's lead, so the lead isn't shown: it is the
 * drawing's description for screen readers (`description`). The labels are
 * a real list; the art is aria-hidden. Desktop sets the labels beside the
 * drawing on leaders; below 1024 the drawing scales to its column and the
 * labels sit under it as a list in the same order.
 *
 * Motion (section 12), once, when in view: RCV-0003 comes down to its drawn
 * place above the stack over the scene duration (globals.css, .loss-settle).
 * No movement with reduced motion.
 */
export type LossHistoryCopy = { settled: string; history: string; recorded: string; outcomes: string[] };

const SHEET = 170;
const CX = 200;
const STACK = [186, 174, 162, 150]; // top vertices, bottom sheet first
const HOVER = 50;

function Lines({ label }: { label: string }) {
  return (
    <>
      <text x={13} y={27} className="iso-text-code fill-ink">
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

export function LossHistory({ copy, description, className }: { copy: LossHistoryCopy; description: string; className?: string }) {
  const leader = "stroke-rule";
  const dashed = "fill-none stroke-ink-muted";
  return (
    <PlayOnce className={cn("loss-history relative lg:h-[400px]", className)}>
      <p className="sr-only">{description}</p>
      <svg aria-hidden="true" viewBox="0 0 400 400" width={400} height={400} className="mx-auto block h-auto w-full max-w-[400px] overflow-visible lg:mx-0">
        <GroundShadow cx={200} cy={356} rx={150} ry={38} />
        {STACK.map((y, i) => (
          <IsoSheetShape key={y} x={CX} y={y} w={SHEET} h={SHEET} elevation={1}>
            <Lines label={i === STACK.length - 1 ? "RCV-0002" : "RCV-0001"} />
          </IsoSheetShape>
        ))}
        {/* The two drop lines, under the hovering sheet's left and right corners. */}
        <line x1={53} x2={53} y1={139} y2={233} className={dashed} strokeWidth={1.5} strokeDasharray="4 4" />
        <line x1={347} x2={347} y1={139} y2={233} className={dashed} strokeWidth={1.5} strokeDasharray="4 4" />
        <g className="loss-settle">
          <IsoSheetShape x={CX} y={HOVER} w={SHEET} h={SHEET} elevation={1}>
            <Lines label="RCV-0003" />
          </IsoSheetShape>
        </g>
        {/* Desktop: leaders to the labels, and the two dashed arrows out of the stack. */}
        <g className="hidden lg:inline">
          <line x1={355} x2={404} y1={135} y2={135} className={leader} strokeWidth={1} />
          <line x1={355} x2={404} y1={239} y2={239} className={leader} strokeWidth={1} />
          {[
            [260, 312],
            [236, 346],
          ].map(([x, y]) => (
            <g key={y}>
              <line x1={x} x2={397} y1={y} y2={y} className={dashed} strokeWidth={1.5} strokeDasharray="5 3" />
              <polygon points={`404,${y} 397,${y - 4.2} 397,${y + 4.2}`} className="fill-ink-muted" />
            </g>
          ))}
        </g>
      </svg>

      <ul className="mt-6 flex flex-col gap-4 lg:absolute lg:inset-y-0 lg:right-0 lg:left-[420px] lg:mt-0 lg:block">
        <li className="t-ui-lg text-ink lg:absolute lg:top-[123px]">{copy.settled}</li>
        <li className="flex flex-col gap-1 lg:absolute lg:top-[227px]">
          <span className="t-ui-lg text-ink">{copy.history}</span>
          <span className="t-body-sm text-ink-muted">{copy.recorded}</span>
        </li>
        {copy.outcomes.map((line, i) => (
          <li key={line} className="t-body-sm flex items-center gap-3 text-ink lg:absolute" style={{ top: [301, 335][i] }}>
            <svg aria-hidden="true" width={22} height={10} viewBox="0 0 22 10" className="shrink-0 overflow-visible lg:hidden">
              <line x1={0} x2={15} y1={5} y2={5} className={dashed} strokeWidth={1.5} strokeDasharray="5 3" />
              <polygon points="22,5 15,0.8 15,9.2" className="fill-ink-muted" />
            </svg>
            {line}
          </li>
        ))}
      </ul>
    </PlayOnce>
  );
}
