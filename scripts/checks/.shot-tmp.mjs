import { chromium } from "@playwright/test";
const base = process.argv[2], tag = process.argv[3];
const b = await chromium.launch({ args: ["--disable-gpu"] });
for (const [w, h] of [[390, 844], [1180, 820], [1440, 900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.goto(base + "/products/kubar-protocol");
  const sec = p.locator("section", { has: p.getByRole("heading", { name: "Cover in your name." }) }).first();
  await sec.scrollIntoViewIfNeeded();
  await sec.screenshot({ path: `/tmp/opencode/step0/${tag}-cover-${w}.png` });
  await p.evaluate(() => scrollTo(0, 0));
  await p.screenshot({ path: `/tmp/opencode/step0/${tag}-hero-${w}.png` });
  await p.close();
}
await b.close();
