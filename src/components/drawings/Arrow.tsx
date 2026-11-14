/*
 * An arrow in a drawing (REDRAW-2026-11-14.md, sections 4, 7 and 9.4).
 * Money: solid 2 px in ink, drawn on with its own stroke-dashoffset. Data:
 * dashed 1.5 px in muted ink; a dashed line can't draw with its own
 * dashoffset, so it is revealed through a mask whose solid copy draws.
 * The arrowhead appears only when its line arrives. The movement is keyed
 * off the drawing's data-phase (PlayOnce) and --draw-delay (globals.css).
 */
/** Money: solid 2 px. Data: dashed 1.5 px. Flow: solid 1.5 px, a step to the next (the programme loop). */
export type ArrowKind = "money" | "data" | "flow";

export function Arrow({
  id,
  d,
  head,
  kind,
  delay = 0,
  touches,
  className,
}: {
  /** Unique on the page: names the data line's mask. */
  id: string;
  /** The line, without its head. */
  d: string;
  /** The arrowhead's points. */
  head: string;
  kind: ArrowKind;
  /** When the line starts drawing, in ms after the drawing starts. */
  delay?: number;
  /** The parties this arrow joins, for dimming the others (space-separated). */
  touches?: string;
  className?: string;
}) {
  const style = { ["--draw-delay" as string]: `${delay}ms` };
  if (kind === "money" || kind === "flow") {
    return (
      <g className={`draw-arrow ${className ?? ""}`} data-touches={touches} style={style}>
        <path d={d} pathLength={1} className="draw-solid fill-none stroke-ink" strokeWidth={kind === "money" ? 2 : 1.5} />
        <polygon points={head} className="draw-head fill-ink" />
      </g>
    );
  }
  return (
    <g className={`draw-arrow ${className ?? ""}`} data-touches={touches} style={style}>
      <mask id={id} maskUnits="userSpaceOnUse" x="-10000" y="-10000" width="20000" height="20000">
        <path d={d} pathLength={1} className="draw-mask" />
      </mask>
      <path d={d} mask={`url(#${id})`} className="fill-none stroke-ink-muted" strokeWidth={1.5} strokeDasharray="5 3" />
      <polygon points={head} className="draw-head fill-ink-muted" />
    </g>
  );
}

/**
 * A straight arrow from (x1, y1) to its tip at (x2, y2), horizontal or
 * vertical: the line stops where the head begins.
 */
export function straight(x1: number, y1: number, x2: number, y2: number, size = 6) {
  const dir = x1 === x2 ? (y2 > y1 ? "down" : "up") : x2 > x1 ? "right" : "left";
  const bx = dir === "left" ? x2 + size : dir === "right" ? x2 - size : x2;
  const by = dir === "up" ? y2 + size : dir === "down" ? y2 - size : y2;
  return { d: `M${x1} ${y1} L${bx} ${by}`, head: headAt(x2, y2, dir, size) };
}

/** Arrowhead points for a line ending at (x, y), pointing in a direction. */
export function headAt(x: number, y: number, dir: "left" | "right" | "up" | "down", size = 6) {
  const w = size * 0.6;
  switch (dir) {
    case "left":
      return `${x},${y} ${x + size},${y - w} ${x + size},${y + w}`;
    case "right":
      return `${x},${y} ${x - size},${y - w} ${x - size},${y + w}`;
    case "up":
      return `${x},${y} ${x - w},${y + size} ${x + w},${y + size}`;
    case "down":
      return `${x},${y} ${x - w},${y - size} ${x + w},${y - size}`;
  }
}
