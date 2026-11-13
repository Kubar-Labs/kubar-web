import type { Metadata } from "next";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}`;
  robots?: Metadata["robots"];
};

/*
 * The social card (HANDOFF section 5): title "Kubar Labs", the Home subline,
 * and the image, drawn in the site's type and colours by
 * scripts/social-image.mjs (the file name carries a hash of its contents,
 * because /media is cached for a year).
 */
export const socialImage = {
  url: "/media/kubar-labs-social-bd9a99c9.png",
  width: 1200,
  height: 630,
  alt: "Kubar Labs: Building the institutional exchange for cross-border trade finance.",
};

/** The mark on paper, 512 px square: the Organisation logo in the JSON-LD. */
export const organisationLogo = "/media/kubar-mark-970208af.png";

/** The social card's title and description, the same on every page. */
export const socialCard = {
  title: "Kubar Labs",
  description:
    "Starting with the asset: export receivables an international financier can buy again and again, insured in its own name.",
};

/*
 * Next replaces a parent's openGraph and twitter objects instead of merging
 * them, so every page carries the whole card.
 */
export function createPageMetadata({ title, description, path, robots }: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      ...socialCard,
      type: "website",
      locale: "en_IN",
      url: path,
      siteName: "Kubar Labs",
      images: [socialImage],
    },
    twitter: { card: "summary_large_image", ...socialCard, images: [socialImage] },
    // Left out unless a page sets it, so the layout's "index, follow" stands.
    ...(robots ? { robots } : {}),
  };
}
