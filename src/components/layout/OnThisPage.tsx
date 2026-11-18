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
 * outside. While a link, a button, a field or the footer is under it, the
 * button steps aside, so it never covers something a reader would press.
 * Both are fixed or in normal flow under the hero, so neither
 * changes the header's height or the pinned story's measurements.
 */
export type IndexItem = { id: string; label: string };

/** Anything a reader could press, and the footer: the fixed button never sits over one. */
const PRESSABLE = "a, button, input, select, textarea, summary, label, [tabindex]:not(main), [role='button'], footer";

export function OnThisPage({ label, items, className }: { label: string; items: IndexItem[]; className?: string }) {
  const rowRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [past, setPast] = useState(false);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [covering, setCovering] = useState(false);
  const floatRef = useRef<HTMLDivElement>(null);

  // The button shows once the row has gone above the screen. Measured on scroll, not with an
  // IntersectionObserver: a jump from below the row to past it (an anchor, a restored scroll
  // position, End) never crosses an intersection threshold, so an observer would not answer it.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      const gone = row.getBoundingClientRect().bottom < 80;
      setPast(gone);
      if (!gone) setOpen(false);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // The button never sits over a link, a button or a field, and stays clear of the footer:
  // while one of them is under it, it steps aside.
  useEffect(() => {
    if (!past || open) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      const button = buttonRef.current;
      if (!button) return;
      // While the button holds focus it stays, so a keyboard reader never loses sight of it.
      if (document.activeElement === button) {
        setCovering(false);
        return;
      }
      const box = button.getBoundingClientRect();
      let hit = false;
      for (const el of document.querySelectorAll(PRESSABLE)) {
        if (floatRef.current?.contains(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && r.left < box.right && r.right > box.left && r.top < box.bottom && r.bottom > box.top) {
          hit = true;
          break;
        }
      }
      setCovering(hit);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    schedule();
    // The page moves under the button on scroll and resize, and when something opens or reflows.
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("click", schedule);
    document.addEventListener("focusin", schedule);
    document.addEventListener("focusout", schedule);
    const resized = new ResizeObserver(schedule);
    resized.observe(document.body);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("click", schedule);
      document.removeEventListener("focusin", schedule);
      document.removeEventListener("focusout", schedule);
      resized.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [past, open]);

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
        <div
          ref={floatRef}
          className={cn(
            "fixed right-4 bottom-4 z-30 flex flex-col items-end gap-2 transition-opacity duration-(--duration-hover) md:right-6 md:bottom-6",
            covering && !open && "pointer-events-none opacity-0",
          )}
        >
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
            tabIndex={covering && !open ? -1 : undefined}
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
