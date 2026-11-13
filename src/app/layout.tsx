import type { Metadata, Viewport } from "next";
import { getTranslations } from "next-intl/server";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { AbbreviationTips } from "@/components/ui/AbbreviationTips";
import { organisationLogo, socialImage } from "@/app/page-metadata";
import { fontVariables } from "./fonts";
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
    <html lang="en" className={fontVariables}>
      <body>
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
        {agentationToolbar}
      </body>
    </html>
  );
}
