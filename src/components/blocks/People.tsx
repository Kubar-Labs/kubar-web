import { cn } from "@/lib/utils";

/*
 * Person card, Compact (Figma C4 23:64) and the Home people row.
 * Portrait 4:5 on a transparent background, square corners, greyscale at
 * rest and in colour on hover and keyboard focus of the card, over 200 ms
 * (no transition with reduced motion; REDRAW-2026-11-14.md, section 9.9).
 * The name with a small up-right arrow, the role in Sans/Fine. The whole card
 * links to the person's LinkedIn and opens in a new tab. Six across at
 * desktop; below desktop a sideways-scrolling row of 193 px cards.
 *
 * Portraits go through Next's image optimiser (AVIF or WebP at the size the
 * layout needs) with a hand-written srcset on a plain <img>: importing
 * next/image, even for getImageProps, puts its script in the browser bundle
 * (HANDOFF section 11). The widths are ones the optimiser accepts by default
 * and the quality is one next.config.ts allows.
 */
const PORTRAIT_WIDTHS = [256, 384, 640, 828];
const optimised = (id: string, width: number) => `/_next/image?url=${encodeURIComponent(`/people/${id}.png`)}&w=${width}&q=75`;

/** `colour`: the group classes that bring the card's portrait into colour. */
function Portrait({ id, alt, sizes, colour }: { id: string; alt: string; sizes: string; colour: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={optimised(id, 828)}
      srcSet={PORTRAIT_WIDTHS.map((width) => `${optimised(id, width)} ${width}w`).join(", ")}
      sizes={sizes}
      alt={alt}
      width={800}
      height={1000}
      loading="lazy"
      decoding="async"
      className={cn(
        "aspect-4/5 w-full object-cover grayscale transition-[filter] duration-(--duration-disclose) ease-standard motion-reduce:transition-none",
        colour,
      )}
    />
  );
}

export type Person = { id: string; name: string; role: string; linkedin: string };

export function PeopleRow({
  people,
  linkLabel,
  className,
}: {
  people: Person[];
  /** Accessible name for a card's link, given the person's name. */
  linkLabel: (name: string) => string;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "flex gap-4 max-lg:-mx-(--page-margin) max-lg:snap-x max-lg:overflow-x-auto max-lg:scroll-px-(--page-margin) max-lg:px-(--page-margin) max-lg:pb-2 lg:grid lg:grid-cols-6 lg:gap-6",
        className,
      )}
    >
      {people.map((person) => (
        <li key={person.id} className="w-[193px] shrink-0 snap-start lg:w-auto">
          <a
            href={person.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={linkLabel(person.name)}
            className="group flex flex-col"
          >
            <Portrait
              id={person.id}
              alt={`${person.name}, ${person.role}`}
              sizes="(min-width: 1200px) 193px, 193px"
              colour="group-hover:grayscale-0 group-focus-visible:grayscale-0"
            />
            <span className="flex flex-col gap-1 pt-3">
              <span className="flex items-center gap-1">
                <span className="t-ui text-ink decoration-1 [text-underline-position:from-font] group-hover:underline">
                  {person.name}
                </span>
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="square" aria-hidden="true" className="shrink-0 text-ink-muted">
                  <path d="M4.8 11.2L11.2 4.8M11.2 10.4V4.8H5.6" />
                </svg>
              </span>
              <span className="t-fine text-ink-muted">{person.role}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/*
 * Person card, Full (Figma C4 23:64), About "The team.": the portrait
 * (302 wide, 4:5; greyscale until the card is hovered or its link has
 * focus), the name, the role in Sans/Fine, one line, and a
 * LinkedIn link that opens in a new tab. Three across at desktop, two at
 * tablet; on mobile the cards stack and stay 302 wide.
 */
export type FullPerson = Person & { line: string };

export function PeopleCards({
  people,
  linkedin,
  linkLabel,
  className,
}: {
  people: FullPerson[];
  linkedin: string;
  linkLabel: (name: string) => string;
  className?: string;
}) {
  return (
    <ul className={cn("grid max-w-[302px] grid-cols-1 gap-x-6 gap-y-12 md:max-w-[628px] md:grid-cols-2 lg:max-w-[954px] lg:grid-cols-3", className)}>
      {people.map((person) => (
        // Not a tab stop: a tap focuses the card, which is what brings its portrait into colour on a
        // touch screen at any width (hover never fires there). The LinkedIn link is the card's stop.
        <li key={person.id} tabIndex={-1} className="group/card flex flex-col outline-offset-4">
          <Portrait id={person.id} alt="" sizes="302px" colour="group-hover/card:grayscale-0 group-focus-within/card:grayscale-0" />
          <div className="flex flex-col items-start gap-1.5 pt-4">
            <h3 className="t-ui text-ink">{person.name}</h3>
            <p className="t-fine text-ink-muted">{person.role}</p>
            <p className="t-body-sm text-ink">{person.line}</p>
            <a
              href={person.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={linkLabel(person.name)}
              className="tap-area t-ui-sm group mt-1 inline-flex min-h-6 items-center gap-1 text-ink"
            >
              <span className="underline decoration-1 [text-underline-position:from-font] group-hover:decoration-2">{linkedin}</span>
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="square" aria-hidden="true" className="shrink-0">
                <path d="M4.8 11.2L11.2 4.8M11.2 10.4V4.8H5.6" />
              </svg>
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
