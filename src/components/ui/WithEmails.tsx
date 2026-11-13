/* Turns every email address in a line of copy into a mailto link. */
const EMAIL = /([a-z0-9._-]+@kubar\.tech)/gi;

export function WithEmails({ text }: { text: string }) {
  return (
    <>
      {text.split(EMAIL).map((part, i) =>
        i % 2 === 1 ? (
          <a key={i} href={`mailto:${part}`} className="link-ink">
            {part}
          </a>
        ) : (
          part
        ),
      )}
    </>
  );
}
