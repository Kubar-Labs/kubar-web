"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { abbreviationPattern, nextAbbreviation } from "@/lib/abbreviations";

/*
 * Abbreviation (Figma C1 95:438; HANDOFF section 8). On its first use on
 * each page an abbreviation carries its expansion: it keeps the surrounding
 * text's style with a dotted underline in muted ink, and a white tooltip
 * opens below it on hover, on keyboard focus and on tap. The tooltip stays
 * while the pointer is over it and closes with Escape (WCAG 1.4.13); it is
 * the element's description for screen readers. Later uses are plain text.
 *
 * The approved copy stays untouched in the messages: after the page has
 * hydrated, this walks the visible text of <main> and marks the first use of
 * each abbreviation. It leaves alone links, buttons, form controls, headings,
 * row and column headers, and anything inside [data-no-abbr] (text React
 * rewrites: the story panel, the record's Proves line, the form).
 */
const SKIP = "a, button, select, textarea, input, label, h1, h2, h3, h4, th, abbr, script, style, .sr-only, [data-no-abbr], [aria-hidden='true']";

// The DOM's Text node (the Workers types in this project shadow the global name).
type TextNode = Node & { data: string; splitText(offset: number): TextNode; replaceWith(...nodes: Node[]): void };

function unmark(root: HTMLElement) {
  for (const abbr of root.querySelectorAll("abbr[data-abbr]")) {
    abbr.replaceWith(document.createTextNode(abbr.firstChild?.textContent ?? ""));
  }
}

function mark(root: HTMLElement, expansions: Record<string, string>) {
  const pattern = abbreviationPattern(Object.keys(expansions));
  const seen = new Set<string>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest(SKIP)) return NodeFilter.FILTER_REJECT;
      if (parent.getClientRects().length === 0) return NodeFilter.FILTER_REJECT; // not shown at this width
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: TextNode[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as TextNode);

  let count = 0;
  for (let node of nodes) {
    for (let found = nextAbbreviation(node.data, pattern, seen); found; found = nextAbbreviation(node.data, pattern, seen)) {
      seen.add(found.key);
      const word = node.splitText(found.index);
      const rest = word.splitText(found.length);
      const id = `abbr-tip-${count++}`;
      const abbr = document.createElement("abbr");
      abbr.dataset.abbr = found.key;
      abbr.tabIndex = 0;
      abbr.setAttribute("aria-describedby", id);
      abbr.className = "abbr";
      const tip = document.createElement("span");
      tip.id = id;
      tip.setAttribute("role", "tooltip");
      tip.className = "abbr-tip";
      tip.textContent = expansions[found.key];
      word.replaceWith(abbr);
      abbr.appendChild(word);
      abbr.appendChild(tip);
      node = rest;
    }
  }
}

export function AbbreviationTips({ expansions }: { expansions: Record<string, string> }) {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.getElementById("main-content");
    if (!root) return;
    const desktop = window.matchMedia("(min-width: 1200px)");
    let frame = 0;
    const run = () => {
      unmark(root);
      mark(root, expansions);
    };
    // After hydration has settled, so React never meets nodes it didn't render.
    const start = window.setTimeout(run, 300);
    const rerun = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(run);
    };
    desktop.addEventListener("change", rerun);

    const open = (event: Event) => {
      const abbr = (event.target as Element).closest?.("abbr[data-abbr]") as HTMLElement | null;
      if (!abbr) return;
      abbr.dataset.open = "";
      const tip = abbr.lastElementChild as HTMLElement;
      // Keep the tooltip inside the viewport.
      tip.style.left = "0px";
      const over = tip.getBoundingClientRect().right - (document.documentElement.clientWidth - 16);
      if (over > 0) tip.style.left = `${-over}px`;
    };
    const close = (event: Event) => {
      const abbr = (event.target as Element).closest?.("abbr[data-abbr]") as HTMLElement | null;
      if (!abbr) return;
      if (event.type === "mouseout" && abbr.contains((event as MouseEvent).relatedTarget as Node)) return;
      if (event.type === "mouseout" && abbr === document.activeElement) return;
      delete abbr.dataset.open;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      for (const abbr of root.querySelectorAll<HTMLElement>("abbr[data-open]")) delete abbr.dataset.open;
    };
    root.addEventListener("mouseover", open);
    root.addEventListener("focusin", open);
    root.addEventListener("click", open);
    root.addEventListener("mouseout", close);
    root.addEventListener("focusout", close);
    document.addEventListener("keydown", escape);
    return () => {
      window.clearTimeout(start);
      cancelAnimationFrame(frame);
      desktop.removeEventListener("change", rerun);
      root.removeEventListener("mouseover", open);
      root.removeEventListener("focusin", open);
      root.removeEventListener("click", open);
      root.removeEventListener("mouseout", close);
      root.removeEventListener("focusout", close);
      document.removeEventListener("keydown", escape);
    };
  }, [pathname, expansions]);

  return null;
}
