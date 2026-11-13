"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { LanesDiagram, type LaneLabels } from "@/components/story/LanesDiagram";
import { FootnoteMarker } from "@/components/ui/Footnote";
import { Illustrative } from "@/components/ui/Illustrative";
import { TextLink } from "@/components/ui/TextLink";
import { cn } from "@/lib/utils";

/*
 * The pinned story (Home "Follow one receivable…"; HANDOFF section 7).
 * Desktop only: the story panel (Figma 119:1280) beside the lanes diagram,
 * pinned under the header while the page scrolls through eight steps; each
 * step writes the next state's row and changes the panel. It never traps
 * scroll: the pin is CSS position: sticky inside a tall track, and the state
 * is read from how far the track has scrolled, so a fast scroll lands on the
 * nearest state. "Skip the story" jumps past it.
 *
 * The story only switches on in the browser, at desktop width, with a
 * viewport tall enough to hold it and without prefers-reduced-motion. In
 * every other case (and without JavaScript, and for screen readers) the
 * ledger register passed as `children` carries the same eight states.
 */
type LedgerState = { no: string; state: string; what: string; party: string | null; data: string | null; money: string | null };

const STEP = 420; // px of scroll per state
const QUERY = "(min-width: 1200px) and (min-height: 820px) and (prefers-reduced-motion: no-preference)";

function PathLine({ kind }: { kind: "data" | "money" }) {
  return (
    <svg width="28" height="14" viewBox="0 0 28 14" fill="none" aria-hidden="true" className={cn("shrink-0", kind === "data" ? "text-ink-muted" : "text-ink")}>
      {kind === "data" ? (
        <g stroke="currentColor" strokeWidth={1.5}>
          <line x1="0" y1="8" x2="27" y2="8" strokeDasharray="5 4" />
          <path d="M22.7 2.7L28 8L22.7 13.3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : (
        <g fill="currentColor">
          <rect x="0" y="7" width="19" height="2" />
          <path d="M28 8L18 2.23V13.77Z" />
        </g>
      )}
    </svg>
  );
}

export function Story({
  skipTo,
  footnote,
  children,
}: {
  /** Id of the section after the story. */
  skipTo: string;
  footnote: { target: string; refId: string };
  /** The ledger register. */
  children: React.ReactNode;
}) {
  const t = useTranslations("story");
  const ledger = useTranslations("ledger");
  const states = ledger.raw("states") as LedgerState[];
  const trackRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState(1);

  useEffect(() => {
    const query = window.matchMedia(QUERY);
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const track = trackRef.current;
      if (!track) return;
      const stickyTop = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) + 24;
      const scrolled = stickyTop - track.getBoundingClientRect().top;
      setState(Math.min(8, Math.max(1, Math.floor(scrolled / STEP) + 1)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  const current = states[state - 1];
  const planned = state === 8;
  const money = current.money;

  return (
    <>
      {enabled ? (
        <div ref={trackRef} data-story-state={state} style={{ height: 692 + STEP * 8 }}>
          <div className="sticky top-[calc(var(--header-height)+24px)] flex items-start gap-6">
            <div className="flex w-[411px] shrink-0 flex-col">
              <div className="flex items-center justify-between border-b-2 border-rule-strong pb-3">
                <p className="t-tag text-ink-muted">{t("record")}</p>
                <Illustrative />
              </div>
              <p className="flex items-center gap-3 pt-4">
                <span className="t-tag text-ink-muted">{t("stateLabel")}</span>
                <span className="t-label text-ink-muted">{t("counter", { n: String(state).padStart(2, "0") })}</span>
              </p>
              <div key={state} className="story-fade flex flex-col">
                <p className={cn("flex items-baseline gap-3 pt-4", planned ? "text-ink-muted" : "text-accent")}>
                  <span className="t-code">{current.no}</span>
                  <span className="t-state">
                    {current.state}
                    {planned ? <FootnoteMarker n={1} {...footnote} /> : null}
                  </span>
                </p>
                <p className="t-body-lg min-h-[90px] pt-4 text-ink">{current.what}</p>
                <p className="t-tag pt-3 pb-6 text-ink-muted">{t("party", { party: planned ? t("planned") : (current.party ?? "") })}</p>
                <div className="flex gap-3 border-t border-rule py-4">
                  <PathLine kind="data" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="t-tag text-ink">{t("dataPath")}</p>
                    <p className="t-body min-h-[26px] text-ink">{planned ? t("planned") : current.data}</p>
                  </div>
                </div>
                <div className="flex gap-3 border-t border-rule py-4">
                  <PathLine kind="money" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="flex items-center gap-2">
                      <span className="t-tag text-ink">{t("moneyPath")}</span>
                      <span className="t-label text-accent">{t("holdsNone")}</span>
                    </p>
                    <p className="t-body min-h-[78px] text-ink">{money ?? "—"}</p>
                  </div>
                </div>
              </div>
              <div aria-hidden="true" className="h-0.5 bg-rule-strong" />
              <div className="flex items-center gap-12 pt-8">
                <TextLink href={`#${skipTo}`} kind="anchor">{t("skip")}</TextLink>
                <TextLink href="/how-it-works" kind="arrow">{t("seeHow")}</TextLink>
              </div>
              <ul aria-hidden="true" className="flex flex-col gap-3 pt-10">
                <li className="flex items-center gap-3"><PathLine kind="data" /><span className="t-tag text-ink-muted">{t("legend.data")}</span></li>
                <li className="flex items-center gap-3"><PathLine kind="money" /><span className="t-tag text-ink-muted">{t("legend.money")}</span></li>
                <li className="flex items-center gap-3"><span className="h-3 w-7 bg-action" /><span className="t-tag text-ink-muted">{t("legend.kubar")}</span></li>
              </ul>
            </div>
            <LanesDiagram state={state} parties={t.raw("parties") as string[]} labels={t.raw("lanes") as LaneLabels} />
          </div>
        </div>
      ) : null}
      {/* The register: shown when the story is off; always in the DOM. */}
      <div className={enabled ? "sr-only" : undefined}>{children}</div>
    </>
  );
}
