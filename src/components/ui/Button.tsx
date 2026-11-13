"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/icons/Icon";
import { cx as cn } from "@/lib/cx";

/*
 * Button (Figma C1 48:89). Filled petrol for the one main action in a view;
 * outline for a second action beside it (no use in the copy yet). Square
 * corners, Sans/UI label, an optional icon after the words. Hover and pressed
 * change the fill only. 48 px tall by default, 44 px in the header.
 * There is no disabled state: a form checks its fields when it is sent.
 * "Sending…" replaces the label while a form submits; the button keeps its
 * width (both labels share one grid cell) and can't be pressed again.
 * On the petrol band the tokens swap, so the filled button turns paper.
 */
type Variant = "filled" | "outline";
type Size = 48 | 44;

const variants: Record<Variant, string> = {
  filled: "bg-action text-on-action hover:bg-action-hover active:bg-action-pressed",
  outline:
    "border border-rule-control text-ink hover:bg-action-soft active:bg-action-soft active:border-ink",
};

const sizes: Record<Size, string> = {
  48: "h-12 px-5",
  44: "h-11 px-4",
};

function classes(variant: Variant, size: Size, className?: string) {
  return cn(
    "t-ui inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap",
    "transition-colors duration-(--duration-hover) ease-standard",
    variants[variant],
    sizes[size],
    className,
  );
}

type CommonProps = {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  className?: string;
  children: React.ReactNode;
};

export function ButtonLink({
  href,
  variant = "filled",
  size = 48,
  icon,
  className,
  children,
  onClick,
}: CommonProps & { href: string; onClick?: () => void }) {
  return (
    <Link href={href} className={classes(variant, size, className)} onClick={onClick}>
      {children}
      {icon ? <Icon name={icon} className="shrink-0" /> : null}
    </Link>
  );
}

type ButtonProps = CommonProps & {
  type?: "button" | "submit";
  /** The form's submit while the message is on its way. */
  sending?: boolean;
  /** The words shown while sending ("Sending…", copy deck 4.7). */
  sendingLabel?: string;
  onClick?: () => void;
};

export function Button({
  type = "button",
  variant = "filled",
  size = 48,
  icon,
  sending = false,
  sendingLabel = "Sending…",
  className,
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      aria-disabled={sending || undefined}
      onClick={(event) => {
        if (sending) {
          event.preventDefault();
          return;
        }
        onClick?.();
      }}
      className={classes(variant, size, cn(sending && "cursor-progress", className))}
    >
      <span className="grid">
        <span className={cn("col-start-1 row-start-1 inline-flex items-center gap-2", sending && "invisible")}>
          {children}
          {icon ? <Icon name={icon} className="shrink-0" /> : null}
        </span>
        {sending ? (
          <span className="col-start-1 row-start-1 text-center">
            {sendingLabel}
          </span>
        ) : null}
      </span>
    </button>
  );
}
