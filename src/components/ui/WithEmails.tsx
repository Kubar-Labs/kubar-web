/*
 * Turns every email address in a line of copy into a mailto link. An address
 * that is the whole line stands alone, so it takes the 44 px tap area on
 * touch screens (REDRAW-2026-11-14.md, section 13 B9); one inside a sentence
 * doesn't.
 */
const EMAIL = /([a-z0-9._-]+@kubar\.tech)/gi;

export function WithEmails({ text }: { text: string }) {
  const alone = text.trim().replace(EMAIL, "") === "";
  return (
    <>
      {text.split(EMAIL).map((part, i) =>
        i % 2 === 1 ? (
          <a key={i} href={`mailto:${part}`} className={alone ? "link-ink tap-area inline-block" : "link-ink"}>
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}
