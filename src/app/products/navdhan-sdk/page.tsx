import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { createPageMetadata } from "@/app/page-metadata";
import { NextStep } from "@/components/blocks/Closing";
import { PageHero } from "@/components/blocks/PageHero";
import { Section, SectionHead } from "@/components/blocks/Section";
import { EmbedPicker, type SketchCopy } from "@/components/sdk/EmbedPicker";
import { IsoLayers } from "@/components/sdk/IsoLayers";
import { NumberedRows, PlatformLanes } from "@/components/sdk/PlatformLanes";
import { TextLink } from "@/components/ui/TextLink";

/*
 * NavDhan SDK (Figma 170:6 at 1440; the 768 and 390 frames are not updated,
 * so below 1200 the page follows the existing rules). No "Where it stands",
 * no status words, no Illustrative tag. The hero carries "What you embed"
 * beside the sketch; the two audiences are one two-column block; the rules
 * have no numbers; "Behind it" is the isometric layers.
 */

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("navdhanSdk.meta");
  return createPageMetadata({ title: t("title"), description: t("description"), path: "/products/navdhan-sdk" });
}

const CONTACT = "/contact?intent=platform";

export default function NavdhanSdk() {
  const t = useTranslations("navdhanSdk");
  return (
    <>
      {/* The hero carries "What you embed": the six capabilities beside the sketch (section 12, item 3). */}
      <PageHero
        headline={t("hero.headline")}
        sub={t("hero.sub")}
        button={{ label: t("hero.button"), href: CONTACT }}
        below={<EmbedPicker heading={t("does.heading")} rows={t.raw("does.rows") as string[][]} copy={t.raw("sketch") as SketchCopy} />}
      />

      {/* The two audiences as one two-column block from 1200 up (Figma 296:9538; section 13 C1). */}
      <Section className="grid gap-(--section-space) lg:grid-cols-2 lg:gap-20">
        {(["exporters", "platform"] as const).map((key) => (
          <div key={key} className="flex flex-col gap-5 lg:gap-6">
            <h2 className="t-h2 text-ink">{t(`${key}.heading`)}</h2>
            <p className="t-body-lg text-ink-muted max-lg:max-w-(--measure)">{t(`${key}.lead`)}</p>
          </div>
        ))}
      </Section>

      <Section labelledBy="runs-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="runs-heading" heading={t("runs.heading")} layout="wide" />
        <div className="flex flex-col items-start gap-10">
          <PlatformLanes
            steps={t.raw("runs.steps") as string[]}
            lanes={t.raw("runs.lanes") as string[]}
            paths={t.raw("runs.paths") as { sdk: string; consent: string; evidence: string; status: string }}
          />
          <TextLink href="/how-it-works" kind="arrow">{t("runs.link")}</TextLink>
        </div>
      </Section>

      <Section labelledBy="rules-heading" className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-20">
        <SectionHead id="rules-heading" heading={t("rules.heading")} layout="stacked" />
        {/* Not a sequence, so no numbers (REDRAW rule 7). */}
        <NumberedRows numbered={false} items={t.raw("rules.items") as string[]} className="min-w-0 flex-1" />
      </Section>

      <Section labelledBy="behind-heading" className="flex flex-col gap-10 lg:gap-16">
        <SectionHead id="behind-heading" heading={t("behind.heading")} lead={t("behind.lead")} />
        <div className="flex flex-col items-start gap-10">
          <IsoLayers names={t.raw("behind.layers") as { platform: string; sdk: string; protocol: string; base: string }} className="w-full" />
          <TextLink href="/products/kubar-protocol" kind="arrow">{t("behind.link")}</TextLink>
        </div>
      </Section>

      <Section labelledBy="next-heading">
        <NextStep id="next-heading" heading={t("next.heading")} body={t("next.body")} button={{ label: t("next.button"), href: CONTACT }} />
      </Section>
    </>
  );
}
