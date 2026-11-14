import { PickStage } from "@/components/how/PickStage";
import { cn } from "@/lib/utils";

/*
 * Signs · map (Figma 287:2806 in How it works · 1440, section 172:541):
 * "Each party signs for its own part" as a map, from 1200 up. Seven cards in
 * three columns: Insurer and Financier; Trade platform, Kubar (petrol) and
 * Exporter; Exporter's bank and Buyer under Kubar and Exporter. Each card
 * has the party's name and its "Does" sentence from the register. Five
 * agreements are 1.5 px ink lines with a label on each, no arrowheads; three
 * papers a party signs alone are a small tag inside its card; a two-line
 * key sits at the bottom left.
 *
 * At 1440 the cards are 304 × 204 with 184 between columns and 100 between
 * rows. On narrower laptops the columns share the width (160 between them)
 * and a row grows with its longest card, so the composition holds from 1200.
 * Each line hangs off a card's edge, so it follows the cards.
 *
 * Aria-hidden: the register stays in the page as a table for screen readers
 * at every width, and is what tablets and phones show.
 *
 * Hover or a tap on a card keeps that card's lines and labels and dims the
 * others to 30%, as Home's party map does (PickStage sets data-picked;
 * globals.css, .signs-map). The highlight adds no tab stops.
 */
export type SignsMapCopy = {
  /** Line labels, by agreement. */
  lines: { policy: string; mandate: string; purchase: string; platform: string; services: string };
  /** Tags, by the party that signs alone. */
  tags: { financier: string; bank: string; buyer: string };
  key: string[];
};

type Party = "financier" | "insurer" | "exporter" | "bank" | "buyer" | "platform" | "kubar";
// The register's rows, in its order.
const ORDER: Party[] = ["financier", "insurer", "exporter", "bank", "buyer", "platform", "kubar"];
const PLACE: Record<Party, string> = {
  insurer: "col-start-1 row-start-1",
  financier: "col-start-2 row-start-1",
  platform: "col-start-1 row-start-2",
  kubar: "col-start-2 row-start-2",
  exporter: "col-start-3 row-start-2",
  bank: "col-start-2 row-start-3",
  buyer: "col-start-3 row-start-3",
};

// A label keeps its opaque ground when dimmed, so its line never shows through the words: only the words dim.
const label = "t-ui-sm absolute z-10 bg-page px-1.5 py-0.5 whitespace-nowrap text-ink";

function Label({ touches, className, children }: { touches: string; className: string; children: string }) {
  return (
    <span className={cn(label, className)}>
      <span data-touches={touches} className="sign-line">
        {children}
      </span>
    </span>
  );
}

/** A line across the gap to the next column, from the middle of a card's right edge, with its label centred on it. */
function Across({ touches, children }: { touches: string; children: string }) {
  return (
    <>
      <span data-touches={touches} className="sign-line absolute top-1/2 left-full w-(--gap) border-t-[1.5px] border-ink" />
      <Label touches={touches} className="top-1/2 left-[calc(100%+var(--gap)/2)] -translate-x-1/2 -translate-y-1/2">
        {children}
      </Label>
    </>
  );
}

export function SignsMap({ rows, copy, className }: { rows: string[][]; copy: SignsMapCopy; className?: string }) {
  const parties = ORDER.map((key, i) => ({ key, name: rows[i][0], does: rows[i][1] }));
  const tag = (key: Party) => (key === "financier" || key === "bank" || key === "buyer" ? copy.tags[key] : null);

  return (
    <PickStage item="[data-party]" from="data-party" className={cn("signs-map", className)}>
      <div aria-hidden="true" className="grid grid-cols-3 gap-x-(--gap) gap-y-[100px]">
        {parties.map(({ key, name, does }) => {
          const kubar = key === "kubar";
          const alone = tag(key);
          return (
            <div
              key={key}
              data-party={key}
              className={cn(
                "relative flex min-h-[204px] flex-col items-start gap-2 border border-rule px-6 py-[22px] shadow-elevation-2",
                kubar ? "bg-ink" : "bg-raised",
                PLACE[key],
              )}
            >
              <p className={cn("t-ui-lg", kubar ? "text-raised" : "text-ink")}>{name}</p>
              <p className={cn("t-body-sm", kubar ? "text-raised" : "text-ink-muted")}>{does}</p>
              {alone ? <p className="t-fine bg-inset px-2 py-[3px] text-ink">{alone}</p> : null}

              {key === "insurer" ? <Across touches="insurer financier">{copy.lines.policy}</Across> : null}
              {key === "platform" ? <Across touches="platform kubar">{copy.lines.platform}</Across> : null}
              {key === "kubar" ? <Across touches="kubar exporter">{copy.lines.services}</Across> : null}
              {key === "financier" ? (
                <>
                  {/* The mandate: straight down to Kubar. */}
                  <span data-touches="financier kubar" className="sign-line absolute top-full left-1/2 h-[100px] border-l-[1.5px] border-ink" />
                  <Label touches="financier kubar" className="top-[calc(100%+50px)] left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {copy.lines.mandate}
                  </Label>
                  {/* The purchase agreement: an L from the right edge across to the Exporter's middle, then down to
                      its top. Two thin lines, so the empty corner between them belongs to no card. */}
                  <span data-touches="financier exporter" className="sign-line absolute top-1/2 left-full w-[calc(var(--gap)+50%)] border-t-[1.5px] border-ink" />
                  <span
                    data-touches="financier exporter"
                    className="sign-line absolute top-1/2 left-[calc(150%+var(--gap)-1.5px)] h-[calc(50%+100px)] border-l-[1.5px] border-ink"
                  />
                  <Label touches="financier exporter" className="top-1/2 left-[calc(100%+43px)] -translate-y-1/2">
                    {copy.lines.purchase}
                  </Label>
                </>
              ) : null}
            </div>
          );
        })}
        <div className="col-start-1 row-start-3 flex flex-col gap-1.5 self-end">
          {copy.key.map((line) => (
            <p key={line} className="t-body-sm whitespace-nowrap text-ink-muted">
              {line}
            </p>
          ))}
        </div>
      </div>
    </PickStage>
  );
}
