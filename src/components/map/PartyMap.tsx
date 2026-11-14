import { Arrow, straight } from "@/components/drawings/Arrow";
import { PlayOnce } from "@/components/drawings/PlayOnce";
import { ReturnArrow } from "@/components/map/ReturnArrow";
import { TextLink } from "@/components/ui/TextLink";
import { cn } from "@/lib/utils";

type ArrowKind = "money" | "data";

/*
 * Who takes part · map (Figma 243:3330 at 1440, 248:3474 at 768, 248:3955 at
 * 390; REDRAW-2026-11-14.md, Home). A flat map on a tinted panel. Desktop:
 * Exporters, Financiers and Buyers on top; Trade platforms, Kubar (petrol)
 * and Credit insurers below. Solid 2 px arrows for money (financiers to
 * exporters, buyers to financiers); dashed 1.5 px arrows for data (exporters
 * to trade platforms, trade platforms to Kubar, Kubar to financiers, Kubar to
 * credit insurers). No solid line touches Kubar.
 *
 * Desktop lays the cards on a grid whose gaps are tracks of their own (88 px
 * across, 96 px down, as in the frame), so each arrow sits in its gap and
 * stays between its cards at any width from 1200 up.
 *
 * Below desktop the cards are one column in the order Buyers, Financiers,
 * Exporters, Trade platforms, Kubar, Credit insurers, joined by the same two
 * arrow styles, with the Kubar-to-Financiers data arrow returning up the
 * right side (section 9.3). That is also the reading order at every width.
 *
 * Motion (section 7): cards are there from the start; when 40% of the map is
 * in view the two money arrows draw, then the data arrows, 320 ms each, and
 * the return arrow last. Hovering or focusing a card dims the arrows that
 * don't touch it to 30%; cards with a link rise from --elevation-2 to
 * --elevation-3 and 2 px up (globals.css). The arrows are aria-hidden: each
 * card's role says what moves.
 */
export type Party = { party: string; role: string; link: { label: string; href: string } | null };

// Keys by the party's place in the messages (whoTakesPart.rows).
const KEYS = ["financiers", "insurers", "platforms", "exporters", "buyers", "kubar"] as const;
type Key = (typeof KEYS)[number];

// Reading order, and each card's cell on the desktop grid (cards in columns
// 1, 3 and 5 and rows 1 and 3; the even tracks are the gaps).
const ORDER: Key[] = ["buyers", "financiers", "exporters", "platforms", "kubar", "insurers"];
const CELL: Record<Key, string> = {
  exporters: "lg:col-start-1 lg:row-start-1",
  financiers: "lg:col-start-3 lg:row-start-1",
  buyers: "lg:col-start-5 lg:row-start-1",
  platforms: "lg:col-start-1 lg:row-start-3",
  kubar: "lg:col-start-3 lg:row-start-3",
  insurers: "lg:col-start-5 lg:row-start-3",
};

const DRAW = { money: 0, data: 320, return: 640 };

// Desktop arrows, each in a gap: from and to are the parties it joins, in
// the direction it points.
type GapArrow = { from: Key; to: Key; kind: ArrowKind; cell: string; axis: "x" | "y"; dir: 1 | -1 };
const GAP_ARROWS: GapArrow[] = [
  { from: "financiers", to: "exporters", kind: "money", cell: "lg:col-start-2 lg:row-start-1", axis: "x", dir: -1 },
  { from: "buyers", to: "financiers", kind: "money", cell: "lg:col-start-4 lg:row-start-1", axis: "x", dir: -1 },
  { from: "exporters", to: "platforms", kind: "data", cell: "lg:col-start-1 lg:row-start-2", axis: "y", dir: 1 },
  { from: "platforms", to: "kubar", kind: "data", cell: "lg:col-start-2 lg:row-start-3", axis: "x", dir: 1 },
  { from: "kubar", to: "financiers", kind: "data", cell: "lg:col-start-3 lg:row-start-2", axis: "y", dir: -1 },
  { from: "kubar", to: "insurers", kind: "data", cell: "lg:col-start-4 lg:row-start-3", axis: "x", dir: 1 },
];

// The arrow under each card in the column (below desktop), to the next card.
const COLUMN_ARROW: Partial<Record<Key, ArrowKind>> = {
  buyers: "money",
  financiers: "money",
  exporters: "data",
  platforms: "data",
  kubar: "data",
};

