import { TextLink } from "@/components/ui/TextLink";

/*
 * Band (Figma C4 92:370), Petrol: the one full-width petrol band a page may
 * have. One line in Serif/Line (roman) with a 2 px rani rule in its margin
 * and an optional large link; it carries --band-space inside its ground.
 * data-ground="petrol" swaps the colour tokens.
 * Paper (About's India-rooted line) is the same line on the page's ground,
 * with no link; it takes the page's section space and hairline like any
 * other section.
 */
type BandProps = { id?: string; line: string; link?: { label: string; href: string }; ground?: "petrol" | "paper" };

export function Band({ id, line, link, ground = "petrol" }: BandProps) {
  const paper = ground === "paper";
  return (
    <section id={id} data-ground={paper ? undefined : "petrol"} className={paper ? "border-b border-rule-strong" : undefined}>
      <div className={paper ? "page-container py-(--section-space)" : "page-container py-(--band-space)"}>
        <div className="flex gap-5 lg:gap-8">
          <span aria-hidden="true" className="w-0.5 shrink-0 bg-accent" />
          <div className="flex flex-col items-start gap-8">
            <p className="t-line text-ink lg:max-w-[900px]">{line}</p>
            {link ? (
              <TextLink href={link.href} kind="arrow" size="large">
                {link.label}
              </TextLink>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
