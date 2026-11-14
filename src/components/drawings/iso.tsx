/*
 * The one projection every drawing uses (REDRAW-2026-11-14.md, section 4).
 *
 * A flat rectangle becomes a sheet lying on the ground with a 2D matrix: its
 * x-axis runs down to the right, its y-axis down to the left, so the
 * rectangle's (0, 0) corner is the top vertex of the drawn diamond.
 * A w × h rectangle draws 0.866(w + h) wide and 0.5(w + h) tall.
 *
 * Drawings are inline SVG, always `aria-hidden`: the words they carry are
 * real text in the DOM beside or under them.
 */
export const ISO = { a: 0.866, b: 0.5, c: -0.866, d: 0.5 } as const;
export const ISO_MATRIX = `matrix(${ISO.a} ${ISO.b} ${ISO.c} ${ISO.d} 0 0)`;

/** Where a point (x, y) on a flat rectangle lands once projected, relative to its (0, 0) corner. */
export function project(x: number, y: number) {
  return { x: ISO.a * x + ISO.c * y, y: ISO.b * x + ISO.d * y };
}

/** The projected bounding box of a w × h rectangle whose (0, 0) corner is at the origin. */
export function isoBox(w: number, h: number) {
  return { left: ISO.c * h, width: ISO.a * (w + h), height: ISO.b * (w + h) };
}

/*
 * A sheet (a document, a receivable): white, a 1 px border that stays 1 px
 * under the projection, and a copy of itself 4 px lower for its thickness, in
 * the rule colour (rani for the current sheet). Its elevation shadow is a CSS
 * filter on the group (globals.css: .iso-sheet, .iso-sheet-current).
 * `x`, `y` place the top vertex.
 */
export function IsoSheetShape({
  x,
  y,
  w,
  h,
  current = false,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  current?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <>
      <g transform={`translate(${x} ${y + 4}) ${ISO_MATRIX}`}>
        <rect width={w} height={h} className={current ? "fill-accent" : "fill-rule"} />
      </g>
      {/* The lifted shadow, faded in when the sheet is lifted (opacity only). */}
      <g transform={`translate(${x} ${y}) ${ISO_MATRIX}`} className="iso-lift-shadow">
        <rect width={w} height={h} className="fill-raised" />
      </g>
      <g transform={`translate(${x} ${y}) ${ISO_MATRIX}`} className={current ? "iso-sheet-current" : "iso-sheet"}>
        <rect
          width={w}
          height={h}
          className={current ? "fill-raised stroke-rule-strong" : "fill-raised stroke-rule"}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {children}
      </g>
    </>
  );
}

/** The blurred ellipse under a drawing: petrol at 20% (section 4). */
export function GroundShadow({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} className="iso-ground" />;
}
