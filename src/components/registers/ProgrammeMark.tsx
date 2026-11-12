/* eslint-disable @next/next/no-img-element -- static single-ink SVG marks with explicit sizes; nothing to optimise */
import { cn } from "@/lib/utils";

/*
 * Programme marks (Figma C4, "Programme logo/…" components): each
 * organisation's own mark in black, centred in a 176 × 64 box, sized
 * optically by the reviewed Figma components (the sizes below). Marks are
 * never recoloured. The T-Hub mark is a raster used as an alpha mask over
 * ink (a vector is still to come), so it takes --color-partner-mark.
 * Alt is the programme's name as written in its row (HANDOFF section 8).
 */
type Mark = { width: number; height: number; mask?: { left: number; top: number } };

export const PROGRAMME_MARKS: Record<string, Mark> = {
  "gift-ifih": { width: 83.3, height: 27.5 },
  bharatnetra: { width: 110.3, height: 22 },
  "stpi-finglobe": { width: 78.7, height: 31.7 },
  "meity-startup-hub": { width: 90.4, height: 35 },
  "t-hub": { width: 58, height: 48, mask: { left: 13, top: 8 } },
  "pusa-krishi": { width: 101.2, height: 29.7 },
  google: { width: 83, height: 26.6 },
  nvidia: { width: 102.4, height: 19.8 },
  perplexity: { width: 104.1, height: 21.1 },
  openai: { width: 86.2, height: 23.2 },
  microsoft: { width: 100, height: 21.3 },
  intel: { width: 59.5, height: 25 },
  elevenlabs: { width: 122.4, height: 15.9 },
  amplitude: { width: 107.1, height: 22.3 },
  "polkadot-academy": { width: 99.6, height: 30 },
  uniswap: { width: 110.5, height: 26.8 },
  sarvam: { width: 103.1, height: 16.4 },
  cloudflare: { width: 126.9, height: 18.5 },
  claude: { width: 106.8, height: 23.4 },
  mongodb: { width: 109.3, height: 27.6 },
};

const BOX = { width: 176, height: 64 };

type ProgrammeMarkProps = {
  id: string;
  name: string;
  /** 1 at desktop; the mobile programme entry uses 120 / 176. */
  scale?: number;
  /** Box width, if the entry is narrower than 176 (the marks stay centred). */
  boxWidth?: number;
  className?: string;
};

export function ProgrammeMark({ id, name, scale = 1, boxWidth, className }: ProgrammeMarkProps) {
  const mark = PROGRAMME_MARKS[id];
  const width = (boxWidth ?? BOX.width) * (boxWidth ? 1 : scale);
  const height = BOX.height * scale;
  const w = +(mark.width * scale).toFixed(2);
  const h = +(mark.height * scale).toFixed(2);

  return (
    <span className={cn("relative block shrink-0", className)} style={{ width, height }}>
      {mark.mask ? (
        <span
          role="img"
          aria-label={name}
          className="absolute bg-partner-mark"
          style={{
            left: mark.mask.left * scale,
            top: mark.mask.top * scale,
            width: w,
            height: h,
            maskImage: `url(/programmes/${id}.png)`,
            maskSize: "100% 100%",
            maskRepeat: "no-repeat",
            WebkitMaskImage: `url(/programmes/${id}.png)`,
            WebkitMaskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
          }}
        />
      ) : (
        <img
          src={`/programmes/${id}.svg`}
          alt={name}
          width={w}
          height={h}
          loading="lazy"
          decoding="async"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: w, height: h }}
        />
      )}
    </span>
  );
}
