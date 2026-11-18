import type { Metadata, Viewport } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { AbbreviationTips } from "@/components/ui/AbbreviationTips";
import { FootnoteLinks } from "@/components/ui/FootnoteLinks";
import { organisationLogo, socialImage } from "@/app/page-metadata";
import { fontVariables } from "./fonts";
import { viewTransitionGuard } from "./view-transition-guard";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("site");

  return {
    metadataBase: new URL("https://kubar.tech"),
    title: t("homeTitle"),
    description: t("homeDescription"),
    creator: "Kubar Labs",
    publisher: "Kubar Labs",
    alternates: { canonical: "/" },
    openGraph: {
      title: t("socialTitle"),
      description: t("homeDescription"),
      type: "website",
      locale: "en_IN",
      url: "/",
      siteName: "Kubar Labs",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: t("socialTitle"),
      description: t("homeDescription"),
      images: [socialImage],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F7F7F5",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organisation JSON-LD (HANDOFF section 5): the new logo, partnerships@
  // and LinkedIn. The Substack link is dropped.
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Kubar Labs",
    legalName: "Kubar Protocol Private Limited",
    url: "https://kubar.tech",
    logo: `https://kubar.tech${organisationLogo}`,
    email: "partnerships@kubar.tech",
    sameAs: ["https://www.linkedin.com/company/kubarlabs/"],
  };

  const t = await getTranslations();
  const abbreviations = t.raw("abbreviations") as Record<string, string>;

  let agentationToolbar: React.ReactNode = null;
  if (process.env.NODE_ENV === "development") {
    const { AgentationToolbar } = await import("@/components/agentation/AgentationToolbar");
    agentationToolbar = <AgentationToolbar />;
  }

  return (
    // The script below adds data-js and data-frames to <html>, so React must not report the difference.
    // data-scroll-behavior: Next 16 no longer turns smooth scrolling off for a route change unless
    // asked; without it a new page opens at the old scroll position and glides to the top.
    <html lang="en" className={fontVariables} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        {/* data-js: script runs, so a list shown in part (Fold) may hide its folded items before
            anything is painted; without script they show.
            data-frames: movements that play as a page loads (the hero drawings; globals.css)
            start from a hidden or displaced state, so they may only start where frames are being
            drawn. This marks the document on its first frame, before anything is painted. In a
            background tab or a hidden pane no frame comes, the mark is never set, and the
            drawings stay as the server drew them: complete.
            Then the guard for a page change whose view transition the browser gives up on
            (view-transition-guard.ts). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.setAttribute('data-js','');requestAnimationFrame(function(){document.documentElement.setAttribute('data-frames','')});" +
              viewTransitionGuard,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {/* Client components take their words as props, so no message
            provider or formatter ships to the browser. */}
        <SkipLink />
        <Header copy={t.raw("header")} />
        <main id="main-content" tabIndex={-1} className="pt-(--header-height) outline-none">
          {children}
        </main>
        <Footer />
        <AbbreviationTips expansions={abbreviations} />
        <FootnoteLinks />
        {agentationToolbar}
      </body>
    </html>
  );
}
