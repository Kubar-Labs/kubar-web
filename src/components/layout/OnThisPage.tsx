"use client";

import { useEffect, useRef, useState } from "react";
import { cx as cn } from "@/lib/cx";

/*
 * "On this page" index (Figma 291:3962 under Kubar Protocol's hero;
 * REDRAW-2026-11-14.md, section 12, item 5), on Kubar Protocol and How it
 * works. A ruled row: "On this page" in muted Sans/Fine, then each
 * section's name as an underlined anchor link, wrapping.
 *
 * Once the row has scrolled out of view, a small fixed "On this page"
 * button shows at the bottom right. It opens the same list in a sheet,
 * marks the current section, and closes on Escape, on a pick or on a click
 * outside. Both are fixed or in normal flow under the hero, so neither
 * changes the header's height or the pinned story's measurements.
 */
export type IndexItem = { id: string; label: string };

export function OnThisPage({ label, items, className }: { label: string; items: IndexItem[]; className?: string }) {
  const rowRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [past, setPast] = useState(false);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  // The button shows once the row has gone above the screen.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const observer = new IntersectionObserver(([entry]) => {
      const gone = !entry.isIntersecting && entry.boundingClientRect.bottom < 80;
      setPast(gone);
      if (!gone) setOpen(false);
    });
    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  // Open: mark the section the reader is in, move focus into the sheet, close on Escape or a click outside.
  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    sheet?.querySelector<HTMLElement>("[aria-current], a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!sheet?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      // The last section whose top has passed the upper third of the screen.
      const line = window.innerHeight / 3;
      let found: string | null = null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= line) found = item.id;
      }
      setCurrent(found);
    }
    setOpen(!open);
  };

  return (
    <>
      <nav ref={rowRef} aria-label={label} className={cn("flex flex-wrap items-start gap-x-7 gap-y-0.5 border-t border-rule pt-3.5", className)}>
        <p className="t-fine flex min-h-6 items-center text-ink-muted">{label}</p>
        {items.map((item) => (
          <a key={item.id} href={`#${item.id}`} className="t-ui-sm inline-flex min-h-6 items-center whitespace-nowrap text-ink underline decoration-1 [text-underline-position:from-font] hover:decoration-2">
            {item.label}
          </a>
        ))}
      </nav>

      {past ? (
        <div className="fixed right-4 bottom-4 z-30 flex flex-col items-end gap-2 md:right-6 md:bottom-6">
          {open ? (
            <div
              ref={sheetRef}
              role="dialog"
              aria-label={label}
              className="max-h-[70svh] w-[min(320px,calc(100vw-32px))] overflow-y-auto border border-rule bg-raised py-2 shadow-elevation-3"
            >
              <ul>
                {items.map((item) => {
                  const here = item.id === current;
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        aria-current={here ? "location" : undefined}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "t-ui flex min-h-11 items-center border-l-2 px-4 text-ink outline-offset-[-2px] hover:bg-action-soft",
                          here ? "border-ink bg-inset" : "border-transparent",
                        )}
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
          <button
            ref={buttonRef}
            type="button"
            aria-expanded={open}
            onClick={toggle}
            className="t-ui-sm flex min-h-11 items-center border border-rule-strong bg-raised px-4 text-ink shadow-elevation-2 hover:bg-action-soft"
          >
            {label}
          </button>
        </div>
      ) : null}
    </>
  );
}
