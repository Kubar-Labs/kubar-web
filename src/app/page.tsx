import { useTranslations } from "next-intl";
import { Band } from "@/components/blocks/Band";
import { FigurePair, type Figure } from "@/components/blocks/FigurePair";
import { ExchangeComparison, FoundationsStack, type ComparisonRow, type Slab } from "@/components/blocks/Foundations";
import { PeopleRow, type Person } from "@/components/blocks/People";
import { Section, SectionHead } from "@/components/blocks/Section";
import { ContactRoutes, type ContactRoute } from "@/components/registers/ContactRoutes";
import { WhoTakesPart, type PartyRow } from "@/components/registers/WhoTakesPart";
import { Story } from "@/components/story/Story";
import { Ledger } from "@/components/registers/Ledger";
import { FinanceProgrammes, TechnologyProgrammes } from "@/components/registers/Programmes";
import { Record } from "@/components/registers/Record";
import { RouteRows, type Route } from "@/components/registers/RouteRows";
import { Standing } from "@/components/registers/Standing";
import { Footnote, FootnoteMarker } from "@/components/ui/Footnote";
import { TextLink } from "@/components/ui/TextLink";

/*
 * Home (Figma 160:6 at 1440, 166:3363 at 768, 162:1295 at 390): the
 * reference page. Sections are joined by one hairline; the band is the one
 * petrol section. Footnote ¹ (the status line) sits under the hero and again
 * under Foundations first, as in the design.
 */
const FN_STATUS = "fn-1";

export default function Home() {
  const t = useTranslations("home");
  const footnotes = useTranslations("footnotes");
  const routes = t.raw("routes") as Route[];

  return (
    <>
      {/* Hero. Desktop: display and routes (600) beside the record, the
          footnote under both. Below desktop: display, subline, routes, the
          anchor, the footnote (on the first screen), then the record. */}
      <section className="border-b border-rule-strong">
        <div className="page-container flex flex-col gap-6 pt-8 pb-12 lg:grid lg:grid-cols-[600px_minmax(0,1fr)] lg:items-start lg:gap-x-20 lg:gap-y-[72px] lg:pt-16 lg:pb-[72px]">
          <div className="flex flex-col gap-6 lg:gap-12">
            <h1 className="t-display text-ink">
              {t.rich("display", {
                marker: () => <FootnoteMarker n={1} target={FN_STATUS} refId="fnref-1" />,
                nb: (chunks) => <span className="whitespace-nowrap">{chunks}</span>,
              })}
            </h1>
            <p className="t-body-lg text-ink-muted lg:hidden">{t("subline")}</p>
            <RouteRows routes={routes} />
            <TextLink href="#one-receivable" kind="anchor" className="self-start lg:hidden">
              {t("followAnchor")}
            </TextLink>
          </div>
          <Footnote n={1} id={FN_STATUS} backTo="fnref-1" className="lg:col-span-2 lg:row-start-2 lg:max-w-[628px]">
            {footnotes("status")}
          </Footnote>
          <Record className="min-w-0 lg:col-start-2 lg:row-start-1" />
        </div>
      </section>

      <Section labelledBy="gap-heading" className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
        <SectionHead id="gap-heading" heading={t("gap.heading")} lead={t("gap.lead")} layout="stacked" />
        <div className="flex min-w-0 flex-1 flex-col gap-10">
          <FigurePair
            figures={t.raw("gap.figures") as Figure[]}
            scaleNote={t("gap.scaleNote")}
            scaleAlt={t("gap.scaleAlt")}
            footnoteId={(n) => ({ target: `fn-${n}`, refId: `fnref-${n}` })}
          />
          <div className="flex flex-col gap-4 lg:max-w-[628px]">
            <Footnote n={2} id="fn-2" backTo="fnref-2">{t("gap.footnote2")}</Footnote>
            <Footnote n={3} id="fn-3" backTo="fnref-3">{t("gap.footnote3")}</Footnote>
          </div>
        </div>
      </Section>

      {/* Follow one receivable: the pinned story at desktop; the ledger
          below desktop, with reduced motion and for screen readers. */}
      <Section id="one-receivable" labelledBy="one-receivable-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="one-receivable-heading" heading={t("oneReceivable.heading")} layout="wide" />
        <Story skipTo="closing-line" footnote={{ target: FN_STATUS, refId: "fnref-1-story" }}>
          <Ledger footnote={{ target: FN_STATUS, refId: "fnref-1-ledger" }} />
        </Story>
      </Section>

      <Band id="closing-line" line={t("band.line")} link={{ label: t("band.link"), href: "/how-it-works" }} />

      <Section labelledBy="foundations-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="foundations-heading" heading={t("foundations.heading")} lead={t("foundations.lead")} />
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <ExchangeComparison
            className="lg:w-[628px] lg:shrink-0"
            exchangeHead={t("foundations.exchangeHead")}
            exchanges={t.raw("foundations.exchanges") as string[]}
            rows={t.raw("foundations.rows") as ComparisonRow[]}
            footnote={(suffix) => ({ target: "fn-1-foundations", refId: `fnref-1-${suffix}` })}
          />
          <FoundationsStack
            className="lg:w-[543px] lg:shrink-0"
            label={t("foundations.stackLabel")}
            slabs={t.raw("foundations.slabs") as Slab[]}
            footnote={(suffix) => ({ target: "fn-1-foundations", refId: `fnref-1-${suffix}` })}
          />
        </div>
        <Footnote n={1} id="fn-1-foundations" backTo="fnref-1-stack-where" className="lg:max-w-[628px]">
          {footnotes("status")}
        </Footnote>
      </Section>

      <Section labelledBy="who-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="who-heading" heading={t("whoTakesPart.heading")} lead={t("whoTakesPart.lead")} />
        <WhoTakesPart
          columns={t.raw("whoTakesPart.columns") as { party: string; role: string; more: string }}
          rows={t.raw("whoTakesPart.rows") as PartyRow[]}
        />
      </Section>

      <Section labelledBy="standing-heading" className="flex flex-col gap-10 lg:gap-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
          <SectionHead id="standing-heading" heading={t("standing.heading")} lead={t("standing.lead")} layout="stacked" />
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
        <ContactRoutes
          className="min-w-0 flex-1"
          columns={t.raw("contact.columns") as { who: string; step: string }}
          rows={t.raw("contact.rows") as ContactRoute[]}
        />
      </Section>

      <Section>
        <TechnologyProgrammes />
      </Section>
    </>
  );
}
