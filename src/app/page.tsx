import { useTranslations } from "next-intl";
import { Section, SectionHead } from "@/components/blocks/Section";
import { Ledger } from "@/components/registers/Ledger";
import { FinanceProgrammes, TechnologyProgrammes } from "@/components/registers/Programmes";
import { Record } from "@/components/registers/Record";
import { RouteRows, type Route } from "@/components/registers/RouteRows";
import { Standing } from "@/components/registers/Standing";
import { Footnote, FootnoteMarker } from "@/components/ui/Footnote";
import { TextLink } from "@/components/ui/TextLink";

/*
 * Home (Figma 160:6 at 1440, 166:3363 at 768, 162:1295 at 390).
 * Build step 3, in progress: the hero, the ledger form of "Follow one
 * receivable", Standing and the technology programmes are built. The gap,
 * the pinned story (lanes and panel), the band, Foundations first, Who takes
 * part, People and Contact follow.
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

      {/* Follow one receivable. The ledger is the tablet, mobile and
          reduced-motion form; the desktop pinned story joins it next. */}
      <Section id="one-receivable" labelledBy="one-receivable-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="one-receivable-heading" heading={t("oneReceivable.heading")} layout="wide" />
        <Ledger footnote={{ target: FN_STATUS, refId: "fnref-1-ledger" }} />
      </Section>

      <Section labelledBy="standing-heading" className="flex flex-col gap-10 lg:gap-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
          <SectionHead id="standing-heading" heading={t("standing.heading")} lead={t("standing.lead")} layout="stacked" />
          <Standing className="min-w-0 flex-1" />
        </div>
        <FinanceProgrammes />
      </Section>

      <Section>
        <TechnologyProgrammes />
      </Section>
    </>
  );
}
