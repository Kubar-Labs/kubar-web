import { KubarMark } from "@/components/brand/KubarMark";
import { cn } from "@/lib/utils";

/*
 * Platform lanes (Figma C4 138:2455), NavDhan SDK "How it runs on your
 * platform.": the five steps as a numbered register (always shown) and, at
 * desktop only, three lanes beside it: Your platform, Kubar Protocol (filled,
 * with the mark) and The financier. An ink square marks an action within a
 * lane; the data path is dashed; the evidence package travels on a 1 px
 * process line. No money line touches the platform's lane. The lanes are
 * decorative for assistive technology: the register carries the steps.
 */
export function NumberedRows({ items, className }: { items: string[]; className?: string }) {
  return (
    <ol className={cn("border-t-2 border-rule-strong", className)}>
      {items.map((item, i) => (
        <li key={item} className={cn("flex items-baseline gap-3 py-4 lg:gap-6", i === items.length - 1 ? "border-b-2 border-rule-strong" : "border-b border-rule")}>
          <span aria-hidden="true" className="t-code w-6 shrink-0 text-ink lg:w-auto lg:flex-1">{String(i + 1).padStart(2, "0")}</span>
          <span className="t-body flex-1 text-ink">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function PlatformLanes({
  columns,
  steps,
  lanes,
  paths,
}: {
  columns: { step: string; what: string };
  steps: string[];
  lanes: string[];
  paths: { sdk: string; consent: string; evidence: string; status: string };
}) {
  const box = "t-ui absolute top-0 flex h-[76px] w-[124px] items-center justify-center whitespace-nowrap";
  return (
    <div className="relative lg:h-[528px] lg:w-[1062px]">
      <table className="w-full border-collapse text-left lg:absolute lg:top-[50px] lg:left-0 lg:w-[519px]">
        <thead className="max-lg:sr-only">
          <tr className="border-b-2 border-rule-strong">
            <th scope="col" className="t-tag w-[109px] pb-2 font-medium text-ink-muted">{columns.step}</th>
            <th scope="col" className="t-tag pb-2 font-medium text-ink-muted">{columns.what}</th>
          </tr>
        </thead>
        <tbody className="max-lg:border-t-2 max-lg:border-rule-strong">
          {steps.map((step, i) => (
            <tr key={step} className={i === steps.length - 1 ? "border-b-2 border-rule-strong" : "border-b border-rule"}>
              <td className="t-code w-9 py-4 align-baseline text-ink lg:w-[109px]">{String(i + 1).padStart(2, "0")}</td>
              <td className="t-body py-4 align-baseline text-ink">{step}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div aria-hidden="true" className="hidden lg:block">
        <span className={cn(box, "left-[543px] border border-rule-strong bg-raised text-ink")}>{lanes[0]}</span>
        <span className={cn(box, "left-[740px] flex-col gap-2 bg-action text-on-action")}>
          <KubarMark height={20} />
          {lanes[1]}
        </span>
        <span className={cn(box, "left-[938px] border border-rule-strong bg-raised text-ink")}>{lanes[2]}</span>
        {[605, 802, 1000].map((x) => (
          <span key={x} className="absolute top-[76px] h-[452px] w-px bg-rule" style={{ left: x }} />
        ))}
        <span className="absolute top-[114px] left-[600.5px] size-2.5 bg-ink" />
        <span className="absolute top-[199px] left-[600.5px] size-2.5 bg-ink" />
        <span className="t-tag absolute top-[196px] left-[617px] text-ink-muted">{paths.sdk}</span>
        <span className="t-tag absolute top-[262px] left-[617px] w-[170px] text-ink-muted">{paths.consent}</span>
        <span className="t-tag absolute top-[376px] left-[814px] text-ink-muted">{paths.evidence}</span>
        <span className="t-tag absolute top-[461px] left-[617px] text-ink-muted">{paths.status}</span>
        <span className="absolute top-[395px] left-[995.5px] size-2.5 bg-ink" />
        <span className="absolute top-[480px] left-[995.5px] size-2.5 bg-ink" />
        <svg className="absolute inset-0" width={1062} height={528} viewBox="0 0 1062 528" fill="none">
          <g className="text-ink-muted" stroke="currentColor" strokeWidth={1.5}>
            <line x1={605} y1={302} x2={800} y2={302} strokeDasharray="5 4" />
            <path d="M795.7 296.7L801 302L795.7 307.3" strokeLinecap="round" strokeLinejoin="round" />
            <line x1={802} y1={485} x2={607} y2={485} strokeDasharray="5 4" />
            <path d="M611.3 479.7L606 485L611.3 490.3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g className="text-ink" stroke="currentColor" strokeWidth={1}>
            <line x1={802} y1={400} x2={994} y2={400} />
            <path d="M990.3 396.3L994 400L990.3 403.7" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}
