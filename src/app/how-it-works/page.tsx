import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { createPageMetadata } from "@/app/page-metadata";
import { PageHero } from "@/components/blocks/PageHero";
import { OnThisPage, type IndexItem } from "@/components/layout/OnThisPage";
import { Section, SectionHead } from "@/components/blocks/Section";
import { IsoEvidence, type EvidenceCopy } from "@/components/how/IsoEvidence";
import { StoryStack, StoryStackAfter } from "@/components/how/StoryStack";
import { IsoSteps } from "@/components/how/IsoSteps";
import { SignsMap, type SignsMapCopy } from "@/components/how/SignsMap";
import { Terms } from "@/components/how/Terms";
import { UnpaidFlow, type UnpaidStep } from "@/components/how/UnpaidFlow";
import { MoneyPath } from "@/components/protocol/MoneyPath";
import { Ledger } from "@/components/registers/Ledger";
import { Register } from "@/components/registers/Register";
import { Story, type LedgerState } from "@/components/story/Story";
import { Footnote, FootnoteMarker } from "@/components/ui/Footnote";
import { TextLink } from "@/components/ui/TextLink";

/*
 * How it works (Figma 172:6 at 1440, 172:1770 at 768, 172:760 at 390;
 * REDRAW-2026-11-14.md, section 5). The hero beside its eight isometric
 * steps; the rail as the pinned story at every width (section 3a), told on
 * the evidence stack, whose documents land state by state (section 13 A);
 * "If a buyer doesn't pay" as a flow with a fork; the signs map. No Illustrative tag (15 Nov): the lead says
 * "illustrative" in words. From 1200 up the page keeps its 1440
 * composition, the drawings taking their column's width (section 11).
 */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("howItWorks.meta");
  return createPageMetadata({ title: t("title"), description: t("description"), path: "/how-it-works" });
}

const FN_STATUS = "fn-1";

export default function HowItWorks() {
  const t = useTranslations("howItWorks");
  const footnotes = useTranslations("footnotes");
  const common = useTranslations("common");
  const states = t.raw("rail.states") as LedgerState[];
  const evidence = t.raw("evidence") as EvidenceCopy;
  const routes = t.raw("next.routes") as { tag: string; label: string; href: string }[];

  return (
    <>
      <PageHero
        headline={t("hero.headline")}
        sub={t("hero.sub")}
        asidePlacement="beside"
        besideWidths={[660, 560]}
        // Below desktop the steps sit where the 768 and 390 frames draw them, under the routes.
        asideClassName="pt-[52px] md:pt-[76px] lg:pt-0"
        aside={<IsoSteps className="max-lg:translate-x-[2.857%]" />}
      >
        <div className="flex flex-col items-start gap-4 pt-8 lg:flex-row lg:items-center lg:gap-8">
          <TextLink href="/products/kubar-protocol" kind="arrow" size="large">{t("hero.institutions")}</TextLink>
          <TextLink href="/products/navdhan-sdk" kind="arrow" size="large">{t("hero.platforms")}</TextLink>
        </div>
      </PageHero>
      <div className="page-container">
        <OnThisPage label={common("onThisPage")} items={t.raw("index") as IndexItem[]} />
      </div>

      {/* The rail: the pinned story at every width (REDRAW section 3a); the
          ledger with reduced motion or on a very short screen. */}
      <Section labelledBy="rail-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="rail-heading" heading={t("rail.heading")} layout="wide" />
        <Story
          variant="howItWorks"
          states={states}
          closing={t("rail.closing")}
          skipTo="money"
          footnote={{ target: FN_STATUS, refId: "fnref-1-story" }}
          drawing={<StoryStack copy={evidence} />}
          after={<StoryStackAfter copy={evidence} />}
        >
          {/* With reduced motion or on a short screen: the ledger, then the complete stack. */}
          <div className="flex flex-col gap-6">
            <Ledger states={states} footnote={{ target: FN_STATUS, refId: "fnref-1-ledger" }} />
            <p className="t-body-sm text-ink">{t("rail.closing")}</p>
            <IsoEvidence className="pt-10 lg:max-w-[800px]" copy={evidence} />
          </div>
        </Story>
        <Footnote n={1} id={FN_STATUS} backTo="fnref-1-ledger" className="lg:max-w-[628px]">
          {footnotes("status")}
        </Footnote>
      </Section>

      <Section id="money" labelledBy="money-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="money-heading" heading={t("money.heading")} layout="wide" />
        <MoneyPath
          wide
          parties={t.raw("money.parties") as string[]}
          payments={t.raw("money.payments") as string[]}
          routes={t.raw("money.routes") as [string, string][]}
          kubarNote={t("money.kubarNote")}
          under={t("money.under")}
          columns={t.raw("money.columns") as { payment: string; from: string; to: string }}
          alt={t("money.alt")}
        />
      </Section>

      <Section labelledBy="unpaid-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="unpaid-heading" heading={t("unpaid.heading")} layout="wide" />
        <div className="flex flex-col gap-10 lg:gap-8">
          <UnpaidFlow steps={t.raw("unpaid.rows") as UnpaidStep[]} none={t("unpaid.none")} />
          <p className="t-body-sm text-ink-muted max-lg:max-w-(--measure) lg:max-w-[628px]">{t("unpaid.note")}</p>
        </div>
      </Section>

      <Section labelledBy="who-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="who-heading" heading={t("who.heading")} layout="wide" />
        <div className="flex flex-col items-start gap-8 lg:gap-16">
          {/* From 1200 up the map shows; the register stays as a table for screen readers at every
              width, and is what tablets and phones show. */}
          <SignsMap className="hidden w-full lg:block" rows={t.raw("who.rows") as string[][]} copy={t.raw("who.map") as SignsMapCopy} />
          <Register
            className="w-full lg:sr-only"
            columns={t.raw("who.columns") as string[]}
            widths={[326, 326, 410]}
            rows={t.raw("who.rows") as string[][]}
            stackLabels
          />
          <TextLink href="/products/kubar-protocol#who-holds-what" kind="arrow">{t("who.link")}</TextLink>
        </div>
      </Section>

      <Section id="terms" labelledBy="terms-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="terms-heading" heading={t("terms.heading")} layout="wide" />
        <Terms
          className="lg:max-w-[954px]"
          rows={(t.raw("terms.rows") as [string, string][]).map(([term, meaning]) => {
            const [before, after] = meaning.split("<marker></marker>");
            return [
              term,
              after === undefined ? meaning : <>{before}<FootnoteMarker n={1} target={FN_STATUS} refId="fnref-1-terms" />{after}</>,
            ];
          })}
        />
      </Section>

      <Section>
        <h2 className="sr-only">{t("next.label")}</h2>
        <ul className="flex flex-col gap-8">
          {routes.map((route) => (
            <li key={route.href} className="flex flex-col items-start gap-2">
              <p className="t-fine text-ink-muted">{route.tag}</p>
              <TextLink href={route.href} kind="arrow" size="large">{route.label}</TextLink>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
