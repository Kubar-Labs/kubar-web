import type { MetadataRoute } from "next";

/** The eight public routes (HANDOFF section 5). */
export const sitemapRoutes = [
  "/",
  "/products/kubar-protocol",
  "/products/navdhan-sdk",
  "/how-it-works",
  "/about",
  "/contact",
  "/legal/privacy",
  "/legal/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapRoutes.map((route) => ({
    url: route === "/" ? "https://kubar.tech" : `https://kubar.tech${route}`,
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : route.startsWith("/legal") ? 0.3 : 0.8,
  }));
}
