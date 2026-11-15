import { cn } from "@/lib/utils";

/*
 * Receivable sheet (Figma 255:1955 at 1440, 257:2415 at 390;
 * REDRAW-2026-11-14.md, Kubar Protocol "What you buy"). One raised sheet
 * (--elevation-3): "Receivable RCV-0001" with "An example" in plain words
 * at the right of its top row (no Illustrative tag since 15 Nov), the face
 * value in Mono/Figure, then the other nine attributes as label and value
 * pairs, in two columns from tablet up. At desktop two
 * sheets lie behind it at rest (--elevation-1), 6 and 12 px down and right.
 */
export function ReceivableSheet({
  title,
  example,
  rows,
  className,
}: {
  title: string;
  /** "An example", in muted Sans/Fine: plain words, not a button. */
  example: string;
  /** [label, value] pairs, face value first. */
  rows: string[][];
  className?: string;
}) {
  const [[faceLabel, faceValue], ...rest] = rows;
  // The frame's two columns: the money and the goods on the left, the risk and the evidence on the right.
  const split = Math.ceil(rest.length / 2);
  const columns = [rest.slice(0, split), rest.slice(split)];

  return (
    <div className={cn("relative lg:pr-3 lg:pb-3", className)}>
      <div aria-hidden="true" className="absolute top-3 right-0 bottom-0 left-3 hidden border border-rule bg-raised shadow-elevation-1 lg:block" />
      <div aria-hidden="true" className="absolute top-1.5 right-1.5 bottom-1.5 left-1.5 hidden border border-rule bg-raised shadow-elevation-1 lg:block" />
      <div className="relative flex flex-col gap-5 border border-rule bg-raised p-5 shadow-elevation-3 lg:gap-6 lg:px-7 lg:pt-[22px] lg:pb-7">
        <div className="flex items-center justify-between gap-4">
          <p className="t-tag text-ink">{title}</p>
          <p className="t-fine text-ink-muted">{example}</p>
        </div>
        <dl className="flex flex-col gap-1">
          <dt className="t-fine text-ink-muted">{faceLabel}</dt>
          <dd className="t-figure text-ink">{faceValue}</dd>
        </dl>
        <div className="grid gap-4 md:grid-cols-2 md:gap-x-8">
          {columns.map((column, c) => (
            <dl key={c} className="flex flex-col gap-4 lg:gap-[18px]">
              {column.map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <dt className="t-fine text-ink-muted">{label}</dt>
                  <dd className="t-body-sm text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          ))}
        </div>
      </div>
    </div>
  );
}
