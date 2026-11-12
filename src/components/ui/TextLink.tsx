import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils";

/*
 * Link (Figma C1 52:113). Ink, underlined 1 px at rest and 2 px on hover, no
 * colour change. Kinds: Arrow (another page), Anchor (down this page),
 * External (leaves kubar.tech, new tab, up-right arrow, "(opens in a new
 * tab)" in its accessible name) and Plain (footer lists, legal links).
 * Every link is at least 24 px tall.
 */
type Kind = "arrow" | "anchor" | "external" | "plain";

const kindIcon = {
  arrow: "arrow-right",
  anchor: "arrow-down",
  external: "arrow-up-right",
  plain: null,
} as const;

type TextLinkProps = {
  href: string;
  kind?: Kind;
  size?: "regular" | "large";
  /** Full accessible name, when it must say more than the visible words. */
  label?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export function TextLink({
  href,
  kind = "plain",
  size = "regular",
  label,
  className,
  children,
  onClick,
}: TextLinkProps) {
  const icon = kindIcon[kind];
  const classes = cn(
    "group inline-flex min-h-6 items-center gap-2 py-0.5 text-ink",
    size === "large" ? "t-ui-lg" : "t-ui",
    className,
  );
  const words = (
    <span className="underline decoration-1 [text-underline-position:from-font] transition-[text-decoration-thickness] duration-(--duration-hover) ease-standard group-hover:decoration-2">
      {children}
    </span>
  );
  const content = (
    <>
      {words}
      {icon ? <Icon name={icon} className="shrink-0" /> : null}
    </>
  );

  if (kind === "external") {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={classes}>
        {content}
      </a>
    );
  }
  if (href.startsWith("mailto:") || href.startsWith("#")) {
    return (
      <a href={href} aria-label={label} className={classes} onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} aria-label={label} className={classes} onClick={onClick}>
      {content}
    </Link>
  );
}
