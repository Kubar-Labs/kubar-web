import { cn } from "@/lib/utils";

/*
 * Terms (How it works, "The terms on this site."): the glossary as a
 * register. Term in Sans/UI, meaning in Body small. Each row has an id
 * ("term-…") so a first use elsewhere on the site can point at it.
 */
export const termId = (term: string) =>
  `term-${term.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

export function Terms({ columns, rows, className }: { columns: string[]; rows: [string, React.ReactNode][]; className?: string }) {
  return (
    <table role="table" className={cn("w-full table-fixed border-collapse text-left max-lg:block", className)}>
      <colgroup>
        <col className="lg:w-[326px]" />
        <col />
      </colgroup>
      <thead role="rowgroup" className="max-lg:sr-only">
        <tr role="row" className="border-b-2 border-rule-strong">
          {columns.map((column) => (
            <th key={column} role="columnheader" scope="col" className="t-tag pr-6 pb-2 font-medium text-ink-muted last:pr-0">{column}</th>
          ))}
        </tr>
      </thead>
      <tbody role="rowgroup" className="max-lg:block max-lg:border-t-2 max-lg:border-rule-strong">
        {rows.map(([term, meaning], r) => (
          <tr
            key={term}
            id={termId(term)}
            role="row"
            className={cn(
              r === rows.length - 1 ? "border-b-2 border-rule-strong" : "border-b border-rule",
              "max-lg:flex max-lg:flex-col max-lg:gap-1 max-lg:py-4",
            )}
          >
            <th role="rowheader" scope="row" className="t-ui align-baseline font-medium text-ink lg:py-4 lg:pr-6">{term}</th>
            <td role="cell" className="t-body-sm align-baseline text-ink lg:py-4">{meaning}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
