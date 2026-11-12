"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

/*
 * Illustrative (Figma C1 60:82). The plain word in rani, Sans/Fine, with a
 * dotted underline that says there is more (solid on hover). It is a button:
 * pressing it shows "An example receivable, not a real transaction." in place,
 * below the word and aligned to its edge; pressing again hides it.
 */
export function Illustrative({ align = "end", className }: { align?: "start" | "end"; className?: string }) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const noteId = useId();
  return (
    <div className={cn("flex flex-col gap-1", align === "end" ? "items-end text-right" : "items-start", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={noteId}
        onClick={() => setOpen((value) => !value)}
        className="t-fine min-h-6 cursor-pointer text-accent underline decoration-dotted decoration-1 [text-underline-position:from-font] hover:decoration-solid"
      >
        {t("illustrative")}
      </button>
      <p id={noteId} hidden={!open} className="t-fine text-ink-muted">
        {t("illustrativeNote")}
      </p>
    </div>
  );
}
