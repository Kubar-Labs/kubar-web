import { useTranslations } from "next-intl";

/*
 * Home shell for build step 1: the page's one h1, framed by the header and
 * footer. The hero (with the record and footnote ¹), the sections and the
 * pinned story arrive in build step 3.
 */
export default function Home() {
  const t = useTranslations("home");
  return (
    <section className="page-container pt-8 pb-(--section-space) lg:pt-16">
      <h1 className="t-display max-w-[600px] text-ink">
        {t.rich("display", {
          marker: (chunks) => <span className="text-accent">{chunks}</span>,
        })}
      </h1>
    </section>
  );
}
