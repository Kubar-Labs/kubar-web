import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/*
 * Standing (Figma C2 76:684; option B in Home · 1440, 160:874): Kubar's
 * sandbox entry, membership and awards. A register: Mono/Tag heads over a
 * 2 px strong rule, hairline rows, a 2 px strong rule to close. Kind and
 * Entry share the width at desktop; below desktop the kind sits above the
 * entry and the heads are read, not shown.
 */
type Row = { kind: string; entry: string };

export function Standing({ className }: { className?: string }) {
  const t = useTranslations("standing");
  const rows = t.raw("rows") as Row[];
  const last = rows.length - 1;
  return (
    <table role="table" className={cn("w-full table-fixed border-collapse text-left max-lg:block", className)}>
      <thead role="rowgroup" className="max-lg:sr-only">
        <tr role="row" className="border-b-2 border-rule-strong">
          <th role="columnheader" scope="col" className="t-tag w-1/2 pr-6 pb-2 font-medium text-ink-muted">
            {t("columns.kind")}
          </th>
          <th role="columnheader" scope="col" className="t-tag w-1/2 pb-2 font-medium text-ink-muted">
            {t("columns.entry")}
          </th>
        </tr>
      </thead>
      <tbody role="rowgroup" className="max-lg:block max-lg:border-t-2 max-lg:border-rule-strong">
        {rows.map((row, index) => (
          <tr
            key={`${row.kind}-${index}`}
            role="row"
            className={cn(
              index === last ? "border-b-2 border-rule-strong" : "border-b border-rule",
              "max-lg:flex max-lg:flex-col max-lg:gap-1 max-lg:py-4",
            )}
          >
            <th role="rowheader" scope="row" className="t-tag align-baseline font-medium text-ink-muted lg:py-4 lg:pr-6">
              {row.kind}
            </th>
            <td role="cell" className="t-body-sm align-baseline text-ink lg:py-4">
              {row.entry}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
