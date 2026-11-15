// Pictures for a report: one route, or one section of it, at the report's sizes.
//
//   node scripts/checks/shot.mjs <base url> <route> <out dir> <name> [selector] [size …]
//
// With a selector, the picture is that element; without, the first screen.
// Reduced motion, so every drawing is in its end state (MOTION=1 keeps motion,
// for a pinned journey, which reduced motion replaces with its register).
// Sizes default to 390x844, 1180x820 and 1440x900.
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const [base, route, out, name, selector, ...wanted] = process.argv.slice(2);
if (!name) {
  console.error("usage: node scripts/checks/shot.mjs <base url> <route> <out dir> <name> [selector] [size …]");
  process.exit(2);
}
const sizes = (wanted.length ? wanted : ["390x844", "1180x820", "1440x900"]).map((s) => s.split("x").map(Number));
mkdirSync(out, { recursive: true });
// Software rendering, as in playwright.config.ts: the GPU compositor stalls on some machines.
const browser = await chromium.launch({ args: ["--disable-gpu", "--disable-gpu-compositing", "--disable-software-rasterizer"] });
for (const [width, height] of sizes) {
  const page = await browser.newPage({ viewport: { width, height } });
  if (!process.env.MOTION) await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(base + route, { waitUntil: "networkidle" });
  const path = `${out}/${name}-${width}x${height}.png`;
  if (selector && selector !== "-") {
    const target = page.locator(selector).first();
    await target.evaluate((el) => el.scrollIntoView({ block: "start", behavior: "instant" }));
    await target.screenshot({ path, animations: "disabled" });
  } else {
    await page.screenshot({ path, animations: "disabled" });
  }
  console.log(path);
  await page.close();
}
await browser.close();
