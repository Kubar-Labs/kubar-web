import { ButtonLink } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";

/*
 * Page hero (Figma C4 91:329): the opening of every page but Home. The
 * kicker in Mono/Label (it names who the page is for), the h1 in
 * Serif/Display across ten columns, the sub in muted Body large across six,
 * then the page's actions: a filled button and a link. No status line.
 * `children` sits under the actions (How it works sets its own routes there).
 */
type PageHeroProps = {
  kicker?: string;
  headline: React.ReactNode;
  sub?: React.ReactNode;
  button?: { label: string; href: string };
  link?: { label: string; href: string };
  children?: React.ReactNode;
};

export function PageHero({ kicker, headline, sub, button, link, children }: PageHeroProps) {
  return (
    <section className="border-b border-rule-strong">
      <div className="page-container pt-8 pb-12 lg:pt-16 lg:pb-[72px]">
        <div className="flex flex-col lg:max-w-[1063px]">
          <div className="flex flex-col gap-5">
            {kicker ? <p className="t-label text-ink-muted">{kicker}</p> : null}
            <h1 className="t-display text-ink">{headline}</h1>
          </div>
          {sub ? <p className="t-body-lg pt-8 text-ink-muted lg:max-w-[628px]">{sub}</p> : null}
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
        </div>
      </div>
    </section>
  );
}
