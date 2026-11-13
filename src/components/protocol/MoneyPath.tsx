import { KubarMark } from "@/components/brand/KubarMark";
import { Register } from "@/components/registers/Register";
import { MoneyArrow } from "@/components/story/LanesDiagram";
import { cn } from "@/lib/utils";

/*
 * Money path (Figma C4 120:1167), Kubar Protocol and How it works: Kubar,
 * the buyer, the financier and the exporter's bank as columns with
 * lifelines; the three payments as solid 2 px arrows between the three
 * banks' columns. Nothing touches Kubar's column, which carries "No account,
 * no payment, no release" as plain rani words. Desktop: the drawing (800 ×
 * 380). Below desktop: the same three payments as a register with from and to.
 */
const LIFELINES = [106, 317, 528, 739];
const BOXES = [44, 255, 466, 677];

export function MoneyPath({
  parties,
  payments,
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
  kubarNote: string;
  under: string;
  columns: { payment: string; from: string; to: string };
  alt: string;
  /** How it works: the drawing has 845 px, so the labels on the right run to 309. */
  wide?: boolean;
  className?: string;
}) {
  const routes: [number, number][] = [[2, 3], [1, 2], [2, 3]];
  return (
    <div className={className}>
      <div role="img" aria-label={`${alt} ${payments.join(". ")}. ${kubarNote}.`} className={cn("relative hidden h-[380px] lg:block", wide ? "w-[845px]" : "w-[800px]")}>
        {LIFELINES.map((x) => (
          <span key={x} className="absolute top-[76px] h-[264px] w-px bg-rule" style={{ left: x }} />
        ))}
        {parties.map((party, i) =>
          i === 0 ? (
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
        <svg className="absolute inset-0" width={800} height={380} viewBox="0 0 800 380" fill="none">
          <MoneyArrow from={529} to={738} y={148} />
          <MoneyArrow from={318} to={527} y={228} />
          <MoneyArrow from={529} to={738} y={308} />
        </svg>
        <p className={cn("t-body-sm absolute bottom-[240px] left-[536px] text-ink", wide ? "w-[309px]" : "w-[264px]")}>{payments[0]}</p>
        <p className="t-body-sm absolute bottom-[160px] left-[325px] w-[200px] text-ink">{payments[1]}</p>
        <p className={cn("t-body-sm absolute bottom-[80px] left-[536px] text-ink", wide ? "w-[309px]" : "w-[264px]")}>{payments[2]}</p>
        <p className="t-tag absolute top-[218px] left-[21px] w-[178px] text-accent">{kubarNote}</p>
      </div>
      <div className="flex flex-col gap-4 lg:hidden">
        <Register
          columns={[columns.payment, columns.from, columns.to]}
          rows={payments.map((payment, i) => [payment, parties[routes[i][0]], parties[routes[i][1]]])}
          stackLabels
        />
        <p className="t-tag text-accent">
          {parties[0]}: {kubarNote}
        </p>
      </div>
      <p className="t-body-sm pt-4 text-ink-muted lg:pt-0">{under}</p>
    </div>
  );
}
