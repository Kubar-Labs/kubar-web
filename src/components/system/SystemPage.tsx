import { useTranslations } from "next-intl";
import { TextLink } from "@/components/ui/TextLink";

/*
 * System page (Figma C6 156:60): the 404 and the error page, set like a page
 * hero. The sentence in Serif/Display across ten columns, the line in muted
 * Body large across six; the 404 adds five arrow links (stacked below
 * desktop). No code, kicker or drawing.
 */
type SystemPageProps = { kind: "notFound" | "error"; headingId?: string };

export function SystemPage({ kind, headingId }: SystemPageProps) {
  const t = useTranslations("system");

  const routes = [
    { href: "/", label: t("notFound.home") },
    { href: "/products/kubar-protocol", label: t("notFound.kubarProtocol") },
    { href: "/products/navdhan-sdk", label: t("notFound.navdhanSdk") },
    { href: "/how-it-works", label: t("notFound.howItWorks") },
    { href: "/contact", label: t("notFound.contact") },
  ];

  return (
    <section className="page-container pt-8 pb-(--section-space) lg:pt-16">
      <div className="page-grid">
        <div className="col-span-full flex flex-col gap-8 lg:col-span-10">
          <h1 id={headingId} className="t-display text-ink">
            {t(`${kind}.display`)}
          </h1>
          <p className="t-body-lg text-ink-muted lg:max-w-[628px]">
            {kind === "notFound"
              ? t("notFound.line")
              : t.rich("error.line", {
                  email: (chunks) => (
                    <a
                      href="mailto:outreach@kubar.tech"
                      className="text-ink underline decoration-1 [text-underline-position:from-font] hover:decoration-2"
                    >
                      {chunks}
                    </a>
                  ),
                })}
          </p>
          {kind === "notFound" ? (
            <ul className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:gap-x-8">
              {routes.map((route) => (
                <li key={route.href} className="flex">
                  <TextLink href={route.href} kind="arrow">
                    {route.label}
                  </TextLink>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
