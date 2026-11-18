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
 * scroll handler. (Home on phones puts the line lower, so the current card is
 * never under the drawing: see the observer below.) The current card is raised (--elevation-2); the others sit
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
 *
 * NavDhan SDK ("sdk", step 10) pins its three lanes (RunLanes) the same way,
 * with five cards: "01 of 05" and the step's sentence. Its skip link sits
 * above the lanes, pinned with them; it has no record row. Without script
 * its register shows instead (globals.css), so the drawing is complete.
 *
 * The last state holds with the drawing still pinned for at least 200 px of
 * scroll (18 Nov), at every size where it pins: the last card's slot is
 * measured here to be that long (--last-room; globals.css, .story-last), and
 * on phones, where Home's and NavDhan SDK's drawing lets go as the last card
 * reaches it, it lets go later where that would come sooner (--release).
 * How the other states turn current is unchanged.
 */
export type LedgerState = {
  no: string;
  state: string;
  what: string;
  party: string | null;
  data: string | null;
  money: string | null;
};

const DESKTOP = "(min-width: 1024px)";
const TABLET = "(min-width: 768px)";
/** Where the content reaches 1040 px: How it works pins the relying lines with its stack from here. */
const WIDE = "(min-width: 1200px)";
const PHONE = "(max-width: 767.98px)";
/** The scroll the last state holds with the drawing pinned: 200 px and some to spare on laptops and
 * tablets; on phones only what is needed past 200, since the last card then passes under the drawing. */
const HOLD = 240;
const PHONE_HOLD = 204;

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

/** 100svh in px: the screen's height with a phone's address bar shown, which stays put as it hides. */
function smallViewportHeight() {
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none";
  document.body.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  return height;
}

