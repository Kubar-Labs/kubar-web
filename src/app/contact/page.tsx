import type { Metadata } from "next";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { createPageMetadata } from "@/app/page-metadata";
import { Section } from "@/components/blocks/Section";
import { ContactForm, type ContactFormCopy } from "@/components/contact/ContactForm";
import { ContactRoutes, type ContactRoute } from "@/components/registers/ContactRoutes";
import { Register } from "@/components/registers/Register";
import { WithEmails } from "@/components/ui/WithEmails";

/*
 * Contact (Figma 174:6 at 1440; the 768 and 390 frames are not updated):
 * the routes, with no "Goes to" column (choosing one that leads to the
 * form pre-fills "I'm writing as" and moves focus to the form), then the
 * form with the direct addresses beside it.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact.meta");
  return createPageMetadata({ title: t("title"), description: t("description"), path: "/contact" });
}

export default function Contact() {
  const t = useTranslations("contact");

  return (
    <>
      <section>
        <div className="page-container flex flex-col gap-10 pt-8 pb-12 lg:gap-16 lg:pt-16 lg:pb-[72px]">
          <div className="flex flex-col gap-8">
            <h1 className="t-display text-ink">{t("hero.headline")}</h1>
            <p className="t-body-lg text-ink-muted lg:max-w-[628px]">{t("hero.sub")}</p>
          </div>
          <ContactRoutes
            columns={t.raw("routes.columns") as { who: string; step: string }}
            rows={t.raw("routes.rows") as ContactRoute[]}
          />
        </div>
      </section>

      {/* The form, with the direct addresses beside it from 1024 up and under it below that; from 1024 to
          1199 the form is 560 wide and each address sits under its label, so none overruns its column
          (Figma 296:12889; REDRAW section 13 C2). No separate Direct section or label. */}
      <Section id="form" className="flex flex-col gap-(--section-space) lg:flex-row lg:items-start lg:gap-12 xl:gap-20">
        <div className="min-w-0 lg:w-[560px] lg:shrink xl:w-[628px]">
          {/* useSearchParams (the ?intent= preset) needs a Suspense boundary on a static page. */}
          <Suspense>
            <ContactForm copy={t.raw("form") as ContactFormCopy} />
          </Suspense>
        </div>
        <Register
          className="min-w-0 lg:flex-1"
          first="label"
          tableFrom="xl"
          columns={t.raw("direct.columns") as string[]}
          widths={[217, 355]}
          rows={(t.raw("direct.rows") as string[][]).map(([label, entry]) => [label, <WithEmails key={label} text={entry} />])}
        />
      </Section>
    </>
  );
}
