/*
 * References stay whole (REDRAW-2026-11-14.md, section 11.3): an identifier
 * such as RCV-0001 never breaks at its hyphen. Wraps each one in a no-wrap
 * span; the rest of the text breaks as usual.
 */
const REF = /(RCV-\d{4})/;

export function KeepRefs({ children }: { children: string }) {
  const parts = children.split(REF);
  return (
    <>
      {parts.map((part, i) =>
        REF.test(part) ? (
          <span key={i} className="whitespace-nowrap">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
