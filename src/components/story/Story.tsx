import { useTranslations } from "next-intl";
import { StoryView, type LedgerState } from "@/components/story/StoryView";
import { FootnoteMarker } from "@/components/ui/Footnote";
import { Illustrative } from "@/components/ui/Illustrative";

export type { LedgerState };

/*
 * The pinned story (see StoryView). This reads the words on the server and
 * renders the Illustrative tag and the footnote marker there, so the view
 * that ships to the browser carries no message formatter.
 */
export function Story({
  skipTo,
  footnote,
  states,
  variant,
  children,
}: {
  /** Id of the section after the story. */
  skipTo: string;
  footnote: { target: string; refId: string };
  /** The page's own eight states; Home's ledger when omitted. */
  states?: LedgerState[];
  variant?: "home" | "howItWorks";
  /** The ledger register. */
  children: React.ReactNode;
}) {
  const t = useTranslations();
  return (
    <StoryView
      copy={t.raw("story")}
      states={states ?? (t.raw("ledger.states") as LedgerState[])}
      illustrative={<Illustrative />}
      marker={<FootnoteMarker n={1} {...footnote} />}
      skipTo={skipTo}
      variant={variant}
    >
      {children}
    </StoryView>
  );
}
