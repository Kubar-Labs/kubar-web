import { cn } from "@/lib/utils";

/*
 * Register: the site's plain ruled table (Figma C2: Standing row, Numbered
 * row, Three-column row). Mono/Tag heads over a 2 px strong rule, hairline
 * rows, a 2 px strong rule to close. The first column is each row's header,
 * set as a name (Sans/UI) or a label (Mono/Tag); the others are Body small.
 * Below desktop every row stacks: the header, then each cell under its
 * column name where `stackLabels` is on. Always a real table.
 */
type RegisterProps = {
  columns: string[];
  /** Column widths at desktop, in px of the design width (the last may be omitted). */
  widths?: number[];
  rows: React.ReactNode[][];
  first?: "name" | "label";
  /** Show each cell's column name when stacked (three-column registers). */
  stackLabels?: boolean;
  /** Hide the column heads visually (they stay for screen readers). */
  hideHeads?: boolean;
  /** Rendered above the top rule, outside the table, in place of the column heads' row. */
  caption?: React.ReactNode;
  className?: string;
};

export function Register({ columns, widths, rows, first = "name", stackLabels = false, hideHeads = false, caption, className }: RegisterProps) {
  const total = widths ? widths.reduce((a, b) => a + b, 0) : 0;
  return (
    <div className={className}>
      {caption ? <div className="border-b-2 border-rule-strong pb-2">{caption}</div> : null}
      <RegisterTable columns={columns} widths={widths} total={total} rows={rows} first={first} stackLabels={stackLabels} hideHeads={hideHeads || Boolean(caption)} topRule={!caption} />
    </div>
  );
}

function RegisterTable({ columns, widths, total, rows, first, stackLabels, hideHeads, topRule }: {
  columns: string[]; widths?: number[]; total: number; rows: React.ReactNode[][]; first: "name" | "label"; stackLabels: boolean; hideHeads: boolean; topRule: boolean;
}) {
  const caption = !topRule;
  return (
    <table role="table" className="w-full table-fixed border-collapse text-left max-lg:block">
      {widths ? (
        <colgroup>
          {widths.map((w, i) => (
            <col key={i} style={{ width: `${((w / total) * 100).toFixed(3)}%` }} />
          ))}
        </colgroup>
      ) : null}
      <thead role="rowgroup" className={hideHeads ? "sr-only" : "max-lg:sr-only"}>
        <tr role="row" className="border-b-2 border-rule-strong">
          {columns.map((column) => (
            <th key={column} role="columnheader" scope="col" className="t-tag pr-6 pb-2 font-medium text-ink-muted last:pr-0">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody role="rowgroup" className={cn("max-lg:block", !caption && "max-lg:border-t-2 max-lg:border-rule-strong")}>
        {rows.map((row, r) => (
          <tr
            key={r}
            role="row"
            className={cn(
              r === rows.length - 1 ? "border-b-2 border-rule-strong" : "border-b border-rule",
              "max-lg:flex max-lg:flex-col max-lg:py-4",
              stackLabels ? "max-lg:gap-3" : "max-lg:gap-1",
            )}
          >
            {row.map((cell, c) =>
              c === 0 ? (
                <th
                  key={c}
                  role="rowheader"
                  scope="row"
                  className={cn("align-baseline font-medium lg:py-4 lg:pr-6", first === "name" ? "t-ui text-ink" : "t-tag text-ink-muted")}
                >
                  {cell}
                </th>
              ) : (
                <td key={c} role="cell" className="t-body-sm align-baseline text-ink lg:py-4 lg:pr-6 lg:last:pr-0">
                  {stackLabels ? (
                    <span aria-hidden="true" className="t-tag block pb-1 text-ink-muted lg:hidden">
                      {columns[c]}
                    </span>
                  ) : null}
                  {cell}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
