import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { createPageMetadata } from "@/app/page-metadata";
import { Band } from "@/components/blocks/Band";
import { ThreeZones, type ZonesCopy } from "@/components/about/ThreeZones";
import { IsoFoundations, type Foundation } from "@/components/blocks/IsoFoundations";
import { PageHero } from "@/components/blocks/PageHero";
import { PeopleCards, type FullPerson } from "@/components/blocks/People";
import { Section, SectionHead } from "@/components/blocks/Section";
import { FinanceProgrammes, TechnologyProgrammes } from "@/components/registers/Programmes";
import { Register } from "@/components/registers/Register";
import { Standing } from "@/components/registers/Standing";
import { Footnote, FootnoteMarker } from "@/components/ui/Footnote";
import { TextLink } from "@/components/ui/TextLink";

/*
 * About (Figma 173:6 at 1440; the 768 and 390 frames are not updated, so
 * below 1200 the page follows the existing rules). The team lives here
 * (#team). The "Where we are" section is removed and is not built.
 * "What we're building" is the isometric foundations from Home with
 * About's own sentences; "Why GIFT City" has the three-zones drawing beside
 * it. Footnote ¹ (the status line) shows once, under the hero; every other
 * marker links to it (REDRAW-2026-11-14.md, sections 5, 10 and 12).
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about.meta");
  return createPageMetadata({ title: t("title"), description: t("description"), path: "/about" });
}

// The company register's column heads named nothing and are cut (section 10); the table keeps them for screen readers.
const COMPANY_HEADS = ["Field", "Entry"];

export default function About() {
  const t = useTranslations("about");
  const footnotes = useTranslations("footnotes");
  const links = t.raw("next.links") as { label: string; href: string }[];

  return (
    <>
      <PageHero
        headline={t("hero.headline")}
        sub={t.rich("hero.sub", { marker: () => <FootnoteMarker n={1} target="fn-1" refId="fnref-1" /> })}
      >
        <Footnote n={1} id="fn-1" backTo="fnref-1" className="mt-10 lg:mt-16 lg:max-w-[628px]">
          {footnotes("status")}
        </Footnote>
      </PageHero>

      <Section labelledBy="order-heading" className="flex flex-col items-start gap-10 lg:gap-16">
        <SectionHead id="order-heading" heading={t("order.heading")} layout="wide" />
        {/* No H3 over the blocks (section 10); the venue carries "Planned" as its state word. */}
        <IsoFoundations
          id="about-foundations"
          plannedStyle="state"
          className="w-full"
          foundations={t.raw("order.slabs") as Foundation[]}
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
          <p className="t-body-sm pt-3 text-ink-muted">{t("team.advisers.note")}</p>
        </div>
      </Section>

      <Section labelledBy="standing-heading" className="flex flex-col gap-10 lg:gap-16">
        {/* As on Home: four statements beside the heading, no lead and no kind labels (section 10). */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
          <SectionHead id="standing-heading" heading={t("standing.heading")} layout="stacked" />
          <Standing className="min-w-0 flex-1" />
        </div>
        <FinanceProgrammes />
        <TechnologyProgrammes />
      </Section>

      {/* Why GIFT City: the words beside the three zones. Its marker links to the footnote under the hero. */}
      <Section labelledBy="gift-heading" className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-10 min-[1366px]:gap-20">
        <SectionHead
          id="gift-heading"
          layout="stacked"
          className="lg:w-[clamp(340px,calc(100%-760px),400px)]"
          heading={t("gift.heading")}
          lead={t.rich("gift.lead", { marker: () => <FootnoteMarker n={1} target="fn-1" refId="fnref-1-gift" /> })}
        />
        <ThreeZones className="min-w-0 flex-1 lg:pt-2" copy={t.raw("gift.zones") as ZonesCopy} />
      </Section>

      <Band ground="paper" line={t("band.line")} />

      <Section labelledBy="company-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="company-heading" heading={t("company.heading")} layout="wide" />
        <Register
          className="lg:max-w-[845px]"
          first="label"
          hideHeads
          columns={COMPANY_HEADS}
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
