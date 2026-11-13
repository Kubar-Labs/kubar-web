import { ScaleBar } from "@/components/blocks/ScaleBar";
import { FootnoteMarker } from "@/components/ui/Footnote";

/*
 * Figure pair (Figma C4 92:332): the gap's two dated figures, each under a
 * 2 px strong rule: its period (Mono/Tag), the figure (Mono/Figure) and its
 * caption (muted Body small) ending with its footnote marker. Below, the two
 * drawn to scale. Side by side from tablet up... the figures stack on mobile.
 */
export type Figure = { period: string; figure: string; caption: string; footnote: number };

type FigurePairProps = {
  figures: Figure[];
  scaleNote: string;
  scaleAlt: string;
  /** Footnote ids: "fn-2" and markers "fnref-2". */
  footnoteId: (n: number) => { target: string; refId: string };
};

export function FigurePair({ figures, scaleNote, scaleAlt, footnoteId }: FigurePairProps) {
  return (
    <div className="flex flex-col gap-10">
      <dl className="flex flex-col gap-10 lg:flex-row lg:gap-6">
        {figures.map((figure) => (
          <div key={figure.figure} className="flex flex-1 flex-col gap-3 border-t-2 border-rule-strong pt-5">
            <dt className="t-tag text-ink-muted">{figure.period}</dt>
            <dd className="flex flex-col gap-3">
              <span className="t-figure whitespace-nowrap text-ink">{figure.figure}</span>
              <span className="t-body-sm text-ink-muted">
                {figure.caption}
                <FootnoteMarker n={figure.footnote} {...footnoteId(figure.footnote)} />
              </span>
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-3">
        <ScaleBar label={scaleAlt} />
        <p className="t-code text-ink-muted">{scaleNote}</p>
      </div>
    </div>
  );
}
