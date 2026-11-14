import { cn } from "@/lib/utils";

/*
 * Money timeline (Figma C4 123:1184; Kubar Protocol 1440 167:101, 768
 * 169:1931, 390 168:782), "What you buy": when the money moves on the
 * financier's side, drawn to scale from zero against the days after
 * shipment. $202,500 paid out at purchase below the line, $225,000 received
 * on day 75 above it, and the deferred purchase price as a dotted box with
 * no figure. Nothing animates (HANDOFF section 7).
 *
 * Desktop: the drawing takes its column's width (737 at 1440, about 580 on a
 * 1280 laptop); the day axis and the bars follow the width, the words keep
 * their size. Tablets and phones: the small drawing (350 wide, the day 0 and
 * day 75 bars) above the same words as a list, in the frames' order.
 */
export type TimelineCopy = {
  title: string; holdsNone: string; received: string; paidOut: string; receivedText: string; paidText: string;
  meanwhile: string; deferred: string; shipment: string; purchase: string; due: string; note: string;
  dayZero: string; dayDue: string;
  stacked: { paid: string; meanwhile: string; received: string; later: string }; alt: string;
};

// The day axis in the 737 frame: shipment, purchase and due date.
const AT = { ship: 90 / 737, buy: 153 / 737, due: 680 / 737 };
const pct = (x: number) => `${(x * 100).toFixed(3)}%`;
const guide = "absolute w-0 border-l border-dashed border-rule";

export function MoneyTimeline({ copy, className }: { copy: TimelineCopy; className?: string }) {
  const list: [string, string, boolean][] = [
    [copy.stacked.paid, copy.paidText, false],
    [copy.stacked.received, copy.receivedText, false],
    [copy.stacked.later, copy.deferred, true],
    [copy.stacked.meanwhile, copy.meanwhile, true],
  ];
  return (
    <div className={className}>
      {/* Desktop: the drawing at its column's width. */}
      <div role="img" aria-label={copy.alt} className="relative hidden h-[594px] w-full lg:block">
        <p className="t-fine absolute top-0 left-0 text-ink-muted">{copy.title}</p>
        <p className="t-fine absolute -top-1 right-0 text-accent">{copy.holdsNone}</p>
        {[AT.ship, AT.buy, AT.due].map((x) => (
          <span key={x} className={cn(guide, "top-[61.5px] h-[424.75px]")} style={{ left: pct(x) }} />
        ))}
        <span className="absolute top-[280px] right-0 left-5 h-px bg-rule-strong" />
        <p className="t-fine absolute top-[256px] left-0 text-ink-muted">{copy.received}</p>
        <p className="t-fine absolute top-[288px] left-0 text-ink-muted">{copy.paidOut}</p>
        <span className="absolute top-[281px] h-[182px] w-7 -translate-x-1/2 bg-ink" style={{ left: pct(AT.buy) }} />
        <span className="absolute top-[78px] h-[203px] w-7 -translate-x-1/2 bg-ink" style={{ left: pct(AT.due) }} />
        <span className="absolute top-[281px] h-5 w-7 border border-dashed border-ink-muted" style={{ left: `calc(${pct(AT.due)} + 20px)` }} />
        <p
          className="t-body-sm absolute top-[79.5px] w-[300px] max-w-[60%] text-right text-ink"
          style={{ right: `calc(${pct(1 - AT.due)} + 26px)` }}
        >
          {copy.receivedText}
        </p>
        <p className="t-body-sm absolute top-[416px] w-[280px] max-w-[55%] text-ink" style={{ left: `calc(${pct(AT.buy)} + 24px)` }}>
          {copy.paidText}
        </p>
        <span
          className="absolute top-[235px] h-2.5 border-x border-ink-muted"
          style={{ left: `calc(${pct(AT.buy)} + 18px)`, right: `calc(${pct(1 - AT.due)} + 18px)` }}
        >
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink-muted" />
        </span>
        {/* Over the bracket: one line at 1440, two on a narrower laptop, never past the day 75 bar. */}
        <p
          className="t-body-sm absolute bottom-[360px] text-ink-muted"
          style={{ left: `calc(${pct(AT.buy)} + 26px)`, right: `calc(${pct(1 - AT.due)} + 26px)` }}
        >
          {copy.meanwhile}
        </p>
        <p className="t-body-sm absolute top-[316px] right-0 w-[330px] max-w-[57%] text-right text-ink-muted">{copy.deferred}</p>
        <p className="t-code absolute top-[494px] whitespace-nowrap text-ink-muted" style={{ left: pct(AT.ship) }}>
          {copy.shipment}
        </p>
        <p className="t-code absolute top-[516px] whitespace-nowrap text-ink-muted" style={{ left: `calc(${pct(AT.buy)} - 4px)` }}>
          {copy.purchase}
        </p>
        <p className="t-code absolute top-[494px] -translate-x-full whitespace-nowrap text-ink-muted" style={{ left: `calc(${pct(AT.due)} + 13px)` }}>
          {copy.due}
        </p>
        <p className="t-body-sm absolute top-[550px] left-0 w-[640px] max-w-full text-ink-muted">{copy.note}</p>
      </div>

      {/* Tablets and phones (Figma 123:1157): the small drawing, then the words as a list. */}
      <div className="max-w-[350px] lg:hidden">
        <p className="t-fine text-ink-muted">{copy.title}</p>
        <p className="t-fine pt-1 text-accent">{copy.holdsNone}</p>
        <div aria-hidden="true" className="relative mt-[33.5px] h-[278px]">
          {[20, 50, 300].map((x) => (
            <span key={x} className={cn(guide, "top-0 h-[254px]")} style={{ left: pct(x / 350) }} />
          ))}
          <span className="absolute top-[128.5px] right-0 left-0 h-px bg-rule-strong" />
          <span className="absolute top-[129.5px] h-[101px] w-5 -translate-x-1/2 bg-ink" style={{ left: pct(50 / 350) }} />
          <span className="absolute top-[16.5px] h-[113px] w-5 -translate-x-1/2 bg-ink" style={{ left: pct(300 / 350) }} />
          <span className="absolute top-[129.5px] size-5 border border-dashed border-ink-muted" style={{ left: `calc(${pct(300 / 350)} + 16px)` }} />
          <span className="t-code absolute top-[257.75px] text-ink-muted" style={{ left: pct(14 / 350) }}>
            {copy.dayZero}
          </span>
          <span className="t-code absolute top-[257.75px] text-ink-muted" style={{ left: pct(261 / 350) }}>
            {copy.dayDue}
          </span>
        </div>
        <dl className="mt-4">
          {list.map(([label, text, muted], i) => (
            <div key={label} className={cn("flex flex-col gap-1 py-3", i === 0 ? "border-t-2 border-rule-strong" : "border-t border-rule")}>
              <dt className="t-fine text-ink-muted">{label}</dt>
              <dd className={cn("t-body-sm", muted ? "text-ink-muted" : "text-ink")}>{text}</dd>
            </div>
          ))}
        </dl>
        <p className="t-body-sm pt-1 text-ink-muted">{copy.note}</p>
      </div>
    </div>
  );
}
