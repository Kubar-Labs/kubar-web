import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { createPageMetadata } from "@/app/page-metadata";
import { PageHero } from "@/components/blocks/PageHero";
import { Section, SectionHead } from "@/components/blocks/Section";
import { EvidenceStack, type EvidenceStackCopy } from "@/components/how/EvidenceStack";
import { Terms } from "@/components/how/Terms";
import { UnpaidRegister, type UnpaidRow } from "@/components/how/UnpaidRegister";
import { MoneyPath } from "@/components/protocol/MoneyPath";
import { Ledger } from "@/components/registers/Ledger";
import { Register } from "@/components/registers/Register";
import { Story, type LedgerState } from "@/components/story/Story";
import { Footnote, FootnoteMarker } from "@/components/ui/Footnote";
import { Illustrative } from "@/components/ui/Illustrative";
import { TextLink } from "@/components/ui/TextLink";

/* How it works (Figma 172:6 at 1440, 172:760 at 390). */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("howItWorks.meta");
  return createPageMetadata({ title: t("title"), description: t("description"), path: "/how-it-works" });
}

const FN_STATUS = "fn-1";

export default function HowItWorks() {
  const t = useTranslations("howItWorks");
  const footnotes = useTranslations("footnotes");
  const states = t.raw("rail.states") as LedgerState[];
  const routes = t.raw("next.routes") as { tag: string; label: string; href: string }[];

  return (
    <>
      <PageHero kicker={t("hero.kicker")} headline={t("hero.headline")} sub={t("hero.sub")}>
        <Illustrative align="start" className="pt-4" />
        <div className="flex flex-col items-start gap-4 pt-6 lg:flex-row lg:items-center lg:gap-8">
          <TextLink href="/products/kubar-protocol" kind="arrow" size="large">{t("hero.institutions")}</TextLink>
          <TextLink href="/products/navdhan-sdk" kind="arrow" size="large">{t("hero.platforms")}</TextLink>
        </div>
      </PageHero>

      {/* The rail: the pinned story at desktop; the ledger below desktop,
          with reduced motion and for screen readers. */}
      <Section labelledBy="rail-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="rail-heading" heading={t("rail.heading")} layout="wide" />
        <Story variant="howItWorks" states={states} skipTo="evidence" footnote={{ target: FN_STATUS, refId: "fnref-1-story" }}>
          <div className="flex flex-col gap-6">
            <Ledger states={states} footnote={{ target: FN_STATUS, refId: "fnref-1-ledger" }} />
            <p className="t-body-sm text-ink">{t("rail.closing")}</p>
          </div>
        </Story>
        <Footnote n={1} id={FN_STATUS} backTo="fnref-1-ledger" className="lg:max-w-[628px]">
          {footnotes("status")}
        </Footnote>
      </Section>

      <Section id="evidence" labelledBy="evidence-heading" className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
        <SectionHead id="evidence-heading" heading={t("evidence.heading")} lead={t("evidence.lead")} layout="stacked" />
        <EvidenceStack
          className="min-w-0 flex-1"
          copy={t.raw("evidence") as EvidenceStackCopy}
          illustrative={<Illustrative className="max-lg:items-start max-lg:text-left" />}
        />
      </Section>

      <Section labelledBy="money-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="money-heading" heading={t("money.heading")} layout="wide" />
        <MoneyPath
          wide
          parties={t.raw("money.parties") as string[]}
          payments={t.raw("money.payments") as string[]}
          kubarNote={t("money.kubarNote")}
          under={t("money.under")}
          columns={t.raw("money.columns") as { payment: string; from: string; to: string }}
          alt={t("money.alt")}
        />
      </Section>

      <Section labelledBy="unpaid-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="unpaid-heading" heading={t("unpaid.heading")} lead={t("unpaid.lead")} />
        <div className="flex flex-col gap-6 lg:max-w-[1062px]">
          <UnpaidRegister
            title={t("unpaid.title")}
            columns={t.raw("unpaid.columns") as { no: string; party: string; step: string; branch: string }}
            rows={t.raw("unpaid.rows") as UnpaidRow[]}
            none={t("unpaid.none")}
          />
          <p className="t-body-sm text-ink-muted lg:max-w-[628px]">{t("unpaid.note")}</p>
        </div>
      </Section>

      <Section labelledBy="who-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="who-heading" heading={t("who.heading")} layout="wide" />
        <div className="flex flex-col items-start gap-8">
          <Register
            className="w-full lg:max-w-[1062px]"
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
          columns={t.raw("terms.columns") as string[]}
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
              <p className="t-tag text-ink-muted">{route.tag}</p>
              <TextLink href={route.href} kind="arrow" size="large">{route.label}</TextLink>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
