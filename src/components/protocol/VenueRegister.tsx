import { cn } from "@/lib/utils";

/*
 * Venue register (Figma C4 136:2398), Kubar Protocol "The venue comes last.":
 * the sentence up to its colon heads the register in Sans/Body with
 * "Planned" (Mono/State, muted: the one status word kept on the site) beside
 * it, over a 2 px strong rule; the three things as numbered rows; a 2 px
 * strong rule to close; a line under it in muted Body small.
 */
export function VenueRegister({
  sentence,
  planned,
  things,
  under,
  className,
}: {
  sentence: React.ReactNode;
  planned: string;
  things: string[];
  under: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex flex-col-reverse gap-2 border-b-2 border-rule-strong pb-4 lg:flex-row lg:items-baseline lg:gap-6">
        <p className="t-body flex-1 text-ink">{sentence}</p>
        <p className="t-state text-ink-muted">{planned}</p>
      </div>
      <ol>
        {things.map((thing, i) => (
          <li
            key={thing}
            className={cn("flex items-baseline gap-3 py-4 lg:gap-6", i === things.length - 1 ? "border-b-2 border-rule-strong" : "border-b border-rule")}
          >
            <span aria-hidden="true" className="t-code w-6 shrink-0 text-ink lg:w-auto lg:flex-1">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="t-body flex-1 text-ink">{thing}</span>
          </li>
        ))}
      </ol>
      <p className="t-body-sm pt-4 text-ink-muted">{under}</p>
    </div>
  );
}
