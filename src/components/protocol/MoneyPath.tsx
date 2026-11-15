import { KubarMark } from "@/components/brand/KubarMark";
import { cn } from "@/lib/utils";

/*
 * Money path (Figma C4 120:1167 and 120:1141), Kubar Protocol and How it
 * works: Kubar, the buyer, the financier and the exporter's bank as columns
 * with lifelines; the three payments as solid 2 px arrows between the three
 * banks' columns. Nothing touches Kubar's column, which carries "Kubar holds
 * none" in the secondary colour on its grey chip (rule 11.4).
 *
 * Desktop: the lanes take their column's width (800 at 1440; 845 on How it
 * works): four equal columns, the labels wrapping to the room they have.
 * Below desktop: the same three payments as rows, each with its "from →
 * to", then "Kubar" with the chip.
 */
/** A payment between two columns: a solid 2 px line with a filled head, from the left column to the right. */
function MoneyArrow({ from, to, y }: { from: number; to: number; y: number }) {
  return (
    <span className="absolute h-3" style={{ left: col(from), width: span(to - from), top: y - 6 }}>
      <svg className="absolute inset-y-0 left-px h-3 w-[calc(100%-11px)] overflow-visible">
        <line x1="0" x2="100%" y1="6" y2="6" className="stroke-ink" strokeWidth={2} />
      </svg>
      <svg viewBox="0 0 10 12" className="absolute top-0 right-0 h-3 w-2.5 overflow-visible">
        <polygon points="10,6 0,0.23 0,11.77" className="fill-ink" />
      </svg>
    </span>
  );
}

const col = (i: number) => `${((i + 0.5) * 25).toFixed(3)}%`;
const span = (n: number) => `${n * 25}%`;

/** The small solid arrow in a row's "from → to". */
function RowArrow() {
  return (
    <svg width="28" height="12" viewBox="0 0 28 12" aria-hidden="true" className="shrink-0">
      <rect x="0" y="5" width="19" height="2" className="fill-ink" />
      <path d="M28 6L18 0.23V11.77Z" className="fill-ink" />
    </svg>
  );
}

export function MoneyPath({
  parties,
  payments,
  routes,
  kubarNote,
  under,
  columns,
  alt,
  wide = false,
  className,
}: {
  /** Kubar, the buyer, the financier, the exporter's bank. */
  parties: string[];
  /** Purchase price (financier to bank), face value (buyer to financier), deferred price (financier to bank). */
  payments: string[];
  /** Below desktop, each payment's from and to, in the frames' words. */
  routes: [string, string][];
  kubarNote: string;
  under: string;
  columns: { payment: string; from: string; to: string };
  alt: string;
  /** How it works: the lanes may run to 845. */
  wide?: boolean;
  className?: string;
}) {
  const lanes: [number, number, number][] = [[2, 3, 148], [1, 2, 228], [2, 3, 308]];
  return (
    <div className={className}>
      <div
        role="img"
        aria-label={`${alt} ${payments.join(". ")}. ${kubarNote}.`}
        className={cn("relative hidden h-[380px] w-full lg:block", wide ? "max-w-[845px]" : "max-w-[800px]")}
      >
        {parties.map((party, i) => (
          <span key={`life-${party}`} className="absolute top-[76px] h-[264px] w-px bg-rule" style={{ left: col(i) }} />
        ))}
        {parties.map((party, i) => (
          <span
            key={party}
            className={cn(
              "t-ui absolute top-0 flex h-[76px] w-[124px] max-w-[calc(25%-12px)] -translate-x-1/2 items-center justify-center text-center",
              i === 0 ? "flex-col gap-2 bg-action text-on-action" : "border border-rule-strong bg-raised px-2 text-ink",
            )}
            style={{ left: col(i) }}
          >
            {i === 0 ? <KubarMark height={20} /> : null}
            {party}
          </span>
        ))}
        {lanes.map(([from, to, y]) => (
          <MoneyArrow key={y} from={from} to={to} y={y} />
        ))}
        {/* Each payment's words sit above its arrow and wrap to the room they have. */}
        {lanes.map(([from, to, y], i) => (
          <p
            key={payments[i]}
            className="t-body-sm absolute text-ink"
            style={{
              bottom: 380 - y + 8,
              left: `calc(${col(from)} + 8px)`,
              ...(to === 3 ? { right: 0, maxWidth: 300 } : { width: `calc(${span(to - from)} - 16px)` }),
            }}
          >
            {payments[i]}
          </p>
        ))}
        <p
          className="t-fine absolute top-[214px] max-w-[170px] -translate-x-1/2 bg-accent-soft px-2 py-1 text-ink-muted"
          style={{ left: col(0) }}
        >
          {kubarNote}
        </p>
      </div>

      {/* Below desktop (Figma 120:1141): the three payments as rows, each with its from and to. */}
      <table role="table" className="block w-full text-left lg:hidden">
        <thead role="rowgroup" className="sr-only">
          <tr role="row">
            {[columns.payment, columns.from, columns.to].map((column) => (
              <th key={column} role="columnheader" scope="col">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup" className="block border-t-2 border-rule-strong">
          {payments.map((payment, i) => (
            <tr key={payment} role="row" className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-rule py-4">
              <th role="rowheader" scope="row" className="t-body-sm w-full font-normal text-ink">{payment}</th>
              <td role="cell" className="t-fine text-ink">{routes[i][0]}</td>
              <td role="cell" className="t-fine flex items-center gap-3 text-ink">
                <RowArrow />
                {routes[i][1]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="flex items-center gap-3 border-b-2 border-rule-strong py-4 lg:hidden">
        <span className="t-fine text-ink">{parties[0]}</span>
        <span className="t-fine bg-accent-soft px-2 py-1 text-ink-muted">{kubarNote}</span>
      </p>
      <p className="t-body-sm pt-4 text-ink-muted lg:pt-0">{under}</p>
    </div>
  );
}
