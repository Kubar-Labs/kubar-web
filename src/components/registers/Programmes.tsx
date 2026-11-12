import { useTranslations } from "next-intl";
import { ProgrammeMark } from "@/components/registers/ProgrammeMark";
import { cn } from "@/lib/utils";

/*
 * Programme rows (Figma C4: Programme entry 165:3536, Technology entry 41:20).
 *
 * Finance and government: desktop two lists of three, each under a 2 px
 * strong rule, every entry a 176 × 64 mark, the name (Sans/UI) and the kind
 * (Mono/Tag) with a hairline below. Below desktop one list of six: the mark
 * at 120 × 44, the name over the kind.
 *
 * Technology: the mark with its name centred under it (Sans/Fine, at most
 * 160 wide); seven across at desktop, two per row below.
 */
type FinanceEntry = { id: string; name: string; kind: string };
type TechEntry = { id: string; name: string };

export function FinanceProgrammes({ className }: { className?: string }) {
  const t = useTranslations("programmes");
  const entries = t.raw("finance") as FinanceEntry[];
  const lists = [entries.slice(0, 3), entries.slice(3)];
  return (
    <div className={cn("flex flex-col lg:flex-row lg:gap-6", className)}>
      {lists.map((list, listIndex) => (
        <ul
          key={listIndex}
          className={cn("flex-1 lg:border-t-2 lg:border-rule-strong", listIndex === 0 && "max-lg:border-t-2 max-lg:border-rule-strong")}
        >
          {list.map((entry) => (
            <li key={entry.id} className="flex items-center gap-4 border-b border-rule py-3 lg:gap-6">
              <ProgrammeMark id={entry.id} name={entry.name} className="lg:hidden" scale={120 / 176} />
              <ProgrammeMark id={entry.id} name={entry.name} className="hidden lg:block" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5 lg:flex-row lg:items-center lg:gap-6">
                <span className="t-ui flex-1 text-ink">{entry.name}</span>
                <span className="t-tag whitespace-nowrap text-ink-muted">{entry.kind}</span>
              </span>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export function TechnologyProgrammes({ className }: { className?: string }) {
  const t = useTranslations("programmes");
  const entries = t.raw("technology") as TechEntry[];
  return (
    <div className={cn("flex flex-col gap-8 lg:gap-10", className)}>
      <p className="t-label text-ink-muted">{t("technologyLabel")}</p>
      <ul className="grid grid-cols-[repeat(2,minmax(0,167px))] gap-4 md:grid-cols-[repeat(auto-fill,167px)] lg:grid-cols-[repeat(7,176px)] lg:gap-x-2 lg:gap-y-8">
        {entries.map((entry) => (
          <li key={entry.id} className="flex flex-col items-center gap-2">
            <ProgrammeMark id={entry.id} name={entry.name} className="max-lg:w-full!" />
            <span className="t-fine max-w-40 text-center text-ink">{entry.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
