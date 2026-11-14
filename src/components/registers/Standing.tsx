import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/*
 * Standing (Figma 252:4140 in Home · 1440, 248:3536 at 768, 248:4017 at 390;
 * REDRAW-2026-11-14.md, Home): Kubar's sandbox entry, membership and awards
 * as four plain statements, each with its kind in Sans/Fine. No cards, no
 * rules. Desktop sets the kind in a 120 px column beside the statement;
 * tablet sets the statements two by two with the kind above; phones one
 * under another.
 */
type Row = { kind: string; entry: string };

export function Standing({ className }: { className?: string }) {
  const t = useTranslations("standing");
  const rows = t.raw("rows") as Row[];
  return (
    <ul className={cn("grid gap-7 md:grid-cols-2 md:gap-x-8 lg:grid-cols-1", className)}>
      {rows.map((row, index) => (
        <li key={`${row.kind}-${index}`} className="flex flex-col gap-1.5 lg:flex-row lg:gap-6">
          <span className="t-fine shrink-0 text-ink-muted lg:w-[120px] lg:pt-[7px]">{row.kind}</span>
          <span className="t-h4 min-w-0 flex-1 text-ink">{row.entry}</span>
        </li>
      ))}
    </ul>
  );
}
