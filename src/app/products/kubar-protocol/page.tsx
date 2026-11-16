import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { createPageMetadata } from "@/app/page-metadata";
import { NextStep, Questions } from "@/components/blocks/Closing";
import { PageHero } from "@/components/blocks/PageHero";
import { WhereThisSits } from "@/components/blocks/WhereThisSits";
import { OnThisPage, type IndexItem } from "@/components/layout/OnThisPage";
import { Section, SectionHead } from "@/components/blocks/Section";
import { EvidenceSources } from "@/components/protocol/EvidenceSources";
import { MoneyPath } from "@/components/protocol/MoneyPath";
import { Corridor } from "@/components/protocol/Corridor";
import { HoldsCards } from "@/components/protocol/HoldsCards";
import { LimitDrawing } from "@/components/protocol/LimitDrawing";
import { MoneyTimeline, type TimelineCopy } from "@/components/protocol/MoneyTimeline";
import { ProgrammeRuns, type ProgrammeStep } from "@/components/protocol/ProgrammeRuns";
import { ReceivableSheet } from "@/components/protocol/ReceivableSheet";
import { BuyerLimit } from "@/components/protocol/BuyerLimit";
import { LossHistory, type LossHistoryCopy } from "@/components/protocol/LossHistory";
import { VenueRegister } from "@/components/protocol/VenueRegister";
import { Register } from "@/components/registers/Register";
import { Footnote, FootnoteMarker } from "@/components/ui/Footnote";

