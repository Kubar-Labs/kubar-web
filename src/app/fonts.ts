import localFont from "next/font/local";

/*
 * Self-hosted, Latin-subset woff2 files (see src/app/fonts/). Newsreader and
 * Schibsted Grotesk are instanced from the Fontsource variable builds (OFL-1.1)
 * to the axes the site uses: Newsreader keeps its optical-size axis at weight
 * 400; Schibsted Grotesk keeps weights 400 to 500. Only these two are
 * preloaded (performance budget: fonts ≤ 300 KB, two preloaded).
 */
export const newsreader = localFont({
  src: "./fonts/newsreader-latin-opsz-400.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-newsreader",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});

export const schibsted = localFont({
  src: "./fonts/schibsted-grotesk-latin-400-500.woff2",
  weight: "400 500",
  style: "normal",
  variable: "--font-schibsted",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  weight: "400 500",
  style: "normal",
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "monospace"],
  adjustFontFallback: false,
});

export const fontVariables = `${newsreader.variable} ${schibsted.variable} ${geistMono.variable}`;
