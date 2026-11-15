// A page's own JavaScript, compressed, as sent: the scripts its HTML names.
// Next also prefetches the routes linked from what is on screen, with their
// chunks; the page does not run those, and none of them are in its HTML, so
// they are reported apart. Measured at 390 and at 1440, where different links
// are on screen. The budget (170 KB) is Home's; the other routes are reported.
//
//   node scripts/checks/js-budget.mjs http://127.0.0.1:3301 [route …]
import { chromium } from "@playwright/test";
import { routes as allRoutes } from "./sizes.mjs";

const BUDGET_KB = 170;
const base = process.argv[2] ?? "http://127.0.0.1:3301";
const routes = process.argv.slice(3).length ? process.argv.slice(3) : allRoutes;

const browser = await chromium.launch({ args: ["--disable-gpu"] });
let failed = false;
console.log("route                        width  own JS     prefetched");
for (const route of routes) {
  const html = await (await fetch(base + route)).text();
  for (const [width, height] of [[390, 844], [1440, 900]]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    const client = await context.newCDPSession(page);
    await client.send("Network.enable");
    await client.send("Network.setCacheDisabled", { cacheDisabled: true });
    const seen = new Map();
    client.on("Network.requestWillBeSent", (e) =>
      seen.set(e.requestId, {
        url: e.request.url,
        type: e.type ?? "",
        prefetch: Object.keys(e.request.headers).some((k) => /^(next-router-prefetch|purpose|sec-purpose)$/i.test(k)),
        bytes: 0,
      }),
    );
    client.on("Network.responseReceived", (e) => {
      const r = seen.get(e.requestId);
      if (r) r.type = e.type;
    });
    client.on("Network.loadingFinished", (e) => {
      const r = seen.get(e.requestId);
      if (r) r.bytes = e.encodedDataLength;
    });
    await page.goto(base + route, { waitUntil: "networkidle" });
    const all = [...seen.values()];
    const inHtml = (url) => html.includes(new URL(url).pathname);
    const own = all.filter((r) => r.type === "Script" && !r.prefetch && inHtml(r.url)).reduce((sum, r) => sum + r.bytes, 0) / 1024;
    const prefetched = all.filter((r) => r.prefetch || (r.type === "Script" && !inHtml(r.url))).reduce((sum, r) => sum + r.bytes, 0) / 1024;
    const over = route === "/" && own > BUDGET_KB;
    failed ||= over;
    console.log(`${route.padEnd(28)} ${String(width).padEnd(6)} ${`${own.toFixed(1)} KB`.padEnd(10)} ${prefetched.toFixed(1)} KB${over ? "   OVER BUDGET" : ""}`);
    await context.close();
  }
}
await browser.close();
console.log(failed ? `FAILED: Home's own JavaScript is over ${BUDGET_KB} KB.` : `Home's own JavaScript is within ${BUDGET_KB} KB.`);
process.exit(failed ? 1 : 0);
