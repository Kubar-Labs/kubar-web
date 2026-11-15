import { useTranslations } from "next-intl";

/*
 * Skip link (Figma C3 85:78): the first focusable element on every page.
 * Hidden until it has keyboard focus; then it shows 8 px in from the top left,
 * over the header: white, Sans/UI in ink, underlined, with the rani ring.
 */
export function SkipLink() {
  const t = useTranslations();
  return (
    <a
      href="#main-content"
      className="t-ui sr-only bg-raised px-4 py-3 text-ink underline decoration-1 [text-underline-position:from-font] focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-3"
    >
      {t("skipLink")}
    </a>
  );
}
