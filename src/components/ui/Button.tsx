import Link from "next/link";
import { cn } from "@/lib/utils";

/*
 * Button (Figma C1 48:89). Filled petrol for the one main action in a view.
 * Square corners, Sans/UI label; hover and pressed change the fill only.
 * 48 px tall by default, 44 px in the header. No disabled state.
 * Step 1 builds the filled link form the header needs; the outline style,
 * the icon slot and the form's "Sending…" state come in step 2.
 */
const base =
  "t-ui inline-flex items-center justify-center gap-2 whitespace-nowrap " +
  "bg-action text-on-action hover:bg-action-hover active:bg-action-pressed " +
  "transition-colors duration-(--duration-hover) ease-standard";

const sizes = {
  48: "h-12 px-5",
  44: "h-11 px-4",
} as const;

type ButtonLinkProps = {
  href: string;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export function ButtonLink({ href, size = 48, className, children, onClick }: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(base, sizes[size], className)} onClick={onClick}>
      {children}
    </Link>
  );
}
