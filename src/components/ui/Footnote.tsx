import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/*
 * Footnote marker (Figma C1 60:54) and footnote (60:67).
 *
 * The marker is a rani superscript that links to its footnote; its accessible
 * name is "Footnote 1". The footnote is Sans/Fine in muted ink with a hanging
 * rani marker, and ends with "Back to text", which returns to the marker.
 * Arrived at from its marker (:target), a footnote takes the inset ground and
 * the angled rani marker in the margin, fading after 2 s (globals.css).
 *
 * Ids are per page: a page passes the same `id` to a footnote and to the
 * markers that point at it, and each marker its own `refId`.
 */
const SUPERSCRIPTS = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
export const superscript = (n: number) => SUPERSCRIPTS[n] ?? String(n);

type MarkerProps = {
  n: number;
  /** Id of the footnote this marker points to. */
  target: string;
  /** This marker's own id, the footnote's "Back to text" target. */
  refId: string;
  className?: string;
};

export function FootnoteMarker({ n, target, refId, className }: MarkerProps) {
  const t = useTranslations("common");
  return (
    <a
      id={refId}
      href={`#${target}`}
      aria-label={t("footnoteMarker", { n })}
      className={cn(
        "footnote-marker text-accent no-underline decoration-1 [text-underline-position:from-font] hover:underline",
        className,
      )}
    >
      {superscript(n)}
    </a>
  );
}

type FootnoteProps = {
  n: number;
  id: string;
  /** The marker to return to. */
  backTo: string;
  children: React.ReactNode;
  className?: string;
};

export function Footnote({ n, id, backTo, children, className }: FootnoteProps) {
  const t = useTranslations("common");
  return (
    <div id={id} className={cn("footnote t-fine relative flex gap-1", className)}>
      <span aria-hidden="true" className="shrink-0 text-accent">
        {superscript(n)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-ink-muted">
          <span className="sr-only">{t("footnoteMarker", { n })}: </span>
          {children}
        </p>
        <a
          href={`#${backTo}`}
          className="self-start text-ink underline decoration-1 [text-underline-position:from-font] hover:decoration-2"
        >
          {t("backToText")}
        </a>
      </div>
    </div>
  );
}
