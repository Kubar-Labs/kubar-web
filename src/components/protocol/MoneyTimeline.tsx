import { cn } from "@/lib/utils";

/*
 * Money timeline (Figma C4 123:1184), Kubar Protocol "What you buy": when the
 * money moves on the financier's side, drawn to scale from zero against the
 * days after shipment. $202,500 paid out at purchase below the line,
 * $225,000 received on day 75 above it, and the deferred purchase price as a
 * dotted box with no figure. Nothing animates (HANDOFF section 7).
 * Desktop: the drawing, 737 × 590. Below desktop: its words as a stacked
 * register under the same heading.
 */
export type TimelineCopy = {
  title: string; holdsNone: string; received: string; paidOut: string; receivedText: string; paidText: string;
  meanwhile: string; deferred: string; shipment: string; purchase: string; due: string; note: string;
  stacked: { paid: string; meanwhile: string; received: string; later: string }; alt: string;
};

const guide = "absolute top-[61.5px] h-[424.75px] w-0 border-l border-dashed border-rule";

export function MoneyTimeline({ copy, className }: { copy: TimelineCopy; className?: string }) {
  const stacked: [string, string][] = [
    [copy.stacked.paid, copy.paidText],
    [copy.stacked.meanwhile, copy.meanwhile],
    [copy.stacked.received, copy.receivedText],
    [copy.stacked.later, copy.deferred],
  ];
  return (
    <div className={className}>
      {/* Desktop: the drawing. */}
      <div role="img" aria-label={copy.alt} className="relative hidden h-[590px] w-[737px] lg:block">
        <p className="t-tag absolute top-0 left-0 text-ink-muted">{copy.title}</p>
        <p className="t-label absolute -top-1 right-0 text-accent">{copy.holdsNone}</p>
        <span className={guide} style={{ left: 90 }} />
        <span className={guide} style={{ left: 153 }} />
        <span className={guide} style={{ left: 680 }} />
        <span className="absolute top-[280px] left-5 h-px w-[717px] bg-rule-strong" />
        <p className="t-tag absolute top-[258px] left-0 text-ink-muted">{copy.received}</p>
        <p className="t-tag absolute top-[290px] left-0 text-ink-muted">{copy.paidOut}</p>
        <span className="absolute top-[281px] left-[139px] h-[182px] w-7 bg-ink" />
        <span className="absolute top-[78px] left-[666px] h-[203px] w-7 bg-ink" />
        <span className="absolute top-[281px] left-[700px] h-5 w-7 border border-dashed border-ink-muted" />
        <p className="t-body-sm absolute top-[79.5px] right-[83px] w-[300px] text-right text-ink">{copy.receivedText}</p>
        <p className="t-body-sm absolute top-[416px] left-[177px] w-[280px] text-ink">{copy.paidText}</p>
        <span className="absolute top-[235px] left-[171px] h-2.5 w-[491px] border-x border-ink-muted">
          <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink-muted" />
        </span>
        <p className="t-body-sm absolute top-[208px] left-[179px] whitespace-nowrap text-ink-muted">{copy.meanwhile}</p>
        <p className="t-body-sm absolute top-[316px] right-0 w-[330px] text-right text-ink-muted">{copy.deferred}</p>
        <p className="t-code absolute top-[494px] left-[90px] whitespace-nowrap text-ink-muted">{copy.shipment}</p>
        <p className="t-code absolute top-[516px] left-[149px] whitespace-nowrap text-ink-muted">{copy.purchase}</p>
        <p className="t-code absolute top-[494px] left-[557px] whitespace-nowrap text-ink-muted">{copy.due}</p>
        <p className="t-fine absolute top-[550px] left-0 w-[600px] text-ink-muted">{copy.note}</p>
      </div>

      {/* Below desktop: the same words as a stacked register. */}
      <div className="lg:hidden">
        <div className="flex items-baseline justify-between gap-4 border-b-2 border-rule-strong pb-2">
          <p className="t-tag text-ink-muted">{copy.title}</p>
          <p className="t-label text-accent">{copy.holdsNone}</p>
        </div>
        <dl>
          {stacked.map(([label, text], i) => (
            <div key={label} className={cn("flex flex-col gap-1 py-4", i === stacked.length - 1 ? "border-b-2 border-rule-strong" : "border-b border-rule")}>
              <dt className="t-tag text-ink-muted">{label}</dt>
              <dd className="t-body-sm text-ink">{text}</dd>
            </div>
          ))}
        </dl>
        <p className="t-fine pt-3 text-ink-muted">{copy.note}</p>
      </div>
    </div>
  );
}
