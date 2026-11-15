// Draws the social card (HANDOFF section 5) and the JSON-LD logo from the
// site's own fonts, colours and lock-up. Run: node scripts/social-image.mjs
// Writes public/media/kubar-labs-social-<hash>.png and kubar-mark-<hash>.png
// and prints the file names to put in src/app/page-metadata.ts.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const font = (file) => `data:font/woff2;base64,${readFileSync(join(root, "src/app/fonts", file)).toString("base64")}`;
const brand = readFileSync(join(root, "src/components/brand/KubarMark.tsx"), "utf8");
const [markPath, lockupMark, lockupWords] = [...brand.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);

const PAPER = "#F7F7F5";
const INK = "#022732";
const RANI = "#AD2468";

const card = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Newsreader;src:url(${font("newsreader-latin-opsz-400.woff2")});font-weight:400}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:${PAPER};color:${INK};padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between}
.line{display:flex;gap:32px}
.rule{width:2px;background:${RANI};flex:none}
h1{font:400 76px/84px Newsreader,serif;letter-spacing:-0.02em;max-width:960px}
footer{display:flex;align-items:center;justify-content:space-between;border-top:2px solid ${INK};padding-top:28px}
</style>
<div class="line"><span class="rule"></span><h1>Building the institutional exchange for cross-border trade finance.</h1></div>
<footer>
  <svg viewBox="0 0 263.914 48.0001" height="44" fill="${INK}"><path d="${lockupMark}"/><path d="${lockupWords}"/></svg>
</footer>`;

const logo = `<!doctype html><meta charset="utf-8"><style>*{margin:0}body{width:512px;height:512px;background:${PAPER};display:grid;place-items:center}</style>
<svg viewBox="0 0 82.5046 48" width="340" fill="${INK}"><path d="${markPath}"/></svg>`;

const browser = await chromium.launch({ args: ["--disable-gpu", "--disable-gpu-compositing", "--disable-software-rasterizer"] });
async function shot(html, width, height, name) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  await page.close();
  const file = `${name}-${createHash("sha256").update(png).digest("hex").slice(0, 8)}.png`;
  writeFileSync(join(root, "public/media", file), png);
  console.log(file, png.length, "bytes");
  return file;
}
await shot(card, 1200, 630, "kubar-labs-social");
await shot(logo, 512, 512, "kubar-mark");
await browser.close();
