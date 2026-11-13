"use client";

import { useId, useState } from "react";
import { reader } from "@/lib/copy";
import { cx as cn } from "@/lib/cx";

/*
 * Record RCV-0001 (Figma C2 71:487; option B in Home · 1440, 160:57).
 * A 2 px strong rule opens it; the head (code and Illustrative); the summary
 * in Serif/Record; the documents as a real table (No., Document, Source,
 * Status, and a visually hidden Proves column); the Proves line; the state
 * line ("05 of 08", "05 Purchased" in rani).
 *
 * Hover, focus or tap a document and the Proves line shows what it proves;
 * otherwise it shows the current (latest) document's. The line keeps its
 * height (two lines on desktop, three below), so nothing moves.
 * Below desktop each row stacks: number, document and status on the first
 * line, the source under the document; the column heads are read, not shown.
 */
type Document = { no: string; document: string; source: string; status: string; proves: string };

export function RecordView({
  copy,
  illustrative,
  className,
}: {
  /** The "record" messages. */
  copy: unknown;
  /** The Illustrative tag, rendered on the server. */
  illustrative: React.ReactNode;
  className?: string;
}) {
  const t = reader(copy);
  const documents = t.raw("documents") as Document[];
  const current = documents.length - 1;
  const [active, setActive] = useState(current);
  const descriptionId = useId();

  const cell = "align-baseline lg:py-3 lg:pr-4 lg:last:pr-0";

  return (
    <div data-no-abbr className={cn("flex flex-col", className)}>
      <div aria-hidden="true" className="h-0.5 bg-rule-strong" />
      <div className="flex items-baseline justify-between gap-4 pt-3 pb-2">
        <p className="t-tag text-ink">{t("title")}</p>
        {illustrative}
      </div>
      <p className="t-record pb-6 text-ink">{t("summary")}</p>

      <p id={descriptionId} className="sr-only">
        {t("description")}
      </p>
      <table
        role="table"
        aria-describedby={descriptionId}
        className="w-full table-fixed border-collapse text-left max-lg:block"
      >
        <colgroup>
          <col className="w-[8.92%]" />
          <col className="w-[40.13%]" />
          <col className="w-[36.62%]" />
          <col className="w-[14.33%]" />
        </colgroup>
        <thead className="max-lg:sr-only" role="rowgroup">
          <tr role="row" className="border-b border-rule-strong">
            {(["no", "document", "source", "status"] as const).map((key) => (
              <th key={key} role="columnheader" scope="col" className="t-tag pr-4 pb-2 font-medium text-ink-muted last:pr-0">
                {t(`columns.${key}`)}
              </th>
            ))}
            <th role="columnheader" scope="col" className="sr-only">
              {t("columns.proves")}
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup" className="max-lg:block max-lg:border-t max-lg:border-rule-strong">
          {documents.map((doc, index) => (
            <tr
              key={doc.no}
              role="row"
              tabIndex={0}
              aria-current={index === current ? "true" : undefined}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(current)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(current)}
              onClick={() => setActive(index)}
              className={cn(
                "cursor-default border-b border-rule outline-offset-[-2px] transition-colors duration-(--duration-hover) ease-standard",
                "max-lg:grid max-lg:grid-cols-[32px_minmax(0,1fr)_auto] max-lg:items-baseline max-lg:gap-x-3 max-lg:gap-y-1 max-lg:py-3",
                index === current ? "is-current" : "hover:bg-action-soft",
              )}
            >
              <td role="cell" className={cn(cell, "t-code text-ink-muted max-lg:col-start-1 max-lg:row-start-1")}>
                {doc.no}
              </td>
              <th
                role="rowheader"
                scope="row"
                className={cn(cell, "t-ui text-left font-medium text-ink max-lg:col-start-2 max-lg:row-start-1")}
              >
                {doc.document}
              </th>
              <td role="cell" className={cn(cell, "t-body-sm text-ink-muted max-lg:col-span-2 max-lg:col-start-2 max-lg:row-start-2")}>
                {doc.source}
              </td>
              <td
                role="cell"
                className={cn(
                  cell,
                  "t-state max-lg:col-start-3 max-lg:row-start-1",
                  index === current ? "text-accent" : "text-ink",
                )}
              >
                {doc.status}
              </td>
              <td role="cell" className="sr-only">
                {doc.proves}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div aria-hidden="true" className="flex items-baseline gap-2 border-b border-rule py-3">
        <span className="t-tag w-12 shrink-0 text-ink-muted">{t("provesLabel")}</span>
        <span className="t-body-sm min-h-[66px] flex-1 text-ink lg:min-h-[44px]">{documents[active].proves}</span>
      </div>
      <div className="flex items-center justify-between gap-3 pt-3">
        <p className="flex items-center gap-3">
          <span className="t-tag text-ink-muted">{t("stateLabel")}</span>
          <span className="t-label text-ink-muted">{t("counter")}</span>
        </p>
        <p className="t-tag text-accent">{t("currentState")}</p>
      </div>
    </div>
  );
}