/*
 * Kubar Protocol (Figma 167:6 at 1440, 169:1931 at 768, 168:684 at 390;
 * REDRAW-2026-11-14.md, Kubar Protocol, and the copy changes of section 10).
 * No Illustrative tag (15 Nov): the receivable sheet says "An example" in
 * plain words where the example first shows a figure.
 */

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
  const common = useTranslations("common");
  const foundationNames = (useTranslations("home").raw("foundations.slabs") as { name: string }[]).map((slab) => slab.name);

  return (
    <>
      <PageHero
        headline={t("hero.headline")}
        sub={t("hero.sub")}
        button={{ label: t("hero.button"), href: CONTACT }}
        link={{ label: t("hero.link"), href: "/how-it-works" }}
        aside={<LimitDrawing className="block h-auto w-full" />}
        asidePlacement="beside"
      />
      {/* Where this sits, directly under the hero: the five foundations small, Standing buyers in
          petrol. Its venue's marker links to the footnote under the venue section. */}
      <WhereThisSits
        label={common("whereThisSits")}
        line={t("sits.line")}
        link={{ label: t("sits.link"), href: "/#one-receivable" }}
        foundations={foundationNames}
        current={3}
        footnote={{ target: "fn-1", refId: "fnref-1-sits" }}
      />
      <div className="page-container pt-10 lg:pt-12">
        <OnThisPage label={common("onThisPage")} items={t.raw("index") as IndexItem[]} />
      </div>

      <Section labelledBy="buy-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="buy-heading" heading={t("whatYouBuy.heading")} layout="wide" />
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-9 min-[1280px]:gap-6">
          <ReceivableSheet
            className="lg:w-[519px] lg:shrink-0"
            title={t("whatYouBuy.title")}
            example={t("whatYouBuy.example")}
            rows={t.raw("whatYouBuy.rows") as string[][]}
          />
          {/* Side by side from 1024 up. From 1280 the day-axis timeline takes the rest of the row (737 at
              1440, about 580 at 1280); from 1024 to 1279 the row holds the tablets' small timeline and its
              list instead, so the sheet never sits alone in a half-empty row. */}
          <MoneyTimeline copy={t.raw("timeline") as TimelineCopy} className="min-w-0 lg:flex-1 min-[1280px]:max-w-[737px]" />
        </div>
      </Section>

      <Section labelledBy="runs-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="runs-heading" heading={t("programme.heading")} layout="wide" />
        <ProgrammeRuns
          setUp={{ heading: t("programme.setUp"), steps: t.raw("programme.setUpSteps") as ProgrammeStep[] }}
          each={{ heading: t("programme.each"), steps: t.raw("programme.eachSteps") as ProgrammeStep[] }}
          link={{ label: t("programme.link"), href: "/how-it-works" }}
          note={t("programme.note")}
          noteAfter={t("programme.noteAfter")}
          refs={t("programme.refs")}
          refsLine={t("programme.refsLine")}
        />
      </Section>

      <Section labelledBy="evidence-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="evidence-heading" heading={t("evidence.heading")} lead={t("evidence.lead")} />
        <div className="flex flex-col gap-12 lg:max-w-[1062px]">
          {/* The ten elements show once: each row is a button that opens its "Checked against" line. */}
          <EvidenceSources
            elements={(t.raw("evidence.rows") as string[][]).map(([element, source, checked]) => ({
              element,
              from: t("evidence.from", { source }),
              checked,
            }))}
            checkedLabel={(t.raw("evidence.columns") as string[])[2]}
            record={t("evidence.record")}
            readers={t.raw("evidence.readers") as string[]}
          />
          <div className="flex flex-col gap-3 lg:max-w-[628px]">
            {(t.raw("evidence.after") as string[]).map((line) => (
              <p key={line} className="t-body-sm text-ink">{line}</p>
            ))}
          </div>
        </div>
      </Section>

      <Section labelledBy="insurance-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="insurance-heading" heading={t("insurance.heading")} lead={t("insurance.lead")} />
        {/* Under the lead, in the lead's column; narrower laptops move it left so its labels fit. */}
        <BuyerLimit className="lg:ml-[min(300px,calc(100%-660px))] xl:ml-[clamp(300px,calc(100%-800px),480px)]" labels={t.raw("insurance.labels") as [string, string, string]} />
      </Section>

      <Section labelledBy="payment-heading" className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12 xl:gap-20">
        <SectionHead id="payment-heading" heading={t("payment.heading")} layout="stacked" />
        <MoneyPath
          className="min-w-0 flex-1"
          parties={t.raw("payment.parties") as string[]}
          payments={t.raw("payment.payments") as string[]}
          routes={t.raw("payment.routes") as [string, string][]}
          kubarNote={t("payment.kubarNote")}
          under={t("payment.under")}
          columns={t.raw("payment.columns") as { payment: string; from: string; to: string }}
          alt={t("payment.alt")}
        />
      </Section>

      {/* The drawing's labels carry the lead, which stays as its description for screen readers. */}
      <Section labelledBy="loss-heading" className="flex flex-col gap-10 xl:flex-row xl:items-start xl:gap-10 min-[1366px]:gap-20">
        {/* Laptops narrow the heading's column a little, so the drawing's labels keep their lines. From
            1024 to 1199 the heading runs across the top and the drawing sits under it at full size,
            centred with its labels: beside a heading they would collide. */}
        <SectionHead id="loss-heading" heading={t("lossHistory.heading")} layout="stacked" className="lg:w-auto lg:max-w-[800px] xl:w-[clamp(340px,calc(100%-800px),400px)] xl:max-w-none" />
        <LossHistory className="min-w-0 flex-1 lg:mx-auto lg:w-[780px] lg:flex-none xl:mx-0 xl:w-auto xl:flex-1" copy={t.raw("lossHistory.drawing") as LossHistoryCopy} description={t("lossHistory.lead")} />
      </Section>

      <Section id="who-holds-what" labelledBy="holds-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="holds-heading" heading={t("holds.heading")} layout="wide" />
        <HoldsCards
          rows={t.raw("holds.rows") as [string, string, string][]}
          labels={(t.raw("holds.columns") as string[]).slice(1) as [string, string]}
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
        <Corridor rows={t.raw("programme1.rows") as [string, string][]} />
      </Section>

      <Section labelledBy="venue-heading" className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12 xl:gap-20">
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
