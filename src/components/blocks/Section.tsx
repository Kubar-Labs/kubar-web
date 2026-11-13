import { cn } from "@/lib/utils";

/*
 * Page anatomy after option B (HANDOFF section 4): sections are joined by one
 * hairline in --color-rule-strong, with --section-space above and below.
 * No section numbers and no label above a heading.
 *
 * Section head (Figma C4 91:288): at desktop the heading (400 wide) with its
 * lead beside it (680), 80 apart; "stacked" keeps the lead under the heading
 * for sections that put their whole body beside the head (400 + 800).
 * "wide" is a heading with no lead, up to 800. Below desktop everything stacks.
 */
type SectionProps = {
  id?: string;
  labelledBy?: string;
  className?: string;
  children: React.ReactNode;
};

export function Section({ id, labelledBy, className, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className="border-b border-rule-strong">
      <div className={cn("page-container py-(--section-space)", className)}>{children}</div>
    </section>
  );
}

type SectionHeadProps = {
  id?: string;
  heading: React.ReactNode;
  lead?: React.ReactNode;
  layout?: "beside" | "stacked" | "wide";
  className?: string;
};

export function SectionHead({ id, heading, lead, layout = "beside", className }: SectionHeadProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        layout === "beside" && "lg:flex-row lg:gap-20",
        layout === "stacked" && "lg:w-[400px] lg:shrink-0",
        className,
      )}
    >
      <h2
        id={id}
        className={cn("t-h2 text-ink", layout === "wide" ? "lg:max-w-[800px]" : layout === "beside" && "lg:w-[400px] lg:shrink-0")}
      >
        {heading}
      </h2>
      {lead ? (
        <p className={cn("t-body-lg text-ink-muted", layout === "beside" && "lg:max-w-[680px]")}>{lead}</p>
      ) : null}
    </div>
  );
}
