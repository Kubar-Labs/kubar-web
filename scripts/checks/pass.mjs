// The pass: every route at every size, in one engine.
//
//   node scripts/checks/pass.mjs <base url> [size …]      ENGINE=webkit|chromium
//
// Run through `npm run check:safari`, which serves a preview build and runs
// this inside Playwright's image. For each size and route it checks:
//   - the page loads without a script error;
//   - no sideways scroll, at the top, at every screen on the way down and at the bottom;
//   - a pinned journey holds from state 3 to state 6 (or the page shows its fallback register);
//   - no blurred ground shadow is clipped;
//   - everything that answers a hover also answers a tap (the table below).
// It prints one line per size, then ALL CLEAR or the list of failures, and
// exits non-zero on any failure.
import { chromium, webkit } from "@playwright/test";
import { routes, sizes } from "./sizes.mjs";

const base = process.argv[2];
if (!base) {
  console.error("usage: node scripts/checks/pass.mjs <base url> [size …]");
  process.exit(2);
}
const wanted = process.argv.slice(3);
const engine = process.env.ENGINE ?? "webkit";
const browserType = { chromium, webkit }[engine];
if (!browserType) {
  console.error(`Unknown ENGINE "${engine}": use webkit or chromium.`);
  process.exit(2);
}
const runSizes = wanted.length ? sizes.filter((s) => wanted.includes(s.name)) : sizes;
if (runSizes.length === 0) {
  console.error(`No such size. Known: ${sizes.map((s) => s.name).join(" ")}`);
  process.exit(2);
}

/*
 * What answers a pick. `item` is tapped on touch sizes and hovered (or
 * clicked, with `click`) on the others; `expect` is what must then hold:
 *   picked    its stage carries data-picked (PickStage)
 *   expanded  aria-expanded="true" on the item
 *   pressed   aria-pressed="true" on the item
 *   marked    the item matches :hover or :focus (a highlight done in CSS)
 *   colour    the item (a portrait) is no longer greyscale
 *   open      the item carries data-open (an abbreviation's tip)
 * An item that isn't shown at a size is skipped there. Add a row for every
 * new pick.
 */
const picks = [
  { route: "/", name: "header menu", item: 'header button[aria-expanded="false"]', expect: "expanded", click: true },
  { route: "/about", name: "abbreviation tip", item: "main abbr[data-abbr]", expect: "open" },
  { route: "/", name: "record row", item: ".iso-record li[tabindex]", expect: "marked" },
  { route: "/", name: "party map", item: ".party-map [data-party]", expect: "picked" },
  { route: "/", name: "foundations", item: "ol > li[data-level][tabindex]", expect: "marked", sideBySide: true },
  { route: "/products/kubar-protocol", name: "evidence row", item: '.evidence-sources button[aria-expanded="false"]', expect: "expanded", click: true },
  { route: "/products/kubar-protocol", name: "programme loop", item: ".programme-loop .loop-card[data-step]", expect: "picked", click: true },
  { route: "/products/kubar-protocol", name: "who holds what", item: '[data-pick="holds"] button[aria-pressed="false"]', expect: "pressed" },
  { route: "/products/kubar-protocol", name: "where you fit", item: '[data-pick="fit"] button[aria-pressed="false"]', expect: "pressed" },
  { route: "/products/navdhan-sdk", name: "embed picker", item: 'button[aria-pressed="false"]', expect: "pressed" },
  { route: "/products/navdhan-sdk", name: "embed accordion", item: 'main button[aria-expanded="false"]', expect: "expanded", click: true },
  { route: "/products/navdhan-sdk", name: "layers", item: "ol > li[tabindex='-1']", expect: "marked", sideBySide: true },
  { route: "/how-it-works", name: "evidence stack", item: ".story-stack li[data-doc]", expect: "picked" },
  { route: "/how-it-works", name: "signs map", item: ".signs-map [data-party]", expect: "picked" },
  { route: "/about", name: "foundations", item: "ol > li[data-level][tabindex]", expect: "marked", sideBySide: true },
  { route: "/about", name: "team portrait", item: "#team li[tabindex] img", expect: "colour" },
];

