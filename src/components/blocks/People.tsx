import Image from "next/image";
import { cn } from "@/lib/utils";

/*
 * Person card, Compact (Figma C4 23:64) and the Home people row.
 * Portrait 4:5 in colour, square corners (nothing changes colour on hover);
 * the name with a small up-right arrow, the role in Mono/Tag. The whole card
 * links to the person's LinkedIn and opens in a new tab. Six across at
 * desktop; below desktop a sideways-scrolling row of 193 px cards.
 */
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
        "flex gap-4 max-lg:-mx-(--page-margin) max-lg:snap-x max-lg:overflow-x-auto max-lg:px-(--page-margin) max-lg:pb-2 lg:grid lg:grid-cols-6 lg:gap-6",
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
            <Image
              src={`/people/${person.id}.jpg`}
              alt={`${person.name}, ${person.role}`}
              width={800}
              height={1000}
              sizes="(min-width: 1200px) 193px, 193px"
              className="aspect-4/5 w-full bg-inset object-cover"
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
              <span className="t-tag text-ink-muted">{person.role}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/*
 * Person card, Full (Figma C4 23:64), About "The team.": the portrait
 * (302 wide, 4:5, colour), the name, the role in Mono/Tag, one line, and a
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
        <li key={person.id} className="flex flex-col">
          <Image
            src={`/people/${person.id}.jpg`}
            alt=""
            width={800}
            height={1000}
            sizes="302px"
            className="aspect-4/5 w-full bg-inset object-cover"
          />
          <div className="flex flex-col items-start gap-1.5 pt-4">
            <h3 className="t-ui text-ink">{person.name}</h3>
            <p className="t-tag text-ink-muted">{person.role}</p>
            <p className="t-body-sm text-ink">{person.line}</p>
            <a
              href={person.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={linkLabel(person.name)}
              className="t-ui-sm group mt-1 inline-flex min-h-6 items-center gap-1 text-ink"
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
