import { cn } from "@/lib/utils";

/*
 * Who holds what (Figma 250:1782 at 1440, 257:2554 at 390;
 * REDRAW-2026-11-14.md, Kubar Protocol). "You, the financier" as one raised
 * petrol card (420 at desktop, --elevation-3); the other four as plain blocks
 * in a two-by-two beside it (under it on tablets, one under another on
 * phones). A filled dot marks "Holds", a hollow rani dot "Doesn't hold".
 */
type Party = [name: string, holds: string, doesntHold: string];

function Dot({ hollow }: { hollow?: boolean }) {
  return (
    <svg aria-hidden="true" width="8" height="8" viewBox="0 0 8 8" className="shrink-0">
      {hollow ? (
        <circle cx={4} cy={4} r={3.25} className="fill-none stroke-accent" strokeWidth={1.5} />
      ) : (
        <circle cx={4} cy={4} r={4} className="fill-ink" />
      )}
    </svg>
  );
}

function Holdings({ party, labels, large }: { party: Party; labels: [string, string]; large?: boolean }) {
  const [, holds, doesnt] = party;
  return (
    <dl className={cn("flex flex-col", large ? "gap-6" : "gap-4")}>
      {[
        [labels[0], holds, false],
        [labels[1], doesnt, true],
      ].map(([label, value, hollow]) => (
        <div key={label as string} className="flex flex-col gap-1.5">
          <dt className="t-fine flex items-center gap-2 text-ink-muted">
            <Dot hollow={hollow as boolean} />
            {label}
          </dt>
          <dd className={cn(large ? "t-body" : "t-body-sm", "text-ink")}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function HoldsCards({ rows, labels, className }: { rows: Party[]; labels: [string, string]; className?: string }) {
  const [you, ...others] = rows;
  return (
    <ul className={cn("flex flex-col gap-9 md:gap-12 lg:flex-row lg:items-start lg:gap-16", className)}>
      <li
        data-ground="petrol"
        className="flex flex-col gap-4 border border-rule bg-page px-6 pt-7 pb-8 shadow-elevation-3 md:gap-6 lg:w-[420px] lg:shrink-0 lg:px-9 lg:pt-8 lg:pb-10"
      >
        <h3 className="t-h3 text-ink">{you[0]}</h3>
        <Holdings party={you} labels={labels} large />
      </li>
      <li className="lg:min-w-0 lg:flex-1">
        <ul className="grid gap-9 md:grid-cols-2 md:gap-x-12 md:gap-y-12">
          {others.map((party) => (
            <li key={party[0]} className="flex flex-col gap-4">
              <h3 className="t-h4 text-ink">{party[0]}</h3>
              <Holdings party={party} labels={labels} />
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
}
