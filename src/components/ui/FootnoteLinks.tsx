"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/*
 * Footnote behaviour that needs script (REDRAW-2026-11-14.md, sections 9.5
 * and 9.6), for every page:
 * - Following a marker into a closed disclosure opens it and moves focus to
 *   the footnote. Without script the reader lands on the closed disclosure.
 * - One footnote can have several markers, so its "Back to text" is pointed
 *   at the marker the reader followed.
 */
export function FootnoteLinks() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const marker = (event.target as Element | null)?.closest?.<HTMLAnchorElement>("a.footnote-marker");
      if (!marker) return;
      const id = decodeURIComponent(marker.hash.slice(1));
      const footnote = document.getElementById(id);
      if (!footnote) return;
      const back = footnote.querySelector<HTMLAnchorElement>("a[data-footnote-back]");
      if (back && marker.id) back.href = `#${marker.id}`;
      const disclosure = footnote.closest("details");
      if (disclosure && !disclosure.open) {
        disclosure.open = true;
        // Let the disclosure lay out, then land on the footnote and focus it.
        requestAnimationFrame(() => footnote.focus({ preventScroll: true }));
      } else {
        requestAnimationFrame(() => footnote.focus({ preventScroll: true }));
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return null;
}
