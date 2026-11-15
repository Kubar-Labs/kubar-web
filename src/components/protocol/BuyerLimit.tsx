import { LimitDrawing } from "@/components/protocol/LimitDrawing";
import { cn } from "@/lib/utils";

/*
 * Buyer limit and headroom · isometric (Figma 289:2664 in Kubar Protocol's
 * section 167:319; REDRAW-2026-11-14.md, section 12, item 2). The hero's
 * limit box at 0.8 scale with three labels: "An approved buyer limit" on
 * the box's rim, "Headroom" on a bracket down the right post, and
 * "Receivables bought" on the sheets inside. No motion.
 *
 * The labels are a real list; the art is aria-hidden. Desktop sets them
 * beside the box on leaders; below 1024 the box scales to its column and
 * the labels sit under it in the same order.
 */
export function BuyerLimit({ labels, className }: { labels: [string, string, string]; className?: string }) {
  return (
    <div className={cn("relative lg:h-[352px]", className)}>
      <div className="relative mx-auto w-full max-w-[400px] lg:mx-0">
        <LimitDrawing still full className="block h-auto w-full" />
        {/* Desktop: the leaders and the headroom bracket, in the frame's own pixels. */}
        <svg aria-hidden="true" viewBox="0 0 400 352" className="absolute top-0 left-0 hidden h-[352px] w-[400px] overflow-visible lg:block" fill="none">
          <line x1={366} x2={432} y1={144} y2={144} className="stroke-rule" />
          <path d="M366 152H374V222H366" className="stroke-ink" strokeWidth={1.5} />
          <line x1={374} x2={432} y1={187} y2={187} className="stroke-rule" />
          <line x1={326} x2={432} y1={232} y2={232} className="stroke-rule" />
        </svg>
      </div>
      <ul className="mt-6 flex flex-col gap-3 lg:absolute lg:inset-y-0 lg:left-[448px] lg:mt-0 lg:block">
        {labels.map((label, i) => (
          <li key={label} className="t-ui-lg text-ink lg:absolute lg:whitespace-nowrap" style={{ top: [132, 175, 220][i] }}>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
