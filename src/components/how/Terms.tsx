import { FoldOpen } from "@/components/ui/FoldOpen";
import { cn } from "@/lib/utils";

/*
 * Terms (How it works, "The terms on this site."): the glossary as a
 * register. Term in Sans/UI, meaning in Body small. Each row has an id
 * ("term-…") so a first use elsewhere on the site can point at it. No column
 * heads: "Term" and "Meaning" named nothing (REDRAW-2026-11-14.md, section
 * 10); each row's term is its row header.
 *
 * Shown in part (step 11, Figma 333:2955): the first six rows, and "Show all
 * 19 terms" 24 px under them opens the rest in place and moves focus to the
 * first of them (FoldOpen). The row ids stay: a link to a folded term opens
 * the list and lands on its row. Without script all 19 show and the control
 * is hidden.
 */
export const termId = (term: string) =>
  `term-${term.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

export function Terms({
  rows,
  shown,
  showAll,
  className,
}: {
  rows: [string, React.ReactNode][];
  /** How many rows show before the control opens the rest. */
  shown: number;
  /** The control's words. */
  showAll: string;
  className?: string;
}) {
  return (
    <FoldOpen label={showAll} className={cn("flex flex-col gap-6", className)}>
      <table role="table" className="w-full table-fixed border-collapse text-left max-lg:block">
        <colgroup>
          <col className="lg:w-[326px]" />
          <col />
        </colgroup>
        <tbody role="rowgroup" className="border-t-2 border-rule-strong max-lg:block">
          {rows.map(([term, meaning], r) => (
            <tr
              key={term}
              id={termId(term)}
              tabIndex={r === shown ? -1 : undefined}
              data-folded={r >= shown ? "" : undefined}
              role="row"
              className={cn(
                r === rows.length - 1 ? "border-b-2 border-rule-strong" : "border-b border-rule",
                "outline-offset-4 max-lg:flex max-lg:flex-col max-lg:gap-1 max-lg:py-4",
              )}
            >
              <th role="rowheader" scope="row" className="t-ui align-baseline font-medium text-ink lg:py-4 lg:pr-6">{term}</th>
              <td role="cell" className="t-body-sm align-baseline text-ink lg:py-4">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </FoldOpen>
  );
}
