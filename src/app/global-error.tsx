"use client";

import { NextIntlClientProvider } from "next-intl";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SystemPage } from "@/components/system/SystemPage";
import messages from "../../messages/en.json";
import { fontVariables } from "./fonts";
import "./globals.css";

/*
 * Replaces the root layout when the layout itself fails, so it brings its own
 * document, fonts, styles and messages (Next 16: global-error renders its own
 * <html> and <body>). Same page as error.tsx, framed by the header and footer.
 */
export default function GlobalError() {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <NextIntlClientProvider locale="en" messages={messages}>
          <title>{messages.system.error.title}</title>
          <Header />
          <main id="main-content" tabIndex={-1} className="pt-(--header-height) outline-none">
            <SystemPage kind="error" />
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
