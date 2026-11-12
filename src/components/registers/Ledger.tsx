import { useTranslations } from "next-intl";
import { FootnoteMarker } from "@/components/ui/Footnote";
import { cn } from "@/lib/utils";

/*
 * The eight-state ledger (Figma C2 72:554: Desktop 72:310, Mobile 72:411).
 * The reduced-motion, tablet, mobile and screen-reader form of the Home
 * pinned story; How it works reuses it. A real table: column heads in
 * Mono/Tag over a 2 px strong rule ("Data path: Kubar" in rani), hairline
 * rows, a 2 px strong rule to close. State 05 is current (rani number and
 * state word); state 08 is planned, muted, with footnote ¹.
 * Below desktop each state is a block: number and state, then what happens,
 * the party, and both paths under their labels.
 */
type State = {
  no: string;
  state: string;
  what: string;
  party: string | null;
  data: string | null;
  money: string | null;
};

type LedgerProps = {
  /** The current state's number ("05" on Home). */
  current?: string;
  /** Footnote ids for the planned state's marker. */
  footnote: { target: string; refId: string };
  className?: string;
};

function Square({ planned = false }: { planned?: boolean }) {
  return (
    <span aria-hidden="true" className="flex w-2 shrink-0 pt-[7px]">
      <span className={cn("size-1.5", planned ? "border border-ink-muted" : "bg-ink")} />
    </span>
  );
}

function PathCell({ text, planned }: { text: string | null; planned?: string }) {
  if (planned) {
    return (
      <span className="flex gap-2">
        <Square planned />
        <span className="t-body-sm text-ink-muted">{planned}</span>
      </span>
    );
  }
  if (!text) return <span className="t-body-sm text-ink-muted">—</span>;
  return (
    <span className="flex gap-2">
      <Square />
      <span className="t-body-sm text-ink">{text}</span>
    </span>
  );
}

export function Ledger({ current = "05", footnote, className }: LedgerProps) {
  const t = useTranslations("ledger");
  const states = t.raw("states") as State[];
  const last = states.length - 1;
  const cell = "align-baseline lg:py-4 lg:pr-4 lg:last:pr-0";
  const mobileLabel = "t-tag lg:hidden";

  return (
    <table role="table" className={cn("w-full table-fixed border-collapse text-left max-lg:block", className)}>
      <colgroup>
        <col className="w-[4.375%]" />
        <col className="w-[15.3%]" />
        <col />
        <col className="w-[11.72%]" />
        <col className="w-[20.47%]" />
        <col className="w-[21.1%]" />
      </colgroup>
      <thead role="rowgroup" className="max-lg:sr-only">
        <tr role="row" className="border-b-2 border-rule-strong">
          {(["no", "state", "what", "party", "dataPath", "moneyPath"] as const).map((key) => (
            <th
              key={key}
              role="columnheader"
              scope="col"
              className={cn("t-tag pr-4 pb-2 font-medium last:pr-0", key === "dataPath" ? "text-accent" : "text-ink-muted")}
            >
              {t(`columns.${key}`)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody role="rowgroup" className="max-lg:block max-lg:border-t-2 max-lg:border-rule-strong">
        {states.map((row, index) => {
          const isCurrent = row.no === current;
          const isPlanned = index === last;
          return (
            <tr
              key={row.no}
              role="row"
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                index === last ? "border-b-2 border-rule-strong" : "border-b border-rule",
                "max-lg:grid max-lg:grid-cols-[32px_minmax(0,1fr)] max-lg:items-baseline max-lg:gap-x-3 max-lg:gap-y-2 max-lg:py-4",
                isCurrent && "is-current",
              )}
            >
              <td role="cell" className={cn(cell, "t-code max-lg:col-start-1", isCurrent ? "text-accent" : "text-ink-muted")}>
                {row.no}
              </td>
              <th
                role="rowheader"
                scope="row"
                className={cn(
                  cell,
                  "text-left font-medium max-lg:col-start-2",
                  isCurrent ? "t-state text-accent" : isPlanned ? "t-state text-ink-muted" : "t-h4 text-ink",
                )}
              >
                {row.state}
                {isPlanned ? <FootnoteMarker n={1} target={footnote.target} refId={footnote.refId} /> : null}
              </th>
              <td role="cell" className={cn(cell, "t-body-sm text-ink max-lg:col-start-2")}>
                {row.what}
              </td>
              <td
                role="cell"
                className={cn(
                  cell,
                  "max-lg:col-start-2",
                  isPlanned ? "t-state text-ink-muted" : "t-tag text-ink-muted",
                )}
              >
                {isPlanned ? t("planned") : row.party}
              </td>
              <td role="cell" className={cn(cell, "max-lg:col-start-2 max-lg:flex max-lg:flex-col max-lg:gap-1")}>
                <span aria-hidden="true" className={cn(mobileLabel, "text-accent")}>
                  {t("dataPathLabel")}
                </span>
                <PathCell text={row.data} planned={isPlanned ? t("planned") : undefined} />
              </td>
              <td role="cell" className={cn(cell, "max-lg:col-start-2 max-lg:flex max-lg:flex-col max-lg:gap-1")}>
                <span aria-hidden="true" className={cn(mobileLabel, "text-ink-muted")}>
                  {t("moneyPathLabel")}
                </span>
                <PathCell text={row.money} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
