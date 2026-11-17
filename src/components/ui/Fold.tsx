"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { cx as cn } from "@/lib/cx";

/*
 * A long list shown in part (SPEC section 8, pacing): the first items show and
 * a control under the list opens the rest in place. Questions on Kubar
 * Protocol (four of eleven); Terms on How it works use it too.
 *
 * - Each folded item carries data-folded. While <html> has data-js (set by
 *   the layout's first script, before anything is painted) they are hidden, so
 *   nothing moves as the page loads. Without script every item shows and the
 *   control is hidden (globals.css).
 * - The control takes one press: it goes, and focus moves to the first item
 *   that was folded (its first visible link or button, else the item itself).
 * - A link to something inside a folded item (the address's #hash on landing,
 *   or one followed later) opens the list first, then goes there.
 */
export function useFold<T extends HTMLElement, F extends HTMLElement>() {
  const list = useRef<T>(null);
  const first = useRef<F>(null);
  const [open, setOpen] = useState(false);
  // What to do once the folded items are drawn: focus the first, or go to a link's target.
  const after = useRef<{ focus: true } | { target: HTMLElement } | null>(null);

  useEffect(() => {
    if (open) return;
    const reveal = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target || !list.current?.contains(target) || !target.closest("[data-folded]")) return;
      after.current = { target };
      setOpen(true);
    };
    // A frame later, so the page has hydrated and React takes the state change as an update.
    const frame = requestAnimationFrame(reveal);
    window.addEventListener("hashchange", reveal);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", reveal);
    };
  }, [open]);

  useEffect(() => {
    const next = after.current;
    if (!open || !next) return;
    after.current = null;
    if ("target" in next) {
      next.target.scrollIntoView({ block: "start" });
      return;
    }
    const item = first.current;
    if (!item) return;
    const control = [...item.querySelectorAll<HTMLElement>("a[href], button")].find((el) => el.getClientRects().length > 0);
    (control ?? item).focus();
  }, [open]);

  const show = () => {
    after.current = { focus: true };
    setOpen(true);
  };

  return { list, first, open, show };
}

/** The control under a folded list: underlined words and a plus, like "How we estimate this". */
export function FoldControl({ label, onShow, className }: { label: string; onShow: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onShow}
      className={cn("fold-control group t-ui inline-flex min-h-11 items-center gap-2 self-start text-left text-ink lg:min-h-10", className)}
    >
      <span className="underline decoration-1 [text-underline-position:from-font] group-hover:decoration-2">{label}</span>
      <Icon name="plus" className="shrink-0" />
    </button>
  );
}
