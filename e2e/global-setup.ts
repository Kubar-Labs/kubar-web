import type { FullConfig } from "@playwright/test";

/*
 * Every optimised image the pages name is fetched once before the tests run.
 * Next's own optimiser (the test server; production uses the Cloudflare
 * Images binding) leaves every later request for an image waiting when the
 * first one is cancelled before the image is cached, as a test closing its
 * page can do. A page without script loads all its images at once, so it then
 * never finishes loading. A fresh checkout, as in CI, starts with no cache.
 */
export default async function globalSetup(config: FullConfig) {
  const base = config.projects[0]?.use.baseURL ?? "http://127.0.0.1:3100";
  const routes = ["/", "/products/kubar-protocol", "/products/navdhan-sdk", "/how-it-works", "/about", "/contact", "/legal/privacy", "/legal/terms"];
  const urls = new Set<string>();
  for (const route of routes) {
    const html = await (await fetch(base + route)).text();
    for (const [, value] of html.matchAll(/\s(?:src|srcset)="([^"]*\/_next\/image[^"]*)"/gi)) {
      for (const candidate of value.split(",")) urls.add(candidate.trim().split(/\s+/)[0].replaceAll("&amp;", "&"));
    }
  }
  // As Chromium asks for an image: the optimiser caches each format it answers with on its own.
  const accept = "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8";
  const queue = [...urls];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let url = queue.shift(); url; url = queue.shift()) {
        const response = await fetch(base + url, { headers: { accept } });
        if (!response.ok) throw new Error(`${url} answered ${response.status}`);
        await response.arrayBuffer();
      }
    }),
  );
}
