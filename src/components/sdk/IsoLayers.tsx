import { GroundShadow } from "@/components/drawings/iso";
import { PlayOnce } from "@/components/drawings/PlayOnce";
import { cn } from "@/lib/utils";

/*
 * Layers · isometric (Figma 261:843; REDRAW-2026-11-14.md, NavDhan SDK
 * "Behind it"). From the top: your platform (white) with a small
 * rani-edged NavDhan SDK tile on it, Kubar Protocol (petrol), then banks,
 * insurers and funds (white). Four labels on leaders to the right; under
 * the drawing below desktop. The layer descriptions were cut (section 10);
 * the names stay.
 *
 * The labels are the content, a list from the top down; the drawing is
 * aria-hidden.
 *
 * Motion (section 7), once, when 40% of it is in view: the layers settle
 * from 20 px apart to their drawn spacing, bottom first; the SDK tile lands
 * last. On desktop, hover, focus or a click on a label marks its layer's
 * top edges, drawn over the layer from inside the label (as the
 * foundations do). Nothing moves with reduced motion.
 */
const CX = 250;
const SIDE = 240;
const THICK = 30;
const TOPS = [70.4, 174.4, 278.4]; // your platform, Kubar Protocol, banks
const TILE = { side: 100.8, thick: 15, y: 123 };
const WIDTH = 500;
const HEIGHT = 580;
const LABEL_Y = [107.4, 192.4, 296.4, 400.4]; // SDK, platform, protocol, banks
const k = 0.866;

type Pt = [number, number];
const pts = (...p: Pt[]) => p.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
function slab(y: number, side: number, thick: number) {
  const top: Pt = [CX, y];
  const right: Pt = [CX + k * side, y + side / 2];
  const front: Pt = [CX, y + side];
  const left: Pt = [CX - k * side, y + side / 2];
  const down = ([px, py]: Pt): Pt => [px, py + thick];
  return { top: pts(top, right, front, left), left: pts(left, front, down(front), down(left)), right: pts(front, right, down(right), down(front)) };
}

export function IsoLayers({ names, className }: { names: { platform: string; sdk: string; protocol: string; base: string }; className?: string }) {
  const layers = TOPS.map((y) => slab(y, SIDE, THICK));
  const tile = slab(TILE.y, TILE.side, TILE.thick);
  // Labels top down: the SDK tile, then the three layers.
  const labels = [
    { name: names.sdk, edge: tile.top },
    { name: names.platform, edge: layers[0].top },
    { name: names.protocol, edge: layers[1].top },
    { name: names.base, edge: layers[2].top },
  ];
  return (
    <PlayOnce className={cn("iso-layers relative", className)}>
      <svg aria-hidden="true" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT} className="mx-auto block h-auto w-full max-w-[500px] overflow-visible lg:mx-0">
        <GroundShadow cx={250} cy={529} rx={180} ry={48} />
        {/* Bottom first, so each layer covers the one below it. */}
        {[2, 1, 0].map((i) => {
          const petrol = i === 1;
          return (
            <g key={i} className="layer-settle" style={{ ["--n" as string]: 2 - i, ["--from" as string]: `${(i - 2) * 20}px` }}>
              <g className="iso-block">
                <polygon points={layers[i].left} className={petrol ? "fill-[var(--petrol-850)]" : "fill-[var(--petrol-100)] stroke-rule"} />
                <polygon points={layers[i].right} className={petrol ? "fill-[var(--petrol-800)]" : "fill-[var(--petrol-50)] stroke-rule"} />
                <polygon points={layers[i].top} className={petrol ? "fill-[var(--petrol-900)]" : "fill-raised stroke-rule"} />
              </g>
              {i === 0 ? (
                <g className="layer-tile">
                  <polygon points={tile.left} className="fill-[var(--petrol-100)] stroke-accent" />
                  <polygon points={tile.right} className="fill-[var(--petrol-50)] stroke-accent" />
                  <polygon points={tile.top} className="fill-raised stroke-accent" />
                </g>
              ) : null}
            </g>
          );
        })}
        {/* Desktop: the leaders to the labels. */}
        <g className="hidden lg:inline" fill="none">
          <path d="M343.3 180.9H377V120.4H546" className="stroke-accent" />
          {[205.4, 309.4, 413.4].map((y) => (
            <line key={y} x1={465.84} x2={546} y1={y} y2={y} className="stroke-rule" />
          ))}
        </g>
      </svg>

      <ol className="mt-6 flex flex-col lg:absolute lg:inset-y-0 lg:left-[560px] lg:mt-0 lg:block">
        {labels.map((label, i) => (
          <li
            key={label.name}
            // Not a tab stop: the highlight only points at the layer.
            tabIndex={-1}
            style={{ ["--label-top" as string]: `${LABEL_Y[i]}px` }}
            className="t-ui-lg border-t border-rule py-3 text-ink outline-offset-4 lg:absolute lg:top-(--label-top) lg:border-0 lg:py-0 lg:whitespace-nowrap"
          >
            <svg
              aria-hidden="true"
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              width={WIDTH}
              height={HEIGHT}
              style={{ top: `${-LABEL_Y[i]}px` }}
              className="pointer-events-none absolute left-[-560px] hidden overflow-visible lg:block"
            >
              <polygon points={label.edge} className="iso-top-edge" />
            </svg>
            {label.name}
          </li>
        ))}
      </ol>
    </PlayOnce>
  );
}
