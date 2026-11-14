import { cn } from "@/lib/utils";

/*
 * Terms (How it works, "The terms on this site."): the glossary as a
 * register. Term in Sans/UI, meaning in Body small. Each row has an id
 * ("term-…") so a first use elsewhere on the site can point at it. No column
 * heads: "Term" and "Meaning" named nothing (REDRAW-2026-11-14.md, section
 * 10); each row's term is its row header.
 */
export const termId = (term: string) =>
  `term-${term.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

export function Terms({ rows, className }: { rows: [string, React.ReactNode][]; className?: string }) {
  return (
    <table role="table" className={cn("w-full table-fixed border-collapse text-left max-lg:block", className)}>
      <colgroup>
        <col className="lg:w-[326px]" />
        <col />
      </colgroup>
      <tbody role="rowgroup" className="border-t-2 border-rule-strong max-lg:block">
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
