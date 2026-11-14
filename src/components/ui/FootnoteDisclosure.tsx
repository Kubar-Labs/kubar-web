import { Icon } from "@/components/icons/Icon";

/*
 * A footnote behind a disclosure (Home, The gap: "How we estimate this"
 * opens footnote ², REDRAW-2026-11-14.md, sections 6 and 9.5). A native
 * <details>, so it works without script; following the footnote's marker
 * opens it (FootnoteLinks). The plus turns to a minus when open.
 */
export function FootnoteDisclosure({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <details className="group flex flex-col">
      <summary className="t-ui inline-flex min-h-6 cursor-pointer list-none items-center gap-2 self-start text-ink [&::-webkit-details-marker]:hidden">
        <span className="underline decoration-1 [text-underline-position:from-font] group-hover:decoration-2">{summary}</span>
        <Icon name="plus" className="shrink-0 group-open:hidden" />
        <Icon name="minus" className="hidden shrink-0 group-open:inline" />
      </summary>
      <div className="pt-3">{children}</div>
    </details>
  );
}
