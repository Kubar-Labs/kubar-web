"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import { cx as cn } from "@/lib/cx";

/*
 * Where each institution fits, a pick (step 9; Figma 332:2432 at 1440; below
 * that the prototype, docs/rebuild/prototypes/motion-pieces.html). Left, the
 * five institutions in a 480 px list (380 from 900 to 1023); the first is
 * picked on load. Right, "Role" and the picked institution's role in H3,
 * with its footnote marker where it has one. Below 900 the role sits under
 * the list.
 *
 * Hover (a mouse), a click or a tap picks; the keyboard reaches the group
 * with Tab and moves within it with the arrow keys, Home and End, picking as
 * it goes (`aria-pressed`). The five roles share one cell, so the role keeps
 * the height of the longest and nothing under it moves.
 *
 * With script only (`with-script`): without it the page shows today's
 * register, every institution at once.
 */
export function FitPick({
  institutions,
  label,
  roles,
  className,
}: {
  institutions: string[];
  /** "Role". */
  label: string;
  /** Each institution's role, with its footnote marker where it has one. */
  roles: React.ReactNode[];
  className?: string;
}) {
  const [picked, setPicked] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (event: React.KeyboardEvent, i: number) => {
    const to = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: institutions.length - 1 }[event.key];
    if (to === undefined) return;
    event.preventDefault();
    buttons.current[(to + institutions.length) % institutions.length]?.focus();
  };

  return (
    <div
      className={cn(
        "with-script grid items-start gap-6 min-[900px]:grid-cols-[380px_minmax(0,1fr)] min-[900px]:gap-16 lg:grid-cols-[480px_minmax(0,1fr)]",
        className,
      )}
    >
      <ul data-pick="fit" className="border-t-2 border-ink">
        {institutions.map((name, i) => (
          <li key={name}>
            <button
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              aria-pressed={picked === i}
              tabIndex={picked === i ? 0 : -1}
              onClick={() => setPicked(i)}
              onFocus={() => setPicked(i)}
              onKeyDown={(event) => move(event, i)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setPicked(i);
              }}
              className={cn(
                "t-ui-lg flex w-full cursor-pointer items-center justify-between gap-3 border-b border-rule p-4 text-left outline-offset-2",
                picked === i ? "bg-action text-on-action" : "text-ink",
              )}
            >
              {name}
              {/* Every row keeps the arrow's room, so a name wraps the same picked or not. */}
              <Icon name="arrow-right" size={16} className={cn("shrink-0", picked !== i && "invisible")} />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex min-w-0 flex-col gap-2.5 min-[900px]:pt-[18px]">
        <p className="t-fine text-ink-muted">{label}</p>
        <div className="grid">
          {roles.map((role, i) => (
            <h3 key={institutions[i]} className={cn("t-h3 col-start-1 row-start-1 max-w-[720px] text-ink", picked !== i && "invisible")}>
              {role}
            </h3>
          ))}
        </div>
      </div>
    </div>
  );
}
