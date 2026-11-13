import Link from "next/link";
import { WithEmails } from "@/components/ui/WithEmails";

/*
 * Privacy notice and Terms of use (Figma 176:546, 176:1059; copy/07): the
 * title and date; the contents in the left three columns (sticky at desktop,
 * under the date below it); numbered headings matching the contents; the
 * text in Sans/Body at 628 wide; lists as dash paragraphs; no rules between
 * sections.
 */
export type LegalCopy = {
  title: string;
  lastUpdated: string;
  contents: string;
  sections: { n: string; title: string; blocks: string[] }[];
};

function Block({ text }: { text: string }) {
  const dash = text.startsWith("– ");
  const body = dash ? text.slice(2) : text;
  const [before, rest] = body.split("<link>");
  const content =
    rest === undefined ? (
      <WithEmails text={body} />
    ) : (
      <>
        {before}
        <Link href="/legal/privacy" className="link-ink">{rest.split("</link>")[0]}</Link>
        {rest.split("</link>")[1]}
      </>
    );
  return dash ? (
    <li className="t-body flex gap-3 text-ink">
      <span aria-hidden="true">–</span>
      <span>{content}</span>
    </li>
  ) : (
    <p className="t-body text-ink">{content}</p>
  );
}

/** Groups consecutive dash paragraphs into one list. */
function groups(blocks: string[]) {
  const out: (string | string[])[] = [];
  for (const block of blocks) {
    const last = out[out.length - 1];
    if (block.startsWith("– ")) {
      if (Array.isArray(last)) last.push(block);
      else out.push([block]);
    } else out.push(block);
  }
  return out;
}

export function LegalPage({ copy }: { copy: LegalCopy }) {
  return (
    <div className="page-container pt-8 pb-12 lg:pt-16 lg:pb-[72px]">
      <div className="flex flex-col gap-5">
        <h1 className="t-display text-ink">{copy.title}</h1>
        <p className="t-fine text-ink-muted">{copy.lastUpdated}</p>
      </div>
      <div className="flex flex-col gap-10 pt-10 lg:flex-row lg:items-start lg:gap-6 lg:pt-16">
        <nav aria-labelledby="contents-heading" className="lg:sticky lg:top-[calc(var(--header-height)+24px)] lg:w-[302px] lg:shrink-0">
          <h2 id="contents-heading" className="t-tag pb-3 text-ink-muted">{copy.contents}</h2>
          <ol className="flex flex-col gap-1">
            {copy.sections.map((section) => (
              <li key={section.n}>
                <a href={`#section-${section.n}`} className="t-body-sm link-ink inline-flex min-h-6 items-center">
                  {section.n}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex min-w-0 flex-col gap-10 lg:w-[628px]">
          {copy.sections.map((section) => (
            <section key={section.n} id={`section-${section.n}`} aria-labelledby={`section-${section.n}-heading`} className="flex flex-col gap-4">
              <h2 id={`section-${section.n}-heading`} className="t-h4 text-ink">
                {section.n}. {section.title}
              </h2>
              {groups(section.blocks).map((group, i) =>
                Array.isArray(group) ? (
                  <ul key={i} className="flex flex-col gap-2">
                    {group.map((item) => (
                      <Block key={item} text={item} />
                    ))}
                  </ul>
                ) : (
                  <Block key={i} text={group} />
                ),
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
