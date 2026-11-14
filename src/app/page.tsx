import { useTranslations } from "next-intl";
import { Band } from "@/components/blocks/Band";
import { ScaleCard, type Figure } from "@/components/blocks/ScaleCard";
import { ExchangeColumns, type ComparisonRow } from "@/components/blocks/Foundations";
import { IsoFoundations, type Foundation } from "@/components/blocks/IsoFoundations";
import { PeopleRow, type Person } from "@/components/blocks/People";
import { Section, SectionHead } from "@/components/blocks/Section";
import { RouteCards, type HomeRoute } from "@/components/blocks/RouteCards";
import { PartyMap, type Party } from "@/components/map/PartyMap";
import { Story } from "@/components/story/Story";
import { Ledger } from "@/components/registers/Ledger";
import { FinanceProgrammes, TechnologyProgrammes } from "@/components/registers/Programmes";
import { Record } from "@/components/registers/Record";
import { RouteRows, type Route } from "@/components/registers/RouteRows";
import { Standing } from "@/components/registers/Standing";
import { Footnote, FootnoteMarker } from "@/components/ui/Footnote";
import { FootnoteDisclosure } from "@/components/ui/FootnoteDisclosure";
import { TextLink } from "@/components/ui/TextLink";

/*
 * Home (Figma 160:6 at 1440, 166:3363 at 768, 162:1295 at 390): the
 * reference page. Sections are separated by space; the band is the one
 * petrol section. Footnote ¹ (the status line) appears once, under
 * Foundations first; every marker ¹ on the page links to it, the hero's
 * included (REDRAW-2026-11-14.md, section 9.6).
 */
const FN_STATUS = "fn-1";

export default function Home() {
  const t = useTranslations("home");
  const footnotes = useTranslations("footnotes");
  const routes = t.raw("routes") as Route[];

  return (
    <>
      {/* Hero. Below 1200 (phones, tablets, an iPad in landscape; Figma
          162:1311 at 390, 166:3365 at 768) the record sits directly after
          the display, and the page order is the screen order: display,
          record, subline, routes, anchor, 24 px apart. From 1200 up, one
          grid: the display in column 1, row 1; the routes in column 1, row 2
          at its top; the record in column 2 across both rows (rows auto 1fr,
          48 px apart; 36 px between the columns); the subline and the anchor
          hidden. */}
      <section>
        <div className="page-container flex flex-col gap-6 pt-8 pb-12 lg:grid lg:grid-cols-[578px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-9 lg:gap-y-12 lg:pt-16 lg:pb-[72px]">
          <h1 className="t-display text-ink lg:col-start-1 lg:row-start-1">
            {t.rich("display", {
              marker: () => <FootnoteMarker n={1} target={FN_STATUS} refId="fnref-1" />,
              nb: (chunks) => <span className="whitespace-nowrap">{chunks}</span>,
            })}
          </h1>
          <Record className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1" />
          <p className="t-body-lg text-ink-muted lg:hidden">{t("subline")}</p>
          <RouteRows routes={routes} className="lg:col-start-1 lg:row-start-2" />
          <TextLink href="#one-receivable" kind="anchor" className="self-start lg:hidden">
            {t("followAnchor")}
          </TextLink>
        </div>
      </section>

      {/* The gap (Figma 160:63): heading and lead across the top, then the
          raised scale card, then the two footnotes (² behind a disclosure). */}
      <Section labelledBy="gap-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="gap-heading" heading={t("gap.heading")} lead={t("gap.lead")} />
        <div className="flex min-w-0 flex-col gap-10 lg:gap-16">
          <ScaleCard
            figures={t.raw("gap.figures") as [Figure, Figure]}
            scaleNote={t("gap.scaleNote")}
            scaleAlt={t("gap.scaleAlt")}
            footnoteId={(n) => ({ target: `fn-${n}`, refId: `fnref-${n}` })}
          />
          <div className="flex flex-col gap-4 lg:max-w-[628px]">
            <FootnoteDisclosure summary={t("gap.estimateLink")}>
              <Footnote n={2} id="fn-2" backTo="fnref-2">{t("gap.footnote2")}</Footnote>
            </FootnoteDisclosure>
            <Footnote n={3} id="fn-3" backTo="fnref-3">{t("gap.footnote3")}</Footnote>
          </div>
        </div>
      </Section>

      {/* Follow one receivable: the pinned story at every width (REDRAW
          section 3a); the ledger with reduced motion or on a very short screen. */}
      <Section id="one-receivable" labelledBy="one-receivable-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="one-receivable-heading" heading={t("oneReceivable.heading")} layout="wide" />
        <Story skipTo="closing-line" footnote={{ target: FN_STATUS, refId: "fnref-1-story" }}>
          <Ledger footnote={{ target: FN_STATUS, refId: "fnref-1-ledger" }} />
        </Story>
      </Section>

      <Band id="closing-line" line={t("band.line")} link={{ label: t("band.link"), href: "/how-it-works" }} />

      <Section labelledBy="foundations-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="foundations-heading" heading={t("foundations.heading")} lead={t("foundations.lead")} />
        <ExchangeColumns
          exchanges={t.raw("foundations.exchanges") as string[]}
          rows={t.raw("foundations.rows") as ComparisonRow[]}
          footnote={(suffix) => ({ target: FN_STATUS, refId: `fnref-1-${suffix}` })}
        />
        <IsoFoundations
          id="home-foundations"
          foundations={t.raw("foundations.slabs") as Foundation[]}
          footnote={(suffix) => ({ target: FN_STATUS, refId: `fnref-1-${suffix}` })}
        />
        <Footnote n={1} id={FN_STATUS} backTo="fnref-1" className="lg:max-w-[628px]">
          {footnotes("status")}
        </Footnote>
      </Section>

      <Section labelledBy="who-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="who-heading" heading={t("whoTakesPart.heading")} lead={t("whoTakesPart.lead")} />
        <PartyMap
          parties={t.raw("whoTakesPart.rows") as Party[]}
          legend={t.raw("whoTakesPart.legend") as { money: string; data: string }}
        />
      </Section>

      <Section labelledBy="standing-heading" className="flex flex-col gap-10 lg:gap-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
          <SectionHead id="standing-heading" heading={t("standing.heading")} layout="stacked" />
          <Standing className="min-w-0 flex-1" />
        </div>
        <FinanceProgrammes />
      </Section>

      <Section labelledBy="people-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="people-heading" heading={t("people.heading")} layout="wide" />
        <PeopleRow
          people={t.raw("people.people") as Person[]}
          linkLabel={(name) => t("people.linkedinLabel", { name })}
        />
        <TextLink href="/about#team" kind="arrow" size="large" className="self-start">
          {t("people.link")}
        </TextLink>
      </Section>

      <Section labelledBy="contact-heading" className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
        <SectionHead id="contact-heading" heading={t("contact.heading")} layout="stacked" />
        <RouteCards className="min-w-0 flex-1" routes={t.raw("contact.rows") as HomeRoute[]} />
      </Section>

      <Section>
        <TechnologyProgrammes />
      </Section>
    </>
  );
}
