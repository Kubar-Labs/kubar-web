// Each page's total height at 390×844, against main (the live site by default).
//
//   node scripts/checks/heights.mjs <base url> [reference url]
import { chromium } from "@playwright/test";
import { routes } from "./sizes.mjs";

const base = process.argv[2] ?? "http://127.0.0.1:3301";
const reference = process.argv[3] ?? "https://kubar.tech";
const browser = await chromium.launch({ args: ["--disable-gpu", "--disable-gpu-compositing", "--disable-software-rasterizer"] });
const height = async (url) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await page.goto(url, { waitUntil: "networkidle" });
  // Fonts change line breaks; the pinned journey decides its layout after hydration.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => !document.querySelector(".story") || document.querySelector(".story-on ol[data-live], .story[data-story-fits='false']"));
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.close();
  return h;
};
console.log(`route                        main     now      change   (390×844; main is ${reference})`);
for (const route of routes) {
  const [was, now] = [await height(reference + route), await height(base + route)];
  const change = now - was;
  console.log(`${route.padEnd(28)} ${String(was).padEnd(8)} ${String(now).padEnd(8)} ${change > 0 ? "+" : ""}${change}`);
}
await browser.close();
