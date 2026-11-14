import { useTranslations } from "next-intl";
import { Lanes, type LaneLabels } from "@/components/story/Lanes";
import { StoryView, type LedgerState } from "@/components/story/StoryView";
import { FootnoteMarker } from "@/components/ui/Footnote";
import { Illustrative } from "@/components/ui/Illustrative";

export type { LedgerState };

/*
 * The pinned story (see StoryView). This reads the words on the server and
 * renders the Illustrative tag, the footnote marker and the lanes drawing
 * there, so the view that ships to the browser carries no message formatter
 * and none of the drawing's code.
 */
export function Story({
  skipTo,
  footnote,
  states,
  variant,
  closing,
  children,
}: {
  /** Id of the section after the story. */
  skipTo: string;
  footnote: { target: string; refId: string };
  /** The page's own eight states; Home's ledger when omitted. */
  states?: LedgerState[];
  variant?: "home" | "howItWorks";
  /** How it works: the line that ends the eight states below desktop. */
  closing?: string;
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
      lanes={<Lanes parties={t.raw("story.parties") as string[]} labels={t.raw("story.lanes") as LaneLabels} />}
      skipTo={skipTo}
      variant={variant}
      closing={closing}
    >
      {children}
    </StoryView>
  );
}
