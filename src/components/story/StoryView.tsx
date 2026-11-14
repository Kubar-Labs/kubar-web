"use client";

import { useEffect, useRef, useState } from "react";
import { TextLink } from "@/components/ui/TextLink";
import { reader } from "@/lib/copy";
import { cx as cn } from "@/lib/cx";

/*
 * The pinned story, option B (REDRAW-2026-11-14.md, sections 3a and 9.2;
 * prototype docs/rebuild/prototypes/pinned-story-options.html; Figma
 * 266:4120 for phones).
 *
 * Only the lanes drawing is pinned (position: sticky). The eight states are
 * cards in normal flow that scroll past it: beside the drawing at desktop,
 * below it on tablets and phones. Nothing traps or drives the scroll. A
 * state becomes current when its card crosses a line 45% of the way down the
 * space left for the text; an IntersectionObserver watches that line, not a
 * scroll handler. The current card is raised (--elevation-2); the others sit
 * flat in the secondary text colour; the change takes 200 ms.
 *
 * The drawing (Lanes) is rendered on the server and follows the
 * data-story-state set here, in CSS. Its rows are sized from the viewport in
 * svh (globals.css, .lanes). When even the smallest rows don't fit (a
 * viewport under about 545 px tall), or with prefers-reduced-motion, the
 * ledger passed as
 * `children` shows instead. Reduced motion is decided in CSS, so it holds
 * without script too; the height check needs script, and without it the
 * cards still carry every word.
 */
export type LedgerState = {
  no: string;
  state: string;
  what: string;
  party: string | null;
  data: string | null;
  money: string | null;
  /** How it works only: the documents behind the step. */
  documents?: string | null;
};

const DESKTOP = "(min-width: 1200px)";

/** The 22 px line before "Data path" and "Money path" on a card. */
function PathGlyph({ kind }: { kind: "data" | "money" }) {
  return (
    <svg aria-hidden="true" width="22" height="8" viewBox="0 0 22 8" className="shrink-0 overflow-visible">
      {kind === "data" ? (
        <line x1="0" x2="22" y1="4" y2="4" className="stroke-ink-muted" strokeWidth={1.5} strokeDasharray="5 3" />
      ) : (
        <line x1="0" x2="22" y1="4" y2="4" className="stroke-ink" strokeWidth={2} />
      )}
    </svg>
  );
}

function headerHeight() {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 0;
}

