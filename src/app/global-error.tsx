"use client";

import { errorCopy } from "@/app/error-copy";
import { fontVariables } from "./fonts";
import "./globals.css";

/*
 * Replaces the root layout when the layout itself fails, so it brings its own
 * document, fonts and styles (Next 16: global-error renders its own <html>
 * and <body>). Next loads this boundary's script on every page, so it stays
 * small: the name as the way home, and the error page's two sentences.
 */
export default function GlobalError() {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <title>{errorCopy.title}</title>
        <header className="border-b border-rule-strong">
          <div className="page-container flex h-16 items-center lg:h-20">
            {/* A full page load: the app that failed isn't asked to navigate. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="t-ui-lg text-ink">
              Kubar Labs
            </a>
          </div>
        </header>
        <main id="main-content" className="page-container pt-8 pb-(--section-space) lg:pt-16">
          <div className="flex flex-col gap-8 lg:max-w-[1063px]">
            <h1 className="t-display text-ink">{errorCopy.display}</h1>
            <p className="t-body-lg text-ink-muted lg:max-w-[628px]">
              {errorCopy.lineBefore}
              <a href={`mailto:${errorCopy.email}`} className="text-ink underline decoration-1 [text-underline-position:from-font] hover:decoration-2">
                {errorCopy.email}
              </a>
              {errorCopy.lineAfter}
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
