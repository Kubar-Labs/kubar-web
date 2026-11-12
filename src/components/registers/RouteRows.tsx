import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils";

/*
 * Route rows (Figma C2 73:476): the hero's two routes. Each row is one link
 * (the whole row is the target), Sans/UI large in ink with the arrow at the
 * right end, a 1 px strong rule above; the group closes with one too.
 * Hover takes the row-hover ground; focus adds the rani ring.
 */
export type Route = { label: string; href: string };

export function RouteRows({ routes, className }: { routes: Route[]; className?: string }) {
  return (
    <ul className={cn("border-b border-rule-strong", className)}>
      {routes.map((route) => (
        <li key={route.href} className="border-t border-rule-strong">
          <Link
            href={route.href}
            className="t-ui-lg flex items-center justify-between gap-4 py-4 text-ink transition-colors duration-(--duration-hover) ease-standard hover:bg-action-soft"
          >
            {route.label}
            <Icon name="arrow-right" className="shrink-0" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
