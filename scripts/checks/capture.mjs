// Captures every route at every size: a full-page picture and the page's
// measurements, for looking at the site and for comparing before and after.
//
//   node scripts/checks/capture.mjs <base url> <out dir> [size …]
//   node scripts/checks/capture.mjs --compare <before dir> <after dir>
//
// Reduced motion, so every drawing is complete and the pictures are the same
// from run to run. --compare lists each route and size whose picture changed,
// with the sections whose height or position moved.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { routes, sizes } from "./sizes.mjs";

const slug = (route) => (route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "_"));

if (process.argv[2] === "--compare") {
  const [before, after] = process.argv.slice(3).map((dir) => JSON.parse(readFileSync(`${dir}/measurements.json`, "utf8")));
  let same = 0;
  const changed = [];
  for (const key of Object.keys(after)) {
    const a = before[key];
    const b = after[key];
    if (!a) continue;
    if (a.hash === b.hash) {
      same++;
      continue;
    }
    const moved = [];
    if (a.height !== b.height) moved.push(`page ${a.height} → ${b.height}`);
    for (const section of b.sections) {
      const was = a.sections.find((s) => s.name === section.name);
      if (!was) moved.push(`new: ${section.name}`);
      else if (was.height !== section.height) moved.push(`${section.name} ${was.height} → ${section.height}`);
    }
    for (const was of a.sections) if (!b.sections.some((s) => s.name === was.name)) moved.push(`gone: ${was.name}`);
    changed.push(`${key}: ${moved.join("; ") || "same heights, pixels differ"}`);
  }
  console.log(`${same} pictures identical, ${changed.length} changed`);
  for (const line of changed) console.log(`  ${line}`);
  process.exit(0);
}

const [base, out, ...wanted] = process.argv.slice(2);
if (!out) {
  console.error("usage: node scripts/checks/capture.mjs <base url> <out dir> [size …]");
  process.exit(2);
}
mkdirSync(out, { recursive: true });
const file = `${out}/measurements.json`;
const measurements = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
const browser = await chromium.launch({ args: ["--disable-gpu", "--disable-gpu-compositing", "--disable-software-rasterizer"] });
for (const size of wanted.length ? sizes.filter((s) => wanted.includes(s.name)) : sizes) {
  const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, hasTouch: size.touch, reducedMotion: "reduce" });
  for (const route of routes) {
    const page = await context.newPage();
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const measured = await page.evaluate(() => ({
      height: document.documentElement.scrollHeight,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      sections: [...document.querySelectorAll("main section, main > div, header, footer")]
        .filter((el) => el.getClientRects().length)
        .map((el) => {
          const box = el.getBoundingClientRect();
          const heading = el.querySelector("h1, h2");
          return {
            name: (el.id || el.getAttribute("aria-labelledby") || heading?.textContent || el.tagName.toLowerCase()).slice(0, 48),
            top: Math.round(box.top + scrollY),
            height: Math.round(box.height),
          };
        }),
    }));
    const path = `${out}/${slug(route)}-${size.name}.png`;
    const png = await page.screenshot({ path, fullPage: true, animations: "disabled" });
    measurements[`${slug(route)} ${size.name}`] = { ...measured, hash: createHash("sha1").update(png).digest("hex") };
    await page.close();
  }
  await context.close();
  console.log(size.name);
}
await browser.close();
writeFileSync(file, JSON.stringify(measurements, null, 1));