export function StoryView({
  copy,
  states,
  illustrative,
  marker,
  lanes,
  skipTo,
  variant = "home",
  closing,
  children,
}: {
  /** Id of the section after the story. */
  skipTo: string;
  /** The "story" messages. */
  copy: unknown;
  /** The eight states. */
  states: LedgerState[];
  /** The Illustrative tag and state 08's footnote marker, rendered on the server. */
  illustrative: React.ReactNode;
  marker: React.ReactNode;
  /** The lanes drawing, rendered on the server; it follows data-story-state in CSS. */
  lanes: React.ReactNode;
  /** "howItWorks": the sentence in Sans/Body, the documents in place of the party, the legend, no link to How it works. */
  variant?: "home" | "howItWorks";
  /** How it works: the line that ends the eight states on tablets and phones. */
  closing?: string;
  /** The ledger register: the fallback. */
  children: React.ReactNode;
}) {
  const t = reader(copy);
  const long = variant === "howItWorks";
  const pinRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const [state, setState] = useState(1);
  const [fits, setFits] = useState(true);

  // Do the smallest rows fit? Measured against 100svh, which stays put while
  // a phone's address bar shows and hides, so the story never flips to the
  // ledger mid-scroll.
  useEffect(() => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none";
    document.body.appendChild(probe);
    let frame = 0;
    const check = () => {
      frame = 0;
      const svh = probe.getBoundingClientRect().height;
      const ok = window.matchMedia(DESKTOP).matches
        ? (svh - headerHeight() - 64 - 48) / 8 >= 44
        : (0.45 * svh - 40 - 24) / 8 >= 22;
      setFits(ok);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    schedule();
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      probe.remove();
    };
  }, []);

  // Which state is current: the card crossing the 45% line.
  useEffect(() => {
    const list = stepsRef.current;
    if (!fits || !list) return;
    const steps = [...list.children] as HTMLElement[];
    let observer: IntersectionObserver | null = null;
    let frame = 0;
    const build = () => {
      frame = 0;
      observer?.disconnect();
      const height = window.innerHeight;
      const top = headerHeight() + (window.matchMedia(DESKTOP).matches ? 0 : (pinRef.current?.offsetHeight ?? 0));
      const line = Math.round(top + 0.45 * (height - top));
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const index = steps.indexOf(entry.target as HTMLElement);
            if (entry.isIntersecting) setState(index + 1);
            else if (index === 0 && entry.boundingClientRect.top >= line) setState(1);
            else if (index === steps.length - 1 && entry.boundingClientRect.bottom <= line) setState(steps.length);
          }
        },
        // A one-pixel band at the line.
        { rootMargin: `${-line}px 0px ${-(height - line - 1)}px 0px` },
      );
      for (const step of steps) observer.observe(step);
      list.dataset.live = "true";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(build);
    };
    schedule();
    // The line moves when the viewport resizes (an address bar too) and when the pin's height changes.
    window.addEventListener("resize", schedule);
    const pinObserver = new ResizeObserver(schedule);
    if (pinRef.current) pinObserver.observe(pinRef.current);
    return () => {
      window.removeEventListener("resize", schedule);
      pinObserver.disconnect();
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [fits]);

  const idRow = (className: string) => (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <p className="t-tag text-ink">{t("record")}</p>
      {illustrative}
    </div>
  );

  return (
    <div className="story" data-story-fits={fits ? "true" : "false"}>
      <div data-no-abbr data-story-state={state} className="story-on lg:grid lg:grid-cols-[411px_minmax(0,1fr)] lg:items-start lg:gap-x-6">
        {/* The pinned drawing. Phones and tablets pin the record's id row with it, on a
            ground that reaches the screen's edges so the cards pass under it. */}
        <div
          ref={pinRef}
          className="sticky top-(--header-height) z-10 -mx-(--page-margin) bg-page px-(--page-margin) pt-4 pb-3 lg:col-start-2 lg:row-start-1 lg:top-[calc(var(--header-height)+24px)] lg:mx-0 lg:bg-transparent lg:p-0"
        >
          {idRow("mb-3 lg:hidden")}
          {lanes}
        </div>

        <div className="flex flex-col lg:col-start-1 lg:row-start-1">
          {idRow("mb-4 hidden border-b border-rule-strong pb-2.5 lg:flex")}
          <TextLink href={`#${skipTo}`} kind="anchor" className="mt-1 mb-4 self-start lg:mt-0 lg:mb-5">
            {t("skip")}
          </TextLink>

          <ol ref={stepsRef}>
            {states.map((step, index) => {
              const n = index + 1;
              const current = n === state;
              const planned = n === 8;
              const tone = current ? "text-ink" : "text-ink-muted";
              const data = planned ? (step.data ?? t("planned")) : step.data;
              return (
                <li
                  key={step.no}
                  // Each card's slot runs to the next card, so the slots tile the
                  // column and one always holds the line. Phones and tablets: a
                  // short gap, so the current card stays in view below the
                  // drawing until the next one reaches the line. Desktop: about
                  // 60svh a state.
                  className={cn("pb-[min(96px,12svh)] lg:pb-6", n < states.length && "lg:min-h-[60svh]")}
                >
                  <div
                    aria-current={current ? "step" : undefined}
                    data-current={current ? "" : undefined}
                    className="story-card flex flex-col gap-3 border border-rule bg-raised px-[18px] pt-3.5 pb-4 lg:px-6 lg:pt-5 lg:pb-[22px]"
                  >
                    <p className="flex items-baseline justify-between gap-3">
                      <span className={cn("flex items-baseline gap-2 transition-colors duration-(--duration-disclose)", current && !planned ? "text-accent" : "text-ink-muted")}>
                        <span className="t-code">{step.no}</span>
                        <span className="t-state">
                          {step.state}
                          {planned ? marker : null}
                        </span>
                      </span>
                      <span className="t-label shrink-0 text-ink-muted">{t("counter", { n: step.no })}</span>
                    </p>
                    <p className={cn("transition-colors duration-(--duration-disclose)", long ? "t-body" : "t-ui-lg", tone)}>{step.what}</p>
                    {long && step.documents ? (
                      <div className="flex flex-col gap-0.5 border-t border-rule pt-2.5">
                        <p className="t-fine text-ink-muted">{t("documents")}</p>
                        <p className={cn("t-body-sm transition-colors duration-(--duration-disclose)", tone)}>{step.documents}</p>
                      </div>
                    ) : (
                      <p className="t-fine text-ink-muted">
                        {t("party", { party: long ? (step.party ?? "") : planned ? t("planned") : (step.party ?? "") })}
                      </p>
                    )}
                    {data ? (
                      <div className="flex flex-col gap-0.5 border-t border-rule pt-2.5">
                        <p className={cn("t-fine flex items-center gap-2 transition-colors duration-(--duration-disclose)", tone)}>
                          <PathGlyph kind="data" />
                          {t("dataPath")}
                        </p>
                        <p className={cn("t-body-sm transition-colors duration-(--duration-disclose)", tone)}>{data}</p>
                      </div>
                    ) : null}
                    {step.money ? (
                      <div className="flex flex-col gap-0.5 border-t border-rule pt-2.5">
                        <p className={cn("t-fine flex flex-wrap items-center gap-x-2 transition-colors duration-(--duration-disclose)", tone)}>
                          <PathGlyph kind="money" />
                          {t("moneyPath")}
                          <span className="text-accent">{t("holdsNone")}</span>
                        </p>
                        <p className={cn("t-body-sm transition-colors duration-(--duration-disclose)", tone)}>{step.money}</p>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Room for the last card to reach the line. */}
          <div aria-hidden="true" className="h-[25svh] lg:h-[30svh]" />
          {closing ? <p className="t-body-sm mb-6 text-ink lg:hidden">{closing}</p> : null}
          {long ? (
            <ul className="flex flex-col gap-1">
              <li className="t-fine flex items-center gap-3 text-ink-muted"><PathGlyph kind="data" />{t("legend.data")}</li>
              <li className="t-fine flex items-center gap-3 text-ink-muted"><PathGlyph kind="money" />{t("legend.money")}</li>
              <li className="t-fine flex items-center gap-3 text-ink-muted"><span aria-hidden="true" className="h-2 w-[22px] shrink-0 bg-action" />{t("legend.kubar")}</li>
            </ul>
          ) : (
            <TextLink href="/how-it-works" kind="arrow" className="self-start">
              {t("seeHow")}
            </TextLink>
          )}
        </div>
      </div>

      {/* The ledger: shown instead with reduced motion or on a very short screen. */}
      <div className="story-ledger">{children}</div>
    </div>
  );
}
