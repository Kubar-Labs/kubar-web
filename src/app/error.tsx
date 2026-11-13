"use client";

import { errorCopy } from "@/app/error-copy";

/*
 * Error boundary for every route under the root layout, so the header and
 * footer stay. The design has no retry control; the line asks the reader to
 * try again in a moment. A render failure on the server returns HTTP 500.
 * Set like the system page (components/system/SystemPage.tsx).
 */
export function ErrorMessage() {
  return (
    <section className="page-container pt-8 pb-(--section-space) lg:pt-16">
      <div className="page-grid">
        <div className="col-span-full flex flex-col gap-8 lg:col-span-10">
          <h1 className="t-display text-ink">{errorCopy.display}</h1>
          <p className="t-body-lg text-ink-muted lg:max-w-[628px]">
            {errorCopy.lineBefore}
            <a href={`mailto:${errorCopy.email}`} className="text-ink underline decoration-1 [text-underline-position:from-font] hover:decoration-2">
              {errorCopy.email}
            </a>
            {errorCopy.lineAfter}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Error() {
  return (
    <>
      <title>{errorCopy.title}</title>
      <ErrorMessage />
    </>
  );
}
