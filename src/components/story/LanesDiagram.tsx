import { KubarMark } from "@/components/brand/KubarMark";
import { cx as cn } from "@/lib/cx";

/*
 * Lanes diagram (Figma C4 118:1470, States 01 to 08), 845 × 692, desktop only.
 * Six parties as columns with lifelines; Kubar is the one filled box, with
 * the mark. Eight states as rows. The data path is dashed (1.5 px, muted,
 * open arrowhead) and runs through Kubar at every step; the money path is
 * solid (2 px, ink, filled arrowhead) and never touches Kubar.
 * `state` (1 to 8) shows the rows written so far: the current row on the
 * inset ground with the angled rani marker and its number in rani, earlier
 * numbers in ink, later ones muted. A row writes in over --duration-write.
 * Decorative for assistive technology: the ledger register carries the same
 * eight states and is always in the DOM.
 */
const LIFELINES = [112, 245, 378, 512, 645, 778] as const; // Exporter, Kubar, Insurer, Buyer, Financier, Exporter's bank
const BOXES = [50, 183, 316, 450, 583, 716] as const;
const ROW_TOP = (n: number) => 100 + 74 * (n - 1);

export type LaneLabels = {
  s1: string; s2: string; s3: string; s4: string; s5data: string; s5money: string;
  s6: string; s6face: string; s6balance: string; s7: string; s8: string;
};

function DataArrow({ from, to, y }: { from: number; to: number; y: number }) {
  const dir = to > from ? 1 : -1;
  return (
    <g className="text-ink-muted" stroke="currentColor" strokeWidth={1.5} fill="none">
      <line className="lane-line" x1={from} y1={y} x2={to} y2={y} strokeDasharray="5 4" />
      <path d={`M${to - dir * 5.3} ${y - 5.3}L${to} ${y}L${to - dir * 5.3} ${y + 5.3}`} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

export function MoneyArrow({ from, to, y }: { from: number; to: number; y: number }) {
  return (
    <g className="text-ink" fill="currentColor">
      <rect className="lane-line" x={from} y={y - 1} width={to - from - 9} height={2} />
      <path d={`M${to} ${y}L${to - 10} ${y - 5.77}V${y + 5.77}Z`} />
    </g>
  );
}

function Label({ x, y, ink, children }: { x: number; y: number; ink?: boolean; children: React.ReactNode }) {
  return (
    <span className={cn("t-body-sm absolute whitespace-nowrap", ink ? "text-ink" : "text-ink-muted")} style={{ left: x, top: y }}>
      {children}
    </span>
  );
}

function Marker({ y, planned }: { y: number; planned?: boolean }) {
  return (
    <span
      className={cn("absolute size-2", planned ? "border border-dashed border-ink-muted" : "bg-ink")}
      style={{ left: 241, top: y }}
    />
  );
}

export function LanesDiagram({ state, parties, labels }: { state: number; parties: string[]; labels: LaneLabels }) {
  const row = (n: number, children: React.ReactNode) => (
    <div key={n} data-row={n} className={cn("lane-row absolute inset-0", n <= state ? "is-written" : "")}>
      {children}
    </div>
  );
  const svg = (children: React.ReactNode) => (
    <svg className="absolute inset-0" width={845} height={692} viewBox="0 0 845 692" fill="none">
      {children}
    </svg>
  );
  const t = ROW_TOP;

  return (
    <div aria-hidden="true" className="relative h-[692px] w-[845px] shrink-0 select-none">
      {/* The current row's ground and marker move to the current state. */}
      <div
        className="absolute left-[33px] h-[74px] w-[812px] bg-accent-soft transition-[top] duration-(--duration-write) ease-standard"
        style={{ top: t(state) }}
      >
        <span className="absolute inset-y-0 left-0 w-1.5 bg-accent [clip-path:polygon(0_0,100%_0,100%_calc(100%-3.9px),0_100%)]" />
      </div>
      {LIFELINES.map((x) => (
        <span key={x} className="absolute top-[76px] h-[616px] w-px bg-rule" style={{ left: x }} />
      ))}
      {[2, 3, 4, 5, 6, 7, 8].map((n) => (
        <span key={n} className="absolute left-[45px] h-px w-[800px] bg-rule" style={{ top: t(n) }} />
      ))}
      {parties.map((party, i) =>
        i === 1 ? (
          <span key={party} className="t-ui absolute top-0 flex h-[76px] w-[124px] flex-col items-center justify-center gap-2 bg-action text-on-action" style={{ left: BOXES[i] }}>
            <KubarMark height={20} />
            {party}
          </span>
        ) : (
          <span key={party} className="t-ui absolute top-0 flex h-[76px] w-[124px] items-center justify-center border border-rule-strong bg-raised whitespace-nowrap text-ink" style={{ left: BOXES[i] }}>
            {party}
          </span>
        ),
      )}
      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
        <span
          key={n}
          className={cn("t-code absolute left-2 transition-colors duration-(--duration-write)", n === state ? "text-accent" : n < state ? "text-ink" : "text-ink-muted")}
          style={{ top: t(n) + 27 }}
        >
          {String(n).padStart(2, "0")}
        </span>
      ))}

      {row(1, <>{svg(<DataArrow from={113} to={244} y={t(1) + 46} />)}<Label x={120} y={t(1) + 16}>{labels.s1}</Label></>)}
      {row(2, <><Marker y={t(2) + 33} /><Label x={259} y={t(2) + 26}>{labels.s2}</Label></>)}
      {row(3, <>{svg(<DataArrow from={377} to={246} y={t(3) + 46} />)}<Label x={253} y={t(3) + 16}>{labels.s3}</Label></>)}
      {row(4, <>{svg(<DataArrow from={511} to={246} y={t(4) + 46} />)}<Label x={253} y={t(4) + 16}>{labels.s4}</Label></>)}
      {row(5, <>
        {svg(<><DataArrow from={246} to={644} y={t(5) + 32} /><MoneyArrow from={646} to={777} y={t(5) + 64} /></>)}
        <Label x={253} y={t(5) + 8}>{labels.s5data}</Label>
        <Label x={653} y={t(5) + 40} ink>{labels.s5money}</Label>
      </>)}
      {row(6, <>
        <Marker y={t(6) + 15} /><Label x={259} y={t(6) + 8}>{labels.s6}</Label>
        {svg(<><MoneyArrow from={513} to={644} y={t(6) + 64} /><MoneyArrow from={646} to={777} y={t(6) + 64} /></>)}
        <Label x={520} y={t(6) + 40} ink>{labels.s6face}</Label>
        <Label x={653} y={t(6) + 40} ink>{labels.s6balance}</Label>
      </>)}
      {row(7, <><Marker y={t(7) + 33} /><Label x={259} y={t(7) + 26}>{labels.s7}</Label></>)}
      {row(8, <><Marker y={t(8) + 33} planned /><Label x={259} y={t(8) + 26}>{labels.s8}<span className="text-accent">¹</span></Label></>)}
    </div>
  );
}
