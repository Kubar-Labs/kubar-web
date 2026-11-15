import { useTranslations } from "next-intl";
import { ProgrammeMark } from "@/components/registers/ProgrammeMark";
import { cn } from "@/lib/utils";

/*
 * Programme rows (Figma: Programmes · strip 244:3298 in Home · 1440, 248:3551
 * at 768, 248:4034 at 390; Technology entry 41:20).
 *
 * Finance and government: the six marks in one row at desktop, each a
 * 176 × 64 mark with its name (Sans/UI) under it and no kind label
 * (REDRAW-2026-11-14.md, Home). Three to a row on tablet, two on phones with
 * the mark at 90%. No rules.
 *
 * Technology: the mark with its name centred under it (Sans/Fine, at most
 * 160 wide); seven across at desktop, two per row below.
 */
type FinanceEntry = { id: string; name: string };
type TechEntry = { id: string; name: string };

export function FinanceProgrammes({ className }: { className?: string }) {
  const t = useTranslations("programmes");
  const entries = t.raw("finance") as FinanceEntry[];
  return (
    <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3 lg:grid-cols-6 lg:gap-x-6", className)}>
      {entries.map((entry) => (
        <li key={entry.id} className="flex min-w-0 flex-col gap-2.5 lg:gap-3">
          <ProgrammeMark id={entry.id} name={entry.name} className="max-w-full md:hidden" scale={0.9} />
          <ProgrammeMark id={entry.id} name={entry.name} className="hidden max-w-full md:block" />
          <span className="t-ui text-ink">{entry.name}</span>
        </li>
      ))}
    </ul>
  );
}

export function TechnologyProgrammes({ className }: { className?: string }) {
  const t = useTranslations("programmes");
  const entries = t.raw("technology") as TechEntry[];
  return (
    <div className={cn("flex flex-col gap-8 lg:gap-10", className)}>
      <p className="t-fine text-ink-muted">{t("technologyLabel")}</p>
      <ul className="grid grid-cols-[repeat(2,minmax(0,167px))] gap-4 md:grid-cols-[repeat(auto-fill,167px)] lg:grid-cols-[repeat(7,minmax(0,176px))] lg:gap-x-2 lg:gap-y-8">
        {entries.map((entry) => (
          <li key={entry.id} className="flex min-w-0 flex-col items-center gap-2">
            <ProgrammeMark id={entry.id} name={entry.name} className="max-w-full max-lg:w-full!" />
            <span className="t-fine max-w-40 text-center text-ink">{entry.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