export function StoryView({
  copy,
  states,
  marker,
  lanes,
  skipTo,
  variant = "home",
  closing,
  after,
  children,
}: {
  /** Id of the section after the story. */
  skipTo: string;
  /** The "story" messages. */
  copy: unknown;
  /** The eight states. */
  states: LedgerState[];
  /** State 08's footnote marker, rendered on the server (Home and How it works). */
  marker?: React.ReactNode;
  /** The lanes drawing, rendered on the server; it follows data-story-state in CSS. */
  lanes: React.ReactNode;
  /**
   * "howItWorks": the sentence in Sans/Body, and the evidence stack as the pinned drawing (sized by
   * its own rule). "sdk": NavDhan SDK's five steps beside its lanes, the skip link above them.
   */
  variant?: "home" | "howItWorks" | "sdk";
  /** What follows the cards, under the drawing's column at desktop. */
  after?: React.ReactNode;
  /** How it works: the line that ends the eight states on tablets and phones. */
  closing?: string;
  /** The ledger register: the fallback. */
  children: React.ReactNode;
}) {
  const t = reader(copy);
  const long = variant === "howItWorks";
  const sdk = variant === "sdk";
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
      // The lanes need their smallest rows; the evidence stack its smallest height (globals.css,
      // .story-stack). NavDhan SDK (globals.css, .story[data-variant="sdk"]): on laptops rows of at
      // least 56 px under the header, 24 px, the skip link (44) and the party row (92), with 24 px
      // to spare; below, the pinned link and lanes at their smallest (328 px on phones, 416 on
      // tablets) must leave 240 px for the cards.
      const ok = window.matchMedia(DESKTOP).matches
        ? long
          ? window.matchMedia(WIDE).matches
            ? svh - headerHeight() - 256 >= 250
            : svh - headerHeight() - 110 >= 346
          : sdk
            ? (svh - headerHeight() - 184) / 5 >= 56
            : (svh - headerHeight() - 64 - 48) / 8 >= 44
        : sdk
          ? svh - headerHeight() - (window.matchMedia(TABLET).matches ? 416 : 328) >= 240
          : long && !window.matchMedia(TABLET).matches
            ? // On a phone the pinned stack and its list would take over half of a short screen.
              svh >= 620
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
  }, [long, sdk]);

  // Which state is current: the card crossing the 45% line.
  useEffect(() => {
    const list = stepsRef.current;
    const story = list?.closest<HTMLElement>(".story");
    const pin = pinRef.current;
    if (!fits || !list || !story || !pin) return;
    const steps = [...list.children] as HTMLElement[];
    const last = steps[steps.length - 1];
    let observer: IntersectionObserver | null = null;
    let frame = 0;
    const build = () => {
      frame = 0;
      observer?.disconnect();
      const height = window.innerHeight;
      const top = headerHeight() + (window.matchMedia(DESKTOP).matches ? 0 : pin.offsetHeight);
      // Home and NavDhan SDK on phones: a card turns current one slot's height below the drawing, so the card
      // before it is still clear of the drawing when it hands over; never lower than 48 px above
      // the foot of the screen. Everywhere else: 45% of the way down the space left for the text.
      const phone = !long && window.matchMedia(PHONE).matches;
      const tallest = Math.max(...steps.slice(0, -1).map((step) => step.offsetHeight));
      const lineAt = (screen: number) => Math.round(phone ? top + Math.min(screen - top - 48, tallest) : top + 0.45 * (screen - top));
      const line = lineAt(height);
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

      // The last state turns current as its card reaches the line and holds until the drawing lets
      // go: when the cards' column ends under it (laptops and tablets), or as the last card reaches
      // it (Home and NavDhan SDK on phones). Reckoned on 100svh, so the room doesn't change as an
      // address bar shows and hides; the line only moves lower then, and the state holds longer.
      const reach = lineAt(smallViewportHeight()) - (parseFloat(getComputedStyle(pin).top) || 0) - pin.offsetHeight;
      if (phone) {
        story.style.setProperty("--release", `${last.offsetHeight - Math.max(0, PHONE_HOLD - reach)}px`);
        story.style.setProperty("--last-room", "0px");
      } else {
        story.style.setProperty("--last-room", `${Math.ceil(HOLD - reach)}px`);
      }
      list.dataset.live = "true";
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(build);
    };
    schedule();
    // The line moves when the viewport resizes (an address bar too) and when the pin's height changes;
    // the release on phones follows the last card's height (see the pin below).
    window.addEventListener("resize", schedule);
    const pinObserver = new ResizeObserver(schedule);
    pinObserver.observe(pin);
    const lastObserver = new ResizeObserver(schedule);
    lastObserver.observe(last);
    return () => {
      window.removeEventListener("resize", schedule);
      pinObserver.disconnect();
      lastObserver.disconnect();
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [fits, long]);

  const idRow = (className: string) => <p className={cn("t-tag text-ink", className)}>{t("record")}</p>;

  return (
    <div className="story" data-variant={variant} data-story-fits={fits ? "true" : "false"} style={{ ["--release" as string]: "203px" }}>
      <div data-no-abbr data-story-state={state} className="story-on">
        {/* The drawing and the cards share a box that ends with the last card,
            so the drawing stops being pinned as the last card leaves. NavDhan SDK
            (331:1202): 400 px cards, 64 from the lanes; 340 and 32 below 1200, so
            the lanes keep the room their labels need. */}
        <div
          className={cn(
            "lg:grid lg:items-start",
            sdk
              ? "lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-x-8 xl:grid-cols-[400px_minmax(0,1fr)] xl:gap-x-12 min-[1280px]:gap-x-16"
              : long
                ? "lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-x-6 xl:grid-cols-[411px_minmax(0,1fr)]"
                : "lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-x-6 xl:grid-cols-[411px_minmax(0,1fr)]",
          )}
        >
          {/* The pinned drawing. Phones and tablets pin the record's id row with it (NavDhan
              SDK its skip link, at every width), on a ground that reaches the screen's edges
              and fades out over its last 24 px, so the cards pass under it (story-pin, globals.css). */}
          <div
            ref={pinRef}
            className={cn(
              "story-pin @container sticky top-(--header-height) z-10 -mx-(--page-margin) bg-page px-(--page-margin) pt-4 pb-3 lg:col-start-2 lg:row-start-1 lg:top-[calc(var(--header-height)+24px)] lg:mx-0 lg:bg-transparent lg:p-0",
              // Home and NavDhan SDK on phones: the drawing lets go as the last card reaches it, not after the card
              // has slid under it. A sticky box may not leave its container by its margin, so a
              // bottom margin the height of the last card releases it that much sooner; the cards'
              // column takes the same margin back, and the layout is unchanged. On a short phone the
              // margin is less, so the last state still holds for 200 px (--release, set above).
              !long && "max-md:mb-(--release)",
            )}
          >
            {sdk ? (
              // NavDhan SDK: the skip link above the lanes, pinned with them.
              <div className="mb-3 flex lg:mb-5">
                <TextLink href={`#${skipTo}`} kind="anchor">
                  {t("skip")}
                </TextLink>
              </div>
            ) : (
              idRow("mb-3 lg:hidden")
            )}
            {lanes}
          </div>

          {/* NavDhan SDK: on laptops the first card starts beside the lanes' first row, under the
              skip link and the party boxes, so the first state too holds with the lanes pinned, as
              Home's does under its record row and skip link. */}
          <div className={cn("flex flex-col lg:col-start-1 lg:row-start-1", !long && "max-md:-mt-(--release)", sdk && "lg:pt-[calc(44px+var(--run-party-h))]")}>
            {sdk ? null : (
              <>
                {idRow("mb-4 hidden border-b border-rule-strong pb-2.5 lg:block")}
                {/* Home's link has no arrow (section 13 B3); How it works keeps the frame's. */}
                <TextLink href={`#${skipTo}`} kind={long ? "anchor" : "plain"} className="tap-area mt-1 mb-4 self-start lg:mt-0 lg:mb-5">
                  {t("skip")}
                </TextLink>
              </>
            )}

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
                    // drawing until the next one reaches the line. Laptops: a slot is
                    // the scroll its state holds for. Home gives each 36svh, a little
                    // over a third of the screen, which keeps the section short; How
                    // it works, whose cards are long, about 60svh. The last slot is
                    // long enough that its state holds for 200 px with the drawing still
                    // pinned (story-last: measured above, with a floor in globals.css).
                    // NavDhan SDK's cards step as Home's.
                    className={cn(
                      "lg:pb-6",
                      n < states.length
                        ? long
                          ? "pb-[min(96px,12svh)] lg:min-h-[60svh]"
                          : // Home on phones: 8 px between cards, and from the second state on a slot of
                            // at least a third of the screen, which is the scroll its state holds for.
                            cn("pb-2 md:pb-[min(96px,12svh)] lg:min-h-[36svh]", n > 1 && "max-md:min-h-[calc(100svh/3)]")
                        : "story-last",
                    )}
                  >
                    <div
                      aria-current={current ? "step" : undefined}
                      data-current={current ? "" : undefined}
                      className={cn("story-card flex flex-col gap-3 border border-rule bg-raised", sdk ? "p-5 lg:p-6" : "px-[18px] pt-3.5 pb-4 lg:px-6 lg:pt-5 lg:pb-[22px]")}
                    >
                      {sdk ? (
                        // NavDhan SDK (331:1202): "01 of 05", rani while current, and the step's sentence.
                        <>
                          <p className={cn("t-tag transition-colors duration-(--duration-disclose)", current ? "text-accent" : "text-ink-muted")}>
                            {t("counter", { n: step.no })}
                          </p>
                          <p className={cn("t-body-lg transition-colors duration-(--duration-disclose)", tone)}>{step.what}</p>
                        </>
                      ) : (
                        <>
                          <p className="flex items-baseline justify-between gap-3">
                            <span className={cn("t-state transition-colors duration-(--duration-disclose)", current && !planned ? "text-accent" : "text-ink-muted")}>
                              {step.state}
                              {planned ? marker : null}
                            </span>
                            <span className="t-label shrink-0 text-ink-muted">{t("counter", { n: step.no })}</span>
                          </p>
                          <p className={cn("transition-colors duration-(--duration-disclose)", long ? "t-body" : "t-ui-lg", tone)}>{step.what}</p>
                          {/* Each sentence names who acts; on How it works the stack's labels carry the documents. */}
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
                                <span className="text-ink-muted">{t("holdsNone")}</span>
                              </p>
                              <p className={cn("t-body-sm transition-colors duration-(--duration-disclose)", tone)}>{step.money}</p>
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {closing ? <p className="t-body-sm pt-2 text-ink lg:hidden">{closing}</p> : null}
        {after ? <div className={cn("pt-6 lg:pt-2", long ? "lg:ml-[384px] xl:ml-[435px]" : "lg:ml-[404px] xl:ml-[435px]")}>{after}</div> : null}
      </div>

      {/* The ledger: shown instead with reduced motion or on a very short screen. */}
      <div className="story-ledger">{children}</div>
    </div>
  );
}
