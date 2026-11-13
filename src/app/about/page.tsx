import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { createPageMetadata } from "@/app/page-metadata";
import { Band } from "@/components/blocks/Band";
import { FoundationsStack, type Slab } from "@/components/blocks/Foundations";
import { PageHero } from "@/components/blocks/PageHero";
import { PeopleCards, type FullPerson } from "@/components/blocks/People";
import { Section, SectionHead } from "@/components/blocks/Section";
import { FinanceProgrammes, TechnologyProgrammes } from "@/components/registers/Programmes";
import { Register } from "@/components/registers/Register";
import { Standing } from "@/components/registers/Standing";
import { Footnote, FootnoteMarker } from "@/components/ui/Footnote";
import { TextLink } from "@/components/ui/TextLink";

/*
 * About (Figma 173:6 at 1440). The team lives here (#team). The "Where we
 * are" section is removed and is not built. Footnote ¹ (the status line)
 * sits under the hero and again beside Why GIFT City, as in the design.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about.meta");
  return createPageMetadata({ title: t("title"), description: t("description"), path: "/about" });
}

export default function About() {
  const t = useTranslations("about");
  const footnotes = useTranslations("footnotes");
  const links = t.raw("next.links") as { label: string; href: string }[];

  return (
    <>
      <PageHero
        kicker={t("hero.kicker")}
        headline={t("hero.headline")}
        sub={t.rich("hero.sub", { marker: () => <FootnoteMarker n={1} target="fn-1" refId="fnref-1" /> })}
      >
        <Footnote n={1} id="fn-1" backTo="fnref-1" className="mt-10 lg:mt-16 lg:max-w-[628px]">
          {footnotes("status")}
        </Footnote>
      </PageHero>

      <Section labelledBy="order-heading" className="flex flex-col items-start gap-10 lg:gap-16">
        <SectionHead id="order-heading" heading={t("order.heading")} layout="wide" />
        <FoundationsStack
          statusOnly
          className="w-full lg:w-[543px]"
          label={t("order.label")}
          slabs={t.raw("order.slabs") as Slab[]}
          footnote={(suffix) => ({ target: "fn-1", refId: `fnref-1-${suffix}` })}
        />
        <TextLink href="/how-it-works" kind="arrow">{t("order.link")}</TextLink>
      </Section>

      <Section id="team" labelledBy="team-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="team-heading" heading={t("team.heading")} layout="wide" />
        <PeopleCards
          people={t.raw("team.people") as FullPerson[]}
          linkedin={t("team.linkedin")}
          linkLabel={(name) => t("team.linkedinLabel", { name })}
        />
        <div className="flex flex-col lg:max-w-[954px]">
          <h3 className="t-h4 pb-4 text-ink">{t("team.advisers.heading")}</h3>
          <Register
            className="border-t-2 border-rule-strong max-lg:border-t-0"
            hideHeads
            columns={t.raw("team.advisers.columns") as string[]}
            widths={[326, 628]}
            rows={(t.raw("team.advisers.rows") as string[][]).map(([name, line]) => [
              name,
              <span key={name} className="text-ink-muted">{line}</span>,
            ])}
          />
          <p className="t-fine pt-3 text-ink-muted">{t("team.advisers.note")}</p>
        </div>
      </Section>

      <Section labelledBy="standing-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="standing-heading" heading={t("standing.heading")} lead={t("standing.lead")} />
        <Standing narrowKind className="lg:max-w-[845px]" />
        <FinanceProgrammes />
        <TechnologyProgrammes />
      </Section>

      <Section labelledBy="gift-heading" className="flex flex-col gap-10">
        <SectionHead
          id="gift-heading"
          heading={t("gift.heading")}
          lead={t.rich("gift.lead", { marker: () => <FootnoteMarker n={1} target="fn-1-gift" refId="fnref-1-gift" /> })}
        />
        <Footnote n={1} id="fn-1-gift" backTo="fnref-1-gift" className="lg:ml-[480px] lg:max-w-[628px]">
          {footnotes("status")}
        </Footnote>
      </Section>

      <Band ground="paper" line={t("band.line")} />

      <Section labelledBy="company-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="company-heading" heading={t("company.heading")} layout="wide" />
        <Register
          className="lg:max-w-[845px]"
          first="label"
          columns={t.raw("company.columns") as string[]}
          widths={[217, 628]}
          rows={t.raw("company.rows") as string[][]}
        />
      </Section>

      <Section labelledBy="next-heading" className="flex flex-col gap-8">
        <h2 id="next-heading" className="t-h2 text-ink">{t("next.heading")}</h2>
        <ul className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:gap-8">
          {links.map((link) => (
            <li key={link.href}>
              <TextLink href={link.href} kind="arrow" size="large">{link.label}</TextLink>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
