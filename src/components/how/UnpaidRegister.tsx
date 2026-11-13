import { cn } from "@/lib/utils";

/*
 * "If a buyer doesn't pay" (Figma C4 133:2422): a ruled register, no boxes
 * or arrows. Its title in Mono/Tag over a strong rule; six steps, each with
 * its number, the party, what it does and, from step 04, which branch it
 * belongs to (in rani, at the right); every rule 1 px strong. Under it the
 * plain sentence "Kubar holds none of the risk" in rani. A real table whose
 * column heads are read, not shown. Below desktop each step stacks.
 */
export type UnpaidRow = { no: string; party: string; step: string; branch: string | null };

export function UnpaidRegister({
  title,
  columns,
  rows,
  none,
  className,
}: {
  title: string;
  columns: { no: string; party: string; step: string; branch: string };
  rows: UnpaidRow[];
  none: string;
  className?: string;
}) {
  const cell = "align-baseline lg:py-4 lg:pr-6";
  return (
    <div className={className}>
      <p className="t-tag border-b border-rule-strong pb-2 text-ink-muted">{title}</p>
      <table role="table" className="w-full border-collapse text-left max-lg:block">
        <colgroup>
          <col className="lg:w-10" />
          <col className="lg:w-[224px]" />
          <col />
          <col className="lg:w-[140px]" />
        </colgroup>
        <thead role="rowgroup" className="sr-only">
          <tr role="row">
            {[columns.no, columns.party, columns.step, columns.branch].map((column) => (
              <th key={column} role="columnheader" scope="col">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup" className="max-lg:block">
          {rows.map((row) => (
            <tr
              key={row.no}
              role="row"
              className="border-b border-rule-strong max-lg:grid max-lg:grid-cols-[32px_minmax(0,1fr)] max-lg:items-baseline max-lg:gap-x-3 max-lg:gap-y-1 max-lg:py-4"
            >
              <td role="cell" className={cn(cell, "t-label text-ink-muted lg:pr-0")}>{row.no}</td>
              <th role="rowheader" scope="row" className={cn(cell, "t-tag text-left font-medium text-ink max-lg:col-start-2")}>{row.party}</th>
              <td role="cell" className={cn(cell, "t-body-sm text-ink max-lg:col-start-2")}>{row.step}</td>
              <td role="cell" className={cn("t-label align-baseline text-accent max-lg:col-start-2 lg:py-4 lg:text-right", !row.branch && "max-lg:hidden")}>
                {row.branch}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="t-label pt-4 text-accent">{none}</p>
    </div>
  );
}
