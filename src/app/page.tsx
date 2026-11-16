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
import { FinanceProgrammes } from "@/components/registers/Programmes";
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
      {/* Hero (Figma 160:52 at 1440, 166:3365 at 768, 162:1311 at 390). The page order is the
          screen order below 1024: headline, subline, record, routes, anchor.
          From 1328: two columns, the headline, the subline and the routes on the left (578), 48 px
          apart, and the record on the right beside all three. That needs 578 + 36 + 550 of content:
          the record's rows are one line each and start 356 px into it.
          From 1024 to 1327 two columns would break the headline over five lines or squeeze the
          rows, so the headline and the subline run across the top, and under them the routes sit
          left and the record right; the record's top sheet and first rows are on the first screen
          of an iPad in landscape.
          The "Follow one receivable" anchor shows below 1024 only, as on main. */}
      <section>
        <div className="page-container flex flex-col gap-6 pt-8 pb-12 lg:grid lg:grid-cols-[minmax(0,1fr)_560px] lg:items-start lg:gap-x-12 lg:gap-y-6 lg:pt-12 lg:pb-[72px] min-[1328px]:grid-cols-[578px_minmax(0,1fr)] min-[1328px]:grid-rows-[auto_auto_1fr] min-[1328px]:gap-x-9 min-[1328px]:gap-y-12 min-[1328px]:pt-16">
          <h1 className="t-display text-ink lg:col-span-2 min-[1328px]:col-span-1 min-[1328px]:col-start-1 min-[1328px]:row-start-1">
            {t.rich("display", {
              marker: () => <FootnoteMarker n={1} target={FN_STATUS} refId="fnref-1" />,
              nb: (chunks) => <span className="whitespace-nowrap">{chunks}</span>,
            })}
          </h1>
          <p className="t-body-lg text-ink-muted lg:col-span-2 lg:max-w-[760px] lg:pb-4 min-[1328px]:col-span-1 min-[1328px]:col-start-1 min-[1328px]:row-start-2 min-[1328px]:max-w-none min-[1328px]:pb-0">
            {t("subline")}
          </p>
          <Record className="min-w-0 lg:col-start-2 lg:row-start-3 min-[1328px]:row-span-3 min-[1328px]:row-start-1" />
          <RouteRows routes={routes} className="lg:col-start-1 lg:row-start-3" />
          <TextLink href="#one-receivable" kind="anchor" className="-mt-2 self-start md:mt-0 lg:hidden">
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
        <SectionHead id="one-receivable-heading" heading={t("oneReceivable.heading")} lead={t("oneReceivable.lead")} />
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
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12 xl:gap-20">
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

      <Section labelledBy="contact-heading" className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12 xl:gap-20">
        <SectionHead id="contact-heading" heading={t("contact.heading")} layout="stacked" />
        <RouteCards className="min-w-0 flex-1" routes={t.raw("contact.rows") as HomeRoute[]} />
      </Section>

    </>
  );
}
