"use client";

import { useEffect, useRef, useState } from "react";
import { FoldControl } from "@/components/ui/FoldControl";

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
 *
 * FoldOpen (FoldOpen.tsx) does the same for a list rendered on the server
 * (How it works' terms): its folded items carry data-folded from the start,
 * and opening sets data-open around them, so the browser only runs the
 * control. The two live apart, so a page loads only the one it uses.
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
    // Now shown, its items' first uses of abbreviations can take their expansions (AbbreviationTips).
    if (open) document.dispatchEvent(new Event("unfold"));
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

export { FoldControl };
