import { Illustrative } from "@/components/ui/Illustrative";
import { cn } from "@/lib/utils";

/*
 * Embed sketch (Figma C4 140:2523), the NavDhan SDK hero's drawing: a
 * schematic, not a screenshot. A window labelled "Your platform" with the
 * shipment's own records on the left and the embedded NavDhan SDK panel:
 * the eligibility check (ink squares, met), the indicative offer as dotted
 * boxes with no figure, and the application's four states (the current one
 * in rani, the one to come outlined). Nothing animates. Desktop 519 wide;
 * below desktop the Shipment column is dropped and only the panel shows.
 */
export type SketchCopy = {
  platform: string; shipment: string; records: string[]; sdk: string; eligibility: string; rules: string[];
  offer: string; prices: string[]; application: string; states: string[]; alt: string;
};

function Square({ kind }: { kind: "done" | "current" | "open" }) {
  return (
    <span
      className={cn("size-2.5 shrink-0", kind === "done" && "bg-ink", kind === "current" && "bg-accent", kind === "open" && "border border-rule-strong")}
    />
  );
}

export function EmbedSketch({ copy }: { copy: SketchCopy }) {
  return (
    <div className="flex flex-col border border-rule-strong bg-raised lg:w-[519px]">
      <div className="flex items-center justify-between gap-3 border-b border-rule px-4 py-3">
        <p className="t-tag text-ink-muted">{copy.platform}</p>
        <Illustrative />
      </div>
      <div role="img" aria-label={copy.alt} className="flex items-stretch">
        <div className="hidden w-[170px] shrink-0 flex-col border-r border-rule p-4 lg:flex">
          <p className="t-tag pb-2 text-ink-muted">{copy.shipment}</p>
          {copy.records.map((record) => (
            <p key={record} className="t-body-sm border-b border-rule py-2 text-ink">{record}</p>
          ))}
        </div>
        <div className="min-w-0 flex-1 p-4">
          <div className="flex flex-col gap-3 border border-rule-strong bg-page p-4">
            <p className="t-tag text-ink">{copy.sdk}</p>
            <div className="flex flex-col gap-2">
              <p className="t-ui-sm text-ink">{copy.eligibility}</p>
              <ul className="flex flex-wrap gap-x-4 gap-y-2">
                {copy.rules.map((rule) => (
                  <li key={rule} className="t-body-sm flex items-center gap-2 text-ink"><Square kind="done" />{rule}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2 border-t border-rule pt-3">
              <p className="t-ui-sm text-ink">{copy.offer}</p>
              {copy.prices.map((price) => (
                <p key={price} className="t-body-sm flex items-center justify-between gap-3 text-ink">
                  {price}
                  <span className="h-5 w-14 shrink-0 border border-dashed border-rule-strong" />
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-2 border-t border-rule pt-3">
              <p className="t-ui-sm text-ink">{copy.application}</p>
              <ul className="flex flex-col gap-2">
                {copy.states.map((state, i) => (
                  <li key={state} className="t-body-sm flex items-center gap-2 text-ink">
                    <Square kind={i < 2 ? "done" : i === 2 ? "current" : "open"} />
                    {state}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