function GapArrowSvg({ arrow }: { arrow: GapArrow }) {
  // From the frame: 6 px clear of the card the line leaves, 8 px of the one
  // its head points at.
  const across = arrow.axis === "x";
  const length = across ? 88 : 96;
  const [start, tip] = arrow.dir === 1 ? [6, length - 8] : [length - 6, 8];
  const line = across ? straight(start, 6, tip, 6) : straight(6, start, 6, tip);
  return (
    <svg
      aria-hidden="true"
      width={across ? 88 : 12}
      height={across ? 12 : 96}
      viewBox={across ? "0 0 88 12" : "0 0 12 96"}
      className={cn("hidden self-center justify-self-center overflow-visible lg:block", arrow.cell)}
    >
      <Arrow
        id={`map-${arrow.from}-${arrow.to}`}
        {...line}
        kind={arrow.kind}
        delay={DRAW[arrow.kind]}
        touches={`${arrow.from} ${arrow.to}`}
      />
    </svg>
  );
}

function ColumnArrow({ kind, from, to }: { kind: ArrowKind; from: Key; to: Key }) {
  return (
    <div aria-hidden="true" className="mr-7 flex h-11 justify-center lg:hidden">
      <svg width="12" height="44" viewBox="0 0 12 44" className="overflow-visible">
        <Arrow id={`map-column-${from}`} {...straight(6, 7, 6, 37)} kind={kind} delay={DRAW[kind]} touches={`${from} ${to}`} />
      </svg>
    </div>
  );
}

export function PartyMap({
  parties,
  legend,
  className,
}: {
  parties: Party[];
  legend: { money: string; data: string };
  className?: string;
}) {
  const byKey = Object.fromEntries(KEYS.map((key, i) => [key, parties[i]])) as Record<Key, Party>;

  return (
    <PlayOnce className={cn("party-map flex flex-col gap-6 bg-inset p-4 md:p-8 lg:gap-8 lg:p-12", className)}>
      <div className="relative">
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)_88px_minmax(0,1fr)] lg:grid-rows-[minmax(208px,auto)_96px_minmax(208px,auto)]">
          {ORDER.map((key, i) => {
            const party = byKey[key];
            const kubar = key === "kubar";
            const arrow = COLUMN_ARROW[key];
            return (
              <div key={key} className="contents">
                <div
                  data-party={key}
                  data-ground={kubar ? "petrol" : undefined}
                  // Buyers has no link: a tap or click focuses the card for the
                  // dimming, but Tab skips it (the dimming shows nothing new).
                  tabIndex={party.link ? undefined : -1}
                  className={cn(
                    "map-card mr-7 flex flex-col gap-4 border border-rule px-5 py-[18px] outline-offset-2 lg:mr-0 lg:justify-between lg:px-6 lg:py-[22px]",
                    kubar ? "bg-page [--lift-rest:var(--elevation-3)]" : "bg-raised",
                    party.link ? "lift-card" : "relative shadow-elevation-2",
                    CELL[key],
                  )}
                >
                  <div className="flex flex-col gap-1.5 lg:gap-2">
                    <h3 className="t-h4 text-ink">{party.party}</h3>
                    <p className="t-body-sm text-ink">{party.role}</p>
                  </div>
                  {party.link ? (
                    // The link covers the card, so the whole card is the target.
                    <TextLink href={party.link.href} kind="arrow" className="self-start after:absolute after:inset-0">
                      {party.link.label}
                    </TextLink>
                  ) : null}
                </div>
                {arrow ? <ColumnArrow kind={arrow} from={key} to={ORDER[i + 1]} /> : null}
              </div>
            );
          })}
          {GAP_ARROWS.map((arrow) => (
            <GapArrowSvg key={`${arrow.from}-${arrow.to}`} arrow={arrow} />
          ))}
        </div>

        <ReturnArrow from="kubar" to="financiers" delay={DRAW.return} />
      </div>

      <ul className="flex flex-col gap-2 md:flex-row md:gap-10">
        <li className="flex items-center gap-3">
          <svg aria-hidden="true" width="40" height="8" viewBox="0 0 40 8" className="shrink-0">
            <line x1="0" x2="40" y1="4" y2="4" className="stroke-ink" strokeWidth={2} />
          </svg>
          <span className="t-fine text-ink-muted">{legend.money}</span>
        </li>
        <li className="flex items-center gap-3">
          <svg aria-hidden="true" width="40" height="8" viewBox="0 0 40 8" className="shrink-0">
            <line x1="0" x2="40" y1="4" y2="4" className="stroke-ink-muted" strokeWidth={1.5} strokeDasharray="5 3" />
          </svg>
          <span className="t-fine text-ink-muted">{legend.data}</span>
        </li>
      </ul>
    </PlayOnce>
  );
}
