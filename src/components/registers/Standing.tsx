import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/*
 * Standing (Figma 252:4140 in Home · 1440, 248:3536 at 768, 248:4017 at 390;
 * REDRAW-2026-11-14.md, Home): Kubar's sandbox entry, membership and awards
 * as four plain statements. No cards, no rules, and no kind labels (cut
 * after step 3, REDRAW section 10): each statement starts with its kind.
 * Desktop and phones list them one under another; tablet two by two.
 */
type Row = { entry: string };

export function Standing({ className }: { className?: string }) {
  const t = useTranslations("standing");
  const rows = t.raw("rows") as Row[];
  return (
    <ul className={cn("grid gap-7 md:grid-cols-2 md:gap-x-8 lg:grid-cols-1", className)}>
      {rows.map((row) => (
        <li key={row.entry} className="t-h4 text-ink">
          {row.entry}
        </li>
      ))}
    </ul>
  );
}
