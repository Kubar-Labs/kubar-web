import type { Metadata } from "next";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}`;
  robots?: Metadata["robots"];
};

/*
 * The social card (HANDOFF section 5): title "Kubar Labs", the Home subline,
 * and the image. The image file is still the old brand; build step 6 replaces
 * it with one drawn in the new type and colours, for Vaibhav to approve.
 */
export const socialImage = {
  url: "/media/kubar-labs-og-b2add55b.png",
  width: 1200,
  height: 630,
  alt: "Kubar Labs: Building the institutional exchange for cross-border trade finance.",
};

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
    robots,
  };
}