const failures = [];
const fail = (size, route, message) => failures.push(`${size.name} ${route}: ${message}`);

const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function settle(page) {
  // Wait for hydration's effects and any scroll-triggered frame, without a fixed sleep.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function checkOverflow(page, size, route) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; ; y += size.height) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
    await settle(page);
    const over = await overflow(page);
    if (over > 0) {
      fail(size, route, `sideways scroll of ${over} px at y=${Math.min(y, height)}`);
      break;
    }
    if (y >= height - size.height) break;
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
}

/** Each pinned journey on the page: "pinned", "register" (its fallback) or a failure. */
async function checkStories(page, size, route) {
  const results = [];
  const count = await page.locator(".story").count();
  for (let i = 0; i < count; i++) {
    const story = page.locator(".story").nth(i);
    const live = story.locator(".story-on ol[data-live]").first();
    // The fit is decided on the first frame after hydration; give the observer time to come up.
    const fits = await live
      .waitFor({ state: "attached", timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (!fits || (await story.getAttribute("data-story-fits")) === "false") {
      const shown = await story.locator(".story-ledger").isVisible();
      if (!shown) fail(size, route, "the journey neither pins nor shows its register");
      results.push("register");
      continue;
    }
    let held = true;
    const cards = await story.locator(".story-card").count();
    for (let n = 3; n <= Math.min(6, cards); n++) {
      await story.evaluate((el, n) => {
        const on = el.querySelector(".story-on");
        const pin = on.querySelector(".story-pin");
        const slot = on.querySelectorAll(".story-card")[n - 1].parentElement;
        const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 0;
        // Beside the cards the pin takes none of the text's height; above them it does.
        const beside = pin.getBoundingClientRect().width < on.getBoundingClientRect().width * 0.9;
        const taken = beside ? 0 : pin.offsetHeight;
        const line = header + taken + 0.45 * (innerHeight - header - taken);
        window.scrollTo({ top: slot.getBoundingClientRect().top + scrollY - line + 20, behavior: "instant" });
      }, n);
      const ok = await page
        .waitForFunction(
          ([i, n]) => {
            const on = document.querySelectorAll(".story")[i].querySelector(".story-on");
            const pin = on.querySelector(".story-pin");
            const stuck = Math.abs(pin.getBoundingClientRect().top - parseFloat(getComputedStyle(pin).top)) <= 2;
            return on.getAttribute("data-story-state") === String(n) && stuck;
          },
          [i, n],
          { timeout: 5000 },
        )
        .then(() => true)
        .catch(() => false);
      if (!ok) {
        const got = await story.locator(".story-on").getAttribute("data-story-state");
        fail(size, route, `the pinned journey did not hold at state ${n} (state ${got})`);
        held = false;
        break;
      }
      if ((await overflow(page)) > 0) fail(size, route, `sideways scroll in the pinned journey at state ${n}`);
    }
    results.push(held ? "pinned" : "FAILED");
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  return results;
}

async function checkShadows(page, size, route) {
  const clipped = await page.evaluate(() => {
    const found = [];
    for (const shadow of document.querySelectorAll(".iso-ground")) {
      const box = shadow.getBoundingClientRect();
      if (box.width === 0) continue;
      const reach = 2 * parseFloat(getComputedStyle(shadow).filter.replace(/[^\d.]/g, "") || "0") * (box.width / (2 * shadow.rx.baseVal.value));
      for (let el = shadow.parentElement; el && el !== document.body; el = el.parentElement) {
        const style = getComputedStyle(el);
        if (style.overflowX === "visible" && style.overflowY === "visible") continue;
        const frame = el.getBoundingClientRect();
        if (box.bottom + reach > frame.bottom + 1 || box.left - reach < frame.left - 1 || box.right + reach > frame.right + 1) {
          found.push(`${el.tagName.toLowerCase()}.${String(el.getAttribute("class")).slice(0, 50)}`);
        }
      }
    }
    return found;
  });
  for (const where of clipped) fail(size, route, `a ground shadow is clipped by ${where}`);
}

async function checkPicks(page, size, route) {
  let done = 0;
  for (const pick of picks.filter((p) => p.route === route)) {
    if (pick.expect === "open") await page.waitForSelector(pick.item, { state: "attached", timeout: 5000 }).catch(() => {});
    // Handles, not locators: a picked item may stop matching its own selector (aria-pressed="false").
    let item = null;
    for (const handle of await page.locator(pick.item).elementHandles()) {
      if (await handle.isVisible()) {
        item = handle;
        break;
      }
    }
    if (!item) continue;
    if (pick.sideBySide) {
      // The highlight exists only where the labels sit beside the drawing: from 1024. (Not their
      // position: Home's labels stand in the flow beside it since 17 Nov.)
      const beside = await page.evaluate(() => matchMedia("(min-width: 1024px)").matches);
      if (!beside) continue;
    }
    await item.scrollIntoViewIfNeeded();
    await settle(page);
    try {
      if (size.touch) await item.tap({ timeout: 5000 });
      else if (pick.click) await item.click({ timeout: 5000 });
      else await item.hover({ timeout: 5000 });
    } catch (error) {
      fail(size, route, `${pick.name}: could not ${size.touch ? "tap" : "reach"} it (${String(error).split("\n")[0].slice(0, 80)})`);
      continue;
    }
    const check = {
      picked: (el) => el.closest("[data-phase]")?.hasAttribute("data-picked") ?? false,
      expanded: (el) => el.getAttribute("aria-expanded") === "true",
      pressed: (el) => el.getAttribute("aria-pressed") === "true",
      marked: (el) => el.matches(":hover, :focus, :focus-within"),
      colour: (el) => !getComputedStyle(el).filter.includes("grayscale(1)"),
      open: (el) => el.hasAttribute("data-open"),
    }[pick.expect];
    const ok = await item
      .evaluate(
        (el, source) =>
          new Promise((resolve) => {
            const test = new Function(`return (${source})`)();
            const started = performance.now();
            const poll = () => (test(el) ? resolve(true) : performance.now() - started > 3000 ? resolve(false) : requestAnimationFrame(poll));
            poll();
          }),
        check.toString(),
      )
      .catch(() => false);
    if (!ok) fail(size, route, `${pick.name}: a ${size.touch ? "tap" : pick.click ? "click" : "hover"} did not leave it ${pick.expect}`);
    done++;
    // Clear the pick before the next one, and close whatever it opened (a menu, the sheet).
    await page.keyboard.press("Escape");
    await page.mouse.move(1, 1);
  }
  return done;
}

const browser = await browserType.launch();
console.log(`${engine} ${browser.version()} · ${base} · ${runSizes.length} sizes × ${routes.length} routes`);
for (const size of runSizes) {
  const before = failures.length;
  const context = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    hasTouch: size.touch,
    isMobile: size.touch && size.width < 744,
  });
  const notes = [];
  let pickCount = 0;
  for (const route of routes) {
    const page = await context.newPage();
    page.on("pageerror", (error) => fail(size, route, `script error: ${String(error).slice(0, 120)}`));
    const response = await page.goto(base + route, { waitUntil: "load" });
    if (response?.status() !== 200) fail(size, route, `status ${response?.status()}`);
    // Styles must have loaded: an unstyled page means the build still upgrades requests to https.
    const styled = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--header-height").trim() !== "");
    if (!styled) {
      fail(size, route, "the page loaded without its stylesheet (is this a LOCAL_PREVIEW build?)");
      await page.close();
      continue;
    }
    await settle(page);
    await checkOverflow(page, size, route);
    const stories = await checkStories(page, size, route);
    if (stories.length) notes.push(`${route === "/" ? "home" : route.split("/").pop()} journey ${stories.join(", ")}`);
    await checkShadows(page, size, route);
    pickCount += await checkPicks(page, size, route);
    await page.close();
  }
  await context.close();
  const failed = failures.length - before;
  console.log(`${size.name.padEnd(10)} ${size.touch ? "touch" : "mouse"}  ${failed ? `${failed} FAILED` : "ok"}  · ${pickCount} picks · ${notes.join(" · ") || "no journey"}`);
}
await browser.close();

if (failures.length) {
  console.log(`\n${failures.length} failures:`);
  for (const failure of failures) console.log(`  ${failure}`);
  process.exit(1);
}
console.log("\nALL CLEAR");
