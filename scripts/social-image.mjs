// Draws the social card (SPEC section 4) and the JSON-LD logo from the
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

const PAPER = "#F7F7F5"; // the logo's ground, unchanged
const WHITE = "#FFFFFF";
const INK = "#022732";
const MUTED = "#4E686F";
const RULE = "#CCD4D6";
const INSET = "#ECECE8";
const RANI = "#AD2468";

// The card in the site's current look (16 Nov 2026): white ground, the headline in Schibsted
// Grotesk Medium as the display sets it, the lock-up, and the record from Home's hero: eight
// sheets in isometric projection, 08 on top and current, with its rani edge and "FILED".
const ISO = "matrix(0.866 0.5 -0.866 0.5 0 0)";
const elevation = (level) =>
  level === 3
    ? "drop-shadow(0 4px 8px rgb(2 39 50 / .08)) drop-shadow(0 24px 56px rgb(2 39 50 / .16))"
    : "drop-shadow(0 2px 4px rgb(2 39 50 / .08)) drop-shadow(0 14px 36px rgb(2 39 50 / .12))";
const sheets = Array.from({ length: 8 }, (_, i) => {
  const current = i === 7;
  const y = 20 + (7 - i) * 35;
  const no = String(i + 1).padStart(2, "0");
  return `
  <g transform="translate(128 ${y + 4}) ${ISO}"><rect width="230" height="140" fill="${current ? RANI : RULE}"/></g>
  <g transform="translate(128 ${y}) ${ISO}" style="filter:${elevation(current ? 3 : 2)}">
    <rect width="230" height="140" fill="${WHITE}" stroke="${current ? INK : RULE}" stroke-width="1" vector-effect="non-scaling-stroke"/>
    <rect x="15" y="17" width="96" height="7" fill="${INK}"/>
    <rect x="15" y="37" width="180" height="3" fill="${RULE}"/><rect x="15" y="47" width="150" height="3" fill="${RULE}"/>
    <rect x="15" y="57" width="166" height="3" fill="${RULE}"/><rect x="15" y="67" width="120" height="3" fill="${RULE}"/>
    <rect x="177" y="15" width="36" height="36" fill="${INSET}"/>
    <text x="15" y="122" font-family="Geist Mono" font-size="13" letter-spacing="0.26" fill="${current ? RANI : MUTED}">${no}</text>
    ${current ? `<text x="170" y="122" font-family="Geist Mono" font-weight="500" font-size="13" letter-spacing="0.78" fill="${RANI}">FILED</text>` : ""}
  </g>`;
}).join("");
const record = `<svg viewBox="0 0 336 504" width="380" height="570" style="overflow:visible">
  <ellipse cx="167" cy="435" rx="150" ry="35" fill="rgb(2 39 50 / .2)" style="filter:blur(14px)"/>${sheets}
</svg>`;

const card = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Schibsted;src:url(${font("schibsted-grotesk-latin-400-500.woff2")});font-weight:400 500}
@font-face{font-family:"Geist Mono";src:url(${font("geist-mono-latin.woff2")});font-weight:400 500}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:${WHITE};color:${INK};position:relative;overflow:hidden}
h1{position:absolute;left:80px;top:80px;width:620px;font:500 60px/64px Schibsted,sans-serif;letter-spacing:-0.02em}
.lockup{position:absolute;left:80px;bottom:72px}
.record{position:absolute;right:96px;top:28px}
</style>
<h1>Building the institutional exchange for cross-border trade finance.</h1>
<svg class="lockup" viewBox="0 0 263.914 48.0001" height="44" fill="${INK}"><path d="${lockupMark}"/><path d="${lockupWords}"/></svg>
<div class="record">${record}</div>`;

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
