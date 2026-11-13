import { TextLink } from "@/components/ui/TextLink";
import { cn } from "@/lib/utils";

/*
 * Contact routes (Figma C2 76:858, Page=Home): who should write and the next
 * step for them, each a link (to the form with its intent chosen, or to
 * partnerships@ for investors). A register in two equal columns; below
 * desktop each route stacks. On Contact (Page=Contact) a third column says
 * where the message goes.
 */
export type ContactRoute = { who: string; step: string; href: string; goesTo?: string };

export function ContactRoutes({
  columns,
  rows,
  className,
}: {
  columns: { who: string; step: string; goesTo?: string };
  rows: ContactRoute[];
  className?: string;
}) {
  const three = Boolean(columns.goesTo);
  const width = three ? "w-1/3" : "w-1/2";
  return (
    <table role="table" className={cn("w-full table-fixed border-collapse text-left max-lg:block", className)}>
      <thead role="rowgroup" className="max-lg:sr-only">
        <tr role="row" className="border-b-2 border-rule-strong">
          <th role="columnheader" scope="col" className={cn("t-tag pr-6 pb-2 font-medium text-ink-muted", width)}>{columns.who}</th>
          <th role="columnheader" scope="col" className={cn("t-tag pb-2 font-medium text-ink-muted", width, three && "pr-6")}>{columns.step}</th>
          {three ? <th role="columnheader" scope="col" className="t-tag w-1/3 pb-2 font-medium text-ink-muted">{columns.goesTo}</th> : null}
        </tr>
      </thead>
      <tbody role="rowgroup" className="max-lg:block max-lg:border-t-2 max-lg:border-rule-strong">
        {rows.map((row, i) => (
          <tr
            key={row.who}
            role="row"
            className={cn(
              i === rows.length - 1 ? "border-b-2 border-rule-strong" : "border-b border-rule",
              "max-lg:flex max-lg:flex-col max-lg:gap-2 max-lg:py-4",
            )}
          >
            <th role="rowheader" scope="row" className="t-ui align-baseline font-medium text-ink lg:py-4 lg:pr-6">{row.who}</th>
            <td role="cell" className="align-baseline lg:py-4">
              <TextLink href={row.href} kind="arrow">{row.step}</TextLink>
            </td>
            {three ? <td role="cell" className="t-body-sm align-baseline text-ink-muted lg:py-4">{row.goesTo}</td> : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
