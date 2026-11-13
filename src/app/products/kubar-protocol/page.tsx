import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { createPageMetadata } from "@/app/page-metadata";
import { NextStep, Questions } from "@/components/blocks/Closing";
import { PageHero } from "@/components/blocks/PageHero";
import { Section, SectionHead } from "@/components/blocks/Section";
import { EvidenceSources } from "@/components/protocol/EvidenceSources";
import { MoneyPath } from "@/components/protocol/MoneyPath";
import { MoneyTimeline, type TimelineCopy } from "@/components/protocol/MoneyTimeline";
import { ProgrammeSteps, type Step } from "@/components/protocol/ProgrammeSteps";
import { VenueRegister } from "@/components/protocol/VenueRegister";
import { Register } from "@/components/registers/Register";
import { Footnote, FootnoteMarker } from "@/components/ui/Footnote";
import { Illustrative } from "@/components/ui/Illustrative";
import { TextLink } from "@/components/ui/TextLink";

/* Kubar Protocol (Figma 167:6 at 1440, 169:1931 at 768, 168:684 at 390). */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("kubarProtocol.meta");
  return createPageMetadata({ title: t("title"), description: t("description"), path: "/products/kubar-protocol" });
}

const CONTACT = "/contact?intent=institution";

/** Puts footnote marker ¹ where a copy string carries <marker></marker>. */
function withMarker(text: string, marker: React.ReactNode) {
  const [before, after] = text.split("<marker></marker>");
  return after === undefined ? text : <>{before}{marker}{after}</>;
}

