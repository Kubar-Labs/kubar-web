import { useTranslations } from "next-intl";
import { FitStage } from "@/components/drawings/FitStage";
import { PlatformLanes } from "@/components/sdk/PlatformLanes";
import { RunLanes } from "@/components/sdk/RunLanes";
import { StoryView, type LedgerState } from "@/components/story/StoryView";

type Paths = { sdk: string; consent: string; evidence: string; status: string };

/*
 * "How it runs on your platform.", NavDhan SDK's pinned journey (step 10;
 * Figma 331:1202): the three lanes pinned, the five steps as cards that
 * scroll past them, on StoryView with Home's pinning, stepping and fallbacks.
 * This reads the words on the server and renders the lanes there, so the
 * view that ships to the browser carries no message formatter and none of
 * the drawing's code. With reduced motion, on a short screen or without
 * script, today's register beside its lanes shows instead.
 */
export function RunJourney({ skipTo }: { skipTo: string }) {
  const t = useTranslations("navdhanSdk.runs");
  const steps = t.raw("steps") as string[];
  const lanes = t.raw("lanes") as string[];
  const paths = t.raw("paths") as Paths;
  const states: LedgerState[] = steps.map((what, i) => ({ no: String(i + 1).padStart(2, "0"), state: "", what, party: null, data: null, money: null }));
  return (
    <StoryView
      variant="sdk"
      copy={{ skip: t("skip"), counter: t.raw("counter") }}
      states={states}
      lanes={<RunLanes lanes={lanes} paths={paths} />}
      skipTo={skipTo}
    >
      {/* The register as today: the drawing keeps its 1062 composition and is fitted to its column
          on narrower laptops (rule 11.1): 0.89 at 1024, where its 13 px labels hold 12 px (fit-keep). */}
      <FitStage width={1062} height={528} estimate={0.88} className="w-full">
        <PlatformLanes steps={steps} lanes={lanes} paths={paths} />
      </FitStage>
    </StoryView>
  );
}
