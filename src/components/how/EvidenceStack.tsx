"use client";

import { useEffect, useRef, useState } from "react";
import { cx as cn } from "@/lib/cx";

/*
 * Evidence stack (Figma C4 127:2464), How it works "Who relies on the
 * record.": eight document cards on white, ruled in strong ink, stepping
 * down and to the right at desktop; the purchase confirmation is last, its
 * square in rani, and is shown open. Below them the one record they lock
 * into, then the two lines after the stack.
 *
 * Motion (HANDOFF section 7): on entering the viewport at desktop, the cards
 * arrive one by one from 24 px below, 80 ms apart, 320 ms each; the record
 * waits at 40% until the last card lands. Below desktop, with reduced motion
 * and without JavaScript the stack is simply shown.
 */
export type EvidenceStackCopy = {
  /** "Doc {no}" */
  docLabel: string;
  documents: { no: string; name: string }[];
  from: string;
  proves: string;
  record: string;
  elements: string[];
  stateLabel: string;
  counter: string;
  stateNo: string;
  state: string;
  after: string[];
};

const GAP = 80; // ms between cards
const QUERY = "(min-width: 1200px) and (prefers-reduced-motion: no-preference)";

export function EvidenceStack({
  copy,
  illustrative,
  className,
}: {
  copy: EvidenceStackCopy;
  /** The Illustrative tag, rendered on the server. */
  illustrative: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLOListElement>(null);
  const [phase, setPhase] = useState<"shown" | "waiting" | "arriving">("shown");
  const last = copy.documents.length - 1;

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia(QUERY).matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.8) return; // already on screen
    setPhase("waiting");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("arriving");
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const waiting = phase === "waiting";
  const arriving = phase === "arriving";

  return (
    <div className={cn("flex flex-col", className)}>
      <ol ref={ref} className="flex flex-col gap-1 lg:block lg:pb-6">
        {copy.documents.map((doc, i) => (
          <li
            key={doc.no}
            style={{
              ["--step" as string]: i,
              transitionDelay: arriving ? `${i * GAP}ms` : undefined,
            }}
            className={cn(
              "relative border border-rule-strong bg-raised lg:ml-[calc(var(--step)*8px)] lg:w-[572px] lg:[&:not(:first-child)]:-mt-px",
              "transition-[opacity,translate] duration-(--duration-write) ease-standard",
              waiting && "translate-y-6 opacity-0",
            )}
          >
            <p className="flex items-center gap-3 px-4 py-3">
              <span className="t-code shrink-0 text-ink-muted">{copy.docLabel.replace("{no}", doc.no)}</span>
              <span className="t-ui min-w-0 flex-1 text-ink">{doc.name}</span>
              <span aria-hidden="true" className={cn("size-2 shrink-0", i === last ? "bg-accent" : "bg-ink")} />
            </p>
            {i === last ? (
              <div className="flex flex-col gap-2 border-t border-rule px-4 py-3">
                <p className="t-tag text-ink-muted">{copy.from}</p>
                <p className="t-body text-ink">{copy.proves}</p>
              </div>
            ) : null}
          </li>
        ))}
      </ol>

      <div
        style={{ transitionDelay: arriving ? `${last * GAP + 320}ms` : undefined }}
        className={cn(
          "mt-6 flex flex-col gap-4 border border-t-2 border-rule-strong bg-raised p-5 lg:mt-0 lg:w-[628px]",
          "transition-opacity duration-(--duration-disclose) ease-standard",
          waiting && "opacity-40",
        )}
      >
        <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-baseline lg:justify-between lg:gap-4">
          <p className="t-tag text-ink-muted">{copy.record}</p>
          {illustrative}
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {copy.elements.map((element, i) => (
            <li key={element} className="flex items-center gap-2">
              <span aria-hidden="true" className={cn("size-2 shrink-0", i === copy.elements.length - 1 ? "bg-accent" : "bg-ink")} />
              <span className="t-body-sm whitespace-nowrap text-ink">{element}</span>
            </li>
          ))}
        </ul>
        <p className="flex flex-wrap items-center gap-x-3 border-t border-rule pt-3">
          <span className="t-tag text-ink-muted">{copy.stateLabel}</span>
          <span className="t-label text-ink-muted">{copy.counter}</span>
          <span className="flex items-baseline gap-2 text-accent">
            <span className="t-code">{copy.stateNo}</span>
            <span className="t-state">{copy.state}</span>
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-10 lg:w-[628px]">
        {copy.after.map((line) => (
          <p key={line} className="t-body-sm text-ink-muted">{line}</p>
        ))}
      </div>
    </div>
  );
}
