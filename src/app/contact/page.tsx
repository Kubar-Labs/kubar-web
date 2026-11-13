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
 * Contact (Figma 174:6 at 1440, 174:616 at 768, 174:291 at 390): the routes
 * (each goes to the form with "I'm writing as" chosen), the form, and the
 * direct addresses.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact.meta");
  return createPageMetadata({ title: t("title"), description: t("description"), path: "/contact" });
}

export default function Contact() {
  const t = useTranslations("contact");

  return (
    <>
      <section className="border-b border-rule-strong">
        <div className="page-container flex flex-col gap-10 pt-8 pb-12 lg:gap-16 lg:pt-16 lg:pb-[72px]">
          <div className="flex flex-col gap-8">
            <h1 className="t-display text-ink">{t("hero.headline")}</h1>
            <p className="t-body-lg text-ink-muted lg:max-w-[628px]">{t("hero.sub")}</p>
          </div>
          <ContactRoutes
            columns={t.raw("routes.columns") as { who: string; step: string; goesTo: string }}
            rows={t.raw("routes.rows") as ContactRoute[]}
          />
        </div>
      </section>

      <Section id="form">
        {/* useSearchParams (the ?intent= preset) needs a Suspense boundary on a static page. */}
        <Suspense>
          <ContactForm copy={t.raw("form") as ContactFormCopy} />
        </Suspense>
      </Section>

      <Section labelledBy="direct-heading" className="flex flex-col gap-10 lg:gap-16">
        <h2 id="direct-heading" className="t-label text-ink-muted">{t("direct.label")}</h2>
        <Register
          className="lg:max-w-[845px]"
          first="label"
          columns={t.raw("direct.columns") as string[]}
          widths={[217, 628]}
          rows={(t.raw("direct.rows") as string[][]).map(([label, entry]) => [label, <WithEmails key={label} text={entry} />])}
        />
      </Section>
    </>
  );
}
