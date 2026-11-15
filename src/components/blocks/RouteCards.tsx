import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { TextLink } from "@/components/ui/TextLink";
import { cn } from "@/lib/utils";

/*
 * Contact routes on Home (Figma 244:3370 in Home · 1440, 248:3625 at 768,
 * 248:4109 at 390; REDRAW-2026-11-14.md, Home "Contact"). The first two
 * routes are raised cards, each one link: who you are in muted Sans/Body,
 * the next step in Heading/H3 with an arrow. The financial-institution card
 * is petrol and sits at --elevation-3; the trade-platform card is white at
 * --elevation-2. Both rise on hover, focus or tap (lift-card, globals.css).
 * The investor and press routes follow as two small link rows. Side by side
 * from tablet up; one under another on phones.
 */
export type HomeRoute = { who: string; step: string; href: string };

export function RouteCards({ routes, className }: { routes: HomeRoute[]; className?: string }) {
  const cards = routes.slice(0, 2);
  const rows = routes.slice(2);
  return (
    <div className={cn("flex flex-col gap-6 lg:gap-8", className)}>
      <ul className="grid gap-4 md:grid-cols-2 lg:gap-6">
        {cards.map((route, index) => {
          const petrol = index === 0;
          return (
            <li key={route.href} className="flex">
              <Link
                href={route.href}
                data-ground={petrol ? "petrol" : undefined}
                className={cn(
                  "lift-card flex h-[176px] w-full flex-col justify-between border border-rule px-6 pt-5 pb-6 md:h-[208px] lg:h-[232px] lg:px-7 lg:pt-6 lg:pb-7",
                  petrol ? "bg-page [--lift-rest:var(--elevation-3)]" : "bg-raised",
                )}
              >
                <span className="t-body text-ink-muted">{route.who}</span>
                <span className="flex items-end gap-4">
                  <span className="t-h3 min-w-0 flex-1 text-ink">{route.step}</span>
                  <Icon name="arrow-right" className="shrink-0 text-ink" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <ul className="grid gap-4 md:grid-cols-2 lg:gap-6">
        {rows.map((route) => (
          <li key={route.href} className="flex items-center justify-between gap-4 border-t border-rule pt-4">
            <span className="t-ui text-ink">{route.who}</span>
            <TextLink href={route.href} kind="arrow">
              {route.step}
            </TextLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
