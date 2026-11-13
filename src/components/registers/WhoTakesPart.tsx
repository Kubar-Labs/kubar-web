import { TextLink } from "@/components/ui/TextLink";
import { cn } from "@/lib/utils";

/*
 * Who takes part (Figma C2 73:766): the six parties and their roles.
 * A register at 3, 6 and 3 columns: Mono/Tag heads over a 2 px strong rule
 * (the link column's head is for screen readers only), hairline rows, a 2 px
 * strong rule to close. No pictograms and no mark (option B). Below desktop
 * each row stacks: party, role, link.
 */
export type PartyRow = { party: string; role: string; link: { label: string; href: string } | null };

export function WhoTakesPart({
  columns,
  rows,
  className,
}: {
  columns: { party: string; role: string; more: string };
  rows: PartyRow[];
  className?: string;
}) {
  return (
    <table role="table" className={cn("w-full table-fixed border-collapse text-left max-lg:block", className)}>
      <colgroup>
        <col className="w-[25.47%]" />
        <col className="w-[50.94%]" />
        <col />
      </colgroup>
      <thead role="rowgroup" className="max-lg:sr-only">
        <tr role="row" className="border-b-2 border-rule-strong">
          <th role="columnheader" scope="col" className="t-tag pr-6 pb-2 font-medium text-ink-muted">{columns.party}</th>
          <th role="columnheader" scope="col" className="t-tag pr-6 pb-2 font-medium text-ink-muted">{columns.role}</th>
          <th role="columnheader" scope="col"><span className="sr-only">{columns.more}</span></th>
        </tr>
      </thead>
      <tbody role="rowgroup" className="max-lg:block max-lg:border-t-2 max-lg:border-rule-strong">
        {rows.map((row, i) => (
          <tr
            key={row.party}
            role="row"
            className={cn(
              i === rows.length - 1 ? "border-b-2 border-rule-strong" : "border-b border-rule",
              "max-lg:flex max-lg:flex-col max-lg:gap-2 max-lg:py-4",
            )}
          >
            <th role="rowheader" scope="row" className="t-ui align-baseline font-medium text-ink lg:py-4 lg:pr-6">{row.party}</th>
            <td role="cell" className="t-body-sm align-baseline text-ink lg:py-4 lg:pr-6">{row.role}</td>
            <td role="cell" className="align-baseline lg:py-4">
              {row.link ? (
                <TextLink href={row.link.href} kind="arrow">{row.link.label}</TextLink>
              ) : (
                <span className="t-body-sm text-ink-muted" aria-hidden="true">—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