export default function KubarProtocol() {
  const t = useTranslations("kubarProtocol");
  const footnotes = useTranslations("footnotes");
  const stepColumns = t.raw("programme.columns") as { no: string; step: string; who: string };

  return (
    <>
      <PageHero
        kicker={t("hero.kicker")}
        headline={t("hero.headline")}
        sub={t("hero.sub")}
        button={{ label: t("hero.button"), href: CONTACT }}
        link={{ label: t("hero.link"), href: "/how-it-works" }}
      />

      <Section labelledBy="buy-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="buy-heading" heading={t("whatYouBuy.heading")} layout="wide" />
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-6">
          <div className="lg:w-[519px] lg:shrink-0">
            <Register
              first="label"
              caption={
                <span className="flex items-center gap-3">
                  <span className="t-tag text-ink-muted">{t("whatYouBuy.title")}</span>
                  <Illustrative align="start" />
                </span>
              }
              columns={[t("whatYouBuy.columns.field"), t("whatYouBuy.columns.entry")]}
              widths={[174, 345]}
              rows={t.raw("whatYouBuy.rows") as string[][]}
            />
            <p className="t-fine pt-3 text-ink-muted">{t("whatYouBuy.under")}</p>
          </div>
          <MoneyTimeline copy={t.raw("timeline") as TimelineCopy} className="min-w-0 lg:shrink-0" />
        </div>
      </Section>

      <Section labelledBy="runs-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="runs-heading" heading={t("programme.heading")} layout="wide" />
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-20">
          <div className="flex flex-col items-start gap-8 lg:w-[440px] lg:shrink-0">
            <ProgrammeSteps heading={t("programme.setUp")} steps={t.raw("programme.setUpSteps") as Step[]} columns={stepColumns} close />
            <TextLink href="/how-it-works" kind="arrow">{t("programme.link")}</TextLink>
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <ProgrammeSteps
              heading={t("programme.each")}
              steps={t.raw("programme.eachSteps") as Step[]}
              columns={stepColumns}
              note={{ after: t("programme.noteAfter"), text: t("programme.note") }}
            />
            <div className="flex flex-col items-start gap-2 pt-6">
              <p className="t-code text-ink-muted">{t("programme.refs")}</p>
              <p className="t-body-sm text-ink-muted">{t("programme.refsLine")}</p>
              <Illustrative align="start" />
            </div>
          </div>
        </div>
      </Section>

      <Section labelledBy="evidence-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="evidence-heading" heading={t("evidence.heading")} lead={t("evidence.lead")} />
        <div className="flex flex-col gap-12 lg:max-w-[1062px]">
          <EvidenceSources
            elements={t.raw("evidence.elements") as { element: string; from: string }[]}
            from={(source) => t("evidence.from", { source })}
            record={t("evidence.record")}
            readers={t.raw("evidence.readers") as string[]}
            alt={t("evidence.alt")}
          />
          <Register
            columns={t.raw("evidence.columns") as string[]}
            widths={[326, 326, 410]}
            rows={t.raw("evidence.rows") as string[][]}
            stackLabels
          />
          <div className="flex flex-col gap-3 lg:max-w-[628px]">
            {(t.raw("evidence.after") as string[]).map((line) => (
              <p key={line} className="t-body-sm text-ink">{line}</p>
            ))}
          </div>
        </div>
      </Section>

      <Section labelledBy="insurance-heading">
        <SectionHead id="insurance-heading" heading={t("insurance.heading")} lead={t("insurance.lead")} />
      </Section>

      <Section labelledBy="payment-heading" className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
        <SectionHead id="payment-heading" heading={t("payment.heading")} layout="stacked" />
        <MoneyPath
          className="min-w-0 flex-1"
          parties={t.raw("payment.parties") as string[]}
          payments={t.raw("payment.payments") as string[]}
          kubarNote={t("payment.kubarNote")}
          under={t("payment.under")}
          columns={t.raw("payment.columns") as { payment: string; from: string; to: string }}
          alt={t("payment.alt")}
        />
      </Section>

      <Section labelledBy="loss-heading">
        <SectionHead id="loss-heading" heading={t("lossHistory.heading")} lead={t("lossHistory.lead")} />
      </Section>

      <Section labelledBy="holds-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="holds-heading" heading={t("holds.heading")} layout="wide" />
        <Register
          className="lg:max-w-[1062px]"
          columns={t.raw("holds.columns") as string[]}
          widths={[326, 326, 410]}
          rows={t.raw("holds.rows") as string[][]}
          stackLabels
        />
      </Section>

      <Section labelledBy="questions-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="questions-heading" heading={t("questions.heading")} layout="wide" />
        <Questions items={t.raw("questions.items") as { q: string; a: string }[]} />
      </Section>

      <Section labelledBy="fit-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="fit-heading" heading={t("fit.heading")} layout="wide" />
        <Register
          columns={t.raw("fit.columns") as string[]}
          widths={[434, 846]}
          rows={(t.raw("fit.rows") as string[][]).map(([institution, role]) => [
            institution,
            withMarker(role, <FootnoteMarker n={1} target="fn-1" refId="fnref-1-fit" />),
          ])}
        />
      </Section>

      <Section labelledBy="programme1-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="programme1-heading" heading={t("programme1.heading")} layout="wide" />
        <Register
          className="lg:max-w-[845px]"
          first="label"
          columns={t.raw("programme1.columns") as string[]}
          widths={[217, 628]}
          rows={t.raw("programme1.rows") as string[][]}
        />
      </Section>

      <Section labelledBy="venue-heading" className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
        <SectionHead id="venue-heading" heading={t("venue.heading")} layout="stacked" />
        <div className="flex min-w-0 flex-1 flex-col gap-12">
          <VenueRegister
            sentence={t.rich("venue.sentence", {
              marker: () => <FootnoteMarker n={1} target="fn-1" refId="fnref-1" />,
            })}
            planned={t("venue.planned")}
            things={t.raw("venue.things") as string[]}
            under={t("venue.under")}
          />
          <Footnote n={1} id="fn-1" backTo="fnref-1">{footnotes("status")}</Footnote>
        </div>
      </Section>

      <Section labelledBy="next-heading">
        <NextStep
          id="next-heading"
          heading={t("next.heading")}
          body={t("next.body")}
          button={{ label: t("next.button"), href: CONTACT }}
          email={{ lead: t("next.orEmail"), address: t("next.email") }}
        />
      </Section>
    </>
  );
}
