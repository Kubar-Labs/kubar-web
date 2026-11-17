import { ButtonLink } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { cn } from "@/lib/utils";

/*
 * Page hero (Figma C4 91:329): the opening of every page but Home. No
 * kicker line (removed 14 Nov). The h1 in Heading/Display across ten columns, the sub in muted Body large across six,
 * then the page's actions: a filled button and a link. No status line.
 * `children` sits under the actions (How it works sets its own routes there).
 *
 * "split" (About, Figma 334:2634): from 1024 the h1 on the left and the sub
 * with `children` (the footnote) on the right, 520 and 680 at 1440, 80 apart
 * (48 below 1200); below 1024 they stack as on every other page.
 */
type PageHeroProps = {
  headline: React.ReactNode;
  layout?: "stacked" | "split";
  sub?: React.ReactNode;
  button?: { label: string; href: string };
  link?: { label: string; href: string };
  children?: React.ReactNode;
  /** A drawing set beside the words at desktop (lower right) and under them below desktop. */
  aside?: React.ReactNode;
  /**
   * "beside": the words and the drawing side by side, centred on each other,
   * 60 apart (Kubar Protocol, Figma 167:52: 720 and 474; How it works,
   * 258:1827: 660 and 560); below desktop the drawing sits 40 under the
   * words, centred. Laptops narrower than the frame shrink both columns.
   */
  asidePlacement?: "lower-right" | "beside";
  /** "beside": the words' and the drawing's widths at 1440. */
  besideWidths?: [number, number];
  /** "beside": classes for the drawing's box (its spacing below desktop). */
  asideClassName?: string;
  /** A block under the words at the page's full width (NavDhan SDK: What you embed and the sketch). */
  below?: React.ReactNode;
};

export function PageHero({
  headline,
  layout = "stacked",
  sub,
  button,
  link,
  children,
  aside,
  asidePlacement = "lower-right",
  besideWidths = [720, 474],
  asideClassName,
  below,
}: PageHeroProps) {
  const words = (
    <>
      <h1 className="t-display text-ink">{headline}</h1>
      {sub ? <p className="t-body-lg pt-8 text-ink-muted max-lg:max-w-(--measure) lg:max-w-[628px]">{sub}</p> : null}
      {button || link ? (
        <div className="flex flex-col items-start gap-6 pt-8 lg:flex-row lg:items-center lg:gap-8">
          {button ? (
            <ButtonLink href={button.href} icon="arrow-right">
              {button.label}
            </ButtonLink>
          ) : null}
          {link ? (
            <TextLink href={link.href} kind="arrow">
              {link.label}
            </TextLink>
          ) : null}
        </div>
      ) : null}
      {children}
    </>
  );

  if (layout === "split") {
    return (
      <section>
        <div className="page-container flex flex-col pt-8 pb-12 lg:grid lg:grid-cols-[520fr_680fr] lg:items-start lg:gap-12 lg:pt-16 lg:pb-[72px] xl:gap-20">
          <h1 className="t-display text-ink">{headline}</h1>
          <div className="flex flex-col">
            {sub ? <p className="t-body-lg pt-8 text-ink-muted max-lg:max-w-(--measure) lg:pt-0">{sub}</p> : null}
            {children}
          </div>
        </div>
      </section>
    );
  }

  if (aside && asidePlacement === "beside") {
    return (
      <section>
        <div
          className="page-container flex flex-col gap-10 pt-8 pb-12 lg:flex-row lg:items-center lg:gap-[60px] lg:pt-16 lg:pb-[72px]"
          style={{ ["--hero-words" as string]: `${besideWidths[0]}px`, ["--hero-aside" as string]: `${besideWidths[1]}px` }}
        >
          <div className="flex flex-col lg:w-(--hero-words) lg:min-w-0 lg:shrink">{words}</div>
          <div className={cn("mx-auto w-full max-w-(--hero-aside) lg:mx-0 lg:min-w-0 lg:shrink lg:basis-(--hero-aside)", asideClassName)}>{aside}</div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className={cn("page-container relative pt-8 pb-12 lg:pt-16 lg:pb-[72px]", aside && "lg:min-h-[969px]")}>
        <div className="flex flex-col lg:max-w-[1063px]">{words}</div>
        {below ? <div className="pt-10 lg:pt-[52px]">{below}</div> : null}
        {aside ? <div className="pt-10 lg:absolute lg:top-[408px] lg:right-(--page-margin) lg:pt-0">{aside}</div> : null}
      </div>
    </section>
  );
}
