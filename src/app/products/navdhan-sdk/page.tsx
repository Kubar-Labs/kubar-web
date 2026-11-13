import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { createPageMetadata } from "@/app/page-metadata";
import { NextStep } from "@/components/blocks/Closing";
import { PageHero } from "@/components/blocks/PageHero";
import { Section, SectionHead } from "@/components/blocks/Section";
import { Register } from "@/components/registers/Register";
import { EmbedSketch, type SketchCopy } from "@/components/sdk/EmbedSketch";
import { LayerStack, type Layer } from "@/components/sdk/LayerStack";
import { NumberedRows, PlatformLanes } from "@/components/sdk/PlatformLanes";
import { TextLink } from "@/components/ui/TextLink";

/* NavDhan SDK (Figma 170:6 at 1440, 170:698 at 768, 170:250 at 390). No "Where it stands", no status words. */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("navdhanSdk.meta");
  return createPageMetadata({ title: t("title"), description: t("description"), path: "/products/navdhan-sdk" });
}

const CONTACT = "/contact?intent=platform";

export default function NavdhanSdk() {
  const t = useTranslations("navdhanSdk");
  return (
    <>
      <PageHero
        kicker={t("hero.kicker")}
        headline={t("hero.headline")}
        sub={t("hero.sub")}
        button={{ label: t("hero.button"), href: CONTACT }}
        aside={<EmbedSketch copy={t.raw("sketch") as SketchCopy} />}
      />

      <Section labelledBy="exporters-heading">
        <SectionHead id="exporters-heading" heading={t("exporters.heading")} lead={t("exporters.lead")} />
      </Section>

      <Section labelledBy="platform-heading">
        <SectionHead id="platform-heading" heading={t("platform.heading")} lead={t("platform.lead")} />
      </Section>

      <Section labelledBy="does-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="does-heading" heading={t("does.heading")} layout="wide" />
        <Register columns={t.raw("does.columns") as string[]} widths={[434, 846]} rows={t.raw("does.rows") as string[][]} />
      </Section>

      <Section labelledBy="runs-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="runs-heading" heading={t("runs.heading")} layout="wide" />
        <div className="flex flex-col items-start gap-10">
          <PlatformLanes
            columns={t.raw("runs.columns") as { step: string; what: string }}
            steps={t.raw("runs.steps") as string[]}
            lanes={t.raw("runs.lanes") as string[]}
            paths={t.raw("runs.paths") as { sdk: string; consent: string; evidence: string; status: string }}
          />
          <TextLink href="/how-it-works" kind="arrow">{t("runs.link")}</TextLink>
        </div>
      </Section>

      <Section labelledBy="rules-heading" className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
        <SectionHead id="rules-heading" heading={t("rules.heading")} layout="stacked" />
        <NumberedRows items={t.raw("rules.items") as string[]} className="min-w-0 flex-1" />
      </Section>

      <Section labelledBy="behind-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="behind-heading" heading={t("behind.heading")} lead={t("behind.lead")} />
        <div className="flex flex-col items-start gap-10">
          <LayerStack layers={t.raw("behind.layers") as Layer[]} className="w-full lg:w-[628px]" />
          <TextLink href="/products/kubar-protocol" kind="arrow">{t("behind.link")}</TextLink>
        </div>
      </Section>

      <Section labelledBy="next-heading">
        <NextStep id="next-heading" heading={t("next.heading")} body={t("next.body")} button={{ label: t("next.button"), href: CONTACT }} />
      </Section>
    </>
  );
}
