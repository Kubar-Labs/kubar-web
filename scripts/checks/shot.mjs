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
    // Fixed things outside the element (the header, the "On this page" button, which shows a frame
    // or two after the scroll) would be drawn over it.
    await target.evaluate(
      (el) =>
        new Promise((resolve) =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              for (const other of document.querySelectorAll("body *")) {
                if (!el.contains(other) && !other.contains(el) && getComputedStyle(other).position === "fixed") other.style.visibility = "hidden";
              }
              resolve();
            }),
          ),
        ),
    );
    // Clipped from the whole page: an element as tall as the screen is otherwise cut at its foot.
    const clip = await target.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height };
    });
    await page.screenshot({ path, fullPage: true, clip, animations: "disabled" });
  } else {
    await page.screenshot({ path, animations: "disabled" });
  }
  console.log(path);
  await page.close();
}
await browser.close();
