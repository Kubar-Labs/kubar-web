import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/*
 * Build step 1: the routes that exist so far. Each later step adds its pages
 * here (Home in step 3, the product pages and About in step 4, Contact and the
 * legal pages in step 5).
 */
const publicRoutes = ["/", "/products/kubar-protocol", "/products/navdhan-sdk", "/how-it-works", "/about", "/contact", "/legal/privacy", "/legal/terms"] as const;
const OG_IMAGE = /^https:\/\/kubar\.tech\/media\/kubar-labs-social-bd9a99c9\.png(?:\?.*)?$/;

/**
 * The pinned story (REDRAW-2026-11-14.md, section 3a): wait until its observer
 * is live, then scroll so state n's card has just crossed the 45% line.
 */
async function storyLive(page: Page) {
  await page.locator(".story-on ol[data-live]").first().waitFor({ state: "attached" });
}
async function scrollToState(page: Page, n: number) {
  await page.evaluate((n) => {
    const story = document.querySelector(".story-on")!;
    const slot = story.querySelectorAll("ol > li")[n - 1];
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height"));
    const pin = matchMedia("(min-width: 1200px)").matches ? 0 : story.querySelector<HTMLElement>(".story-pin")!.offsetHeight;
    const line = header + pin + 0.45 * (innerHeight - header - pin);
    window.scrollTo({ top: slot.getBoundingClientRect().top + scrollY - line + 20, behavior: "instant" });
  }, n);
}

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
}

test.describe("public routes", () => {
  for (const path of publicRoutes) {
    test(`${path} renders one h1, its canonical URL and the social image`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        path === "/" ? "https://kubar.tech" : new URL(path, "https://kubar.tech").href,
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", OG_IMAGE);
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", OG_IMAGE);
    });

    test(`${path} has no automated WCAG A or AA violations`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await expectNoAxeViolations(page);
    });
  }
});

test("Home carries its metadata from the handoff", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Kubar Labs · Building the institutional exchange for cross-border trade finance");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Starting with the asset: export receivables an international financier can buy again and again, insured in its own name.",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Kubar Labs");
});

test("an unknown address returns the 404 page with the header and footer", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "No record at this address." })).toBeVisible();
  for (const name of ["Home", "Kubar Protocol", "NavDhan SDK", "How it works", "Contact"]) {
    await expect(page.getByRole("main").getByRole("link", { name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expectNoAxeViolations(page);
});

test("old routes redirect permanently", async ({ request }) => {
  const cases = [
    ["/products/navdhan", "/products/navdhan-sdk"],
    ["/for-platforms", "/products/navdhan-sdk"],
    ["/team", "/about#team"],
    ["/privacy", "/legal/privacy"],
  ];
  for (const [from, to] of cases) {
    const response = await request.get(from, { maxRedirects: 0 });
    expect([301, 308]).toContain(response.status());
    expect(response.headers()["location"]).toBe(to);
  }
});

test("skip link is the first focusable element and moves focus to the main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test.describe("header at desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("stays fixed when the page scrolls", async ({ page }) => {
    await page.goto("/specimens");
    await page.mouse.wheel(0, 1500);
    await expect(page.getByRole("banner")).toBeInViewport();
    expect(await page.getByRole("banner").evaluate((el) => el.getBoundingClientRect().top)).toBe(0);
  });

  test("Products opens on click, closes on Escape and returns focus", async ({ page }) => {
    await page.goto("/");
    const products = page.getByRole("button", { name: "Products" });
    await expect(products).toHaveAttribute("aria-expanded", "false");
    await products.click();
    await expect(products).toHaveAttribute("aria-expanded", "true");
    const protocol = page.getByRole("link", { name: /Kubar Protocol For banks/ });
    await expect(protocol).toBeVisible();
    await expect(protocol).toHaveAttribute("href", "/products/kubar-protocol");
    await expect(page.getByRole("link", { name: /NavDhan SDK For trade platforms/ })).toHaveAttribute(
      "href",
      "/products/navdhan-sdk",
    );
    await protocol.focus();
    await page.keyboard.press("Escape");
    await expect(products).toHaveAttribute("aria-expanded", "false");
    await expect(products).toBeFocused();
  });

  test("Products closes on a click outside", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Products" }).click();
    await page.mouse.click(700, 500);
    await expect(page.getByRole("button", { name: "Products" })).toHaveAttribute("aria-expanded", "false");
  });

  test("LinkedIn is in the footer, not the header, and says it opens in a new tab", async ({ page }) => {
    await page.goto("/");
    // Removed from the header on 15 Nov; the footer keeps it under Company.
    await expect(page.getByRole("banner").getByRole("link", { name: /LinkedIn/ })).toHaveCount(0);
    const linkedin = page.getByRole("contentinfo").getByRole("link", { name: "Kubar Labs on LinkedIn (opens in a new tab)" });
    await expect(linkedin).toHaveAttribute("target", "_blank");
    await expect(page.getByRole("banner").getByRole("link", { name: "Talk to us" })).toHaveAttribute("href", "/contact");
  });
});

test.describe("menu sheet below desktop", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens as a dialog, keeps focus inside, closes on Escape and returns focus", async ({ page }) => {
    await page.goto("/");
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.click();
    const sheet = page.getByRole("dialog", { name: "Menu" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("button", { name: "Close" })).toBeFocused();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe("hidden");
    for (let i = 0; i < 12; i += 1) await page.keyboard.press("Tab");
    expect(await sheet.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(menu).toBeFocused();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await menu.click();
    await expectNoAxeViolations(page);
  });
});

test.describe("primitives and registers (build step 2), on Home", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  // The record is now the isometric stack (REDRAW-2026-11-14.md, Home hero):
  // an ordered list of six rows, 06 first, beside an aria-hidden drawing.
  test("the record lifts a sheet and shows what its document proves on hover and focus, then returns to the current one", async ({ page }) => {
    await page.goto("/");
    const record = page.locator("ol[aria-describedby]").filter({ hasText: "Commercial invoice" });
    const rows = record.locator("li");
    await expect(rows).toHaveCount(6);
    await expect(rows.first()).toContainText("Purchase confirmation");
    await expect(rows.first()).toHaveAttribute("aria-current", "true");
    // Every row tells assistive technology what its document proves.
    await expect(rows.nth(4)).toContainText("Proves: The goods were cleared for export, as invoiced");
    const shown = page.locator('[aria-hidden="true"]').getByText("The financier bought the receivable, without recourse for the buyer’s credit");
    await expect(shown).toBeVisible();
    await expect(page.locator(".iso-lift.is-lifted")).toHaveCount(0);
    await rows.filter({ hasText: "Shipping bill" }).hover();
    await expect(page.locator('[aria-hidden="true"]').getByText("The goods were cleared for export, as invoiced")).toBeVisible();
    await expect(page.locator(".iso-lift.is-lifted")).toHaveCount(1);
    await page.mouse.move(0, 0);
    await expect(shown).toBeVisible();
    await expect(page.locator(".iso-lift.is-lifted")).toHaveCount(0);
    await rows.filter({ hasText: "Electronic bill of lading" }).focus();
    await expect(page.locator('[aria-hidden="true"]').getByText("The goods were shipped on board")).toBeVisible();
    await expect(page.locator(".iso-record svg")).toHaveAttribute("aria-hidden", "true");
  });

  test("Illustrative opens its note in place and closes again", async ({ page }) => {
    await page.goto("/");
    const tag = page.getByRole("button", { name: "Illustrative" }).first();
    await expect(tag).toHaveAttribute("aria-expanded", "false");
    await tag.click();
    await expect(tag).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("An example receivable, not a real transaction.").first()).toBeVisible();
    await tag.click();
    await expect(page.getByText("An example receivable, not a real transaction.").first()).toBeHidden();
  });

  test("a footnote marker goes to its footnote, and Back to text returns to the marker", async ({ page }) => {
    await page.goto("/");
    const marker = page.locator("#fnref-1");
    await expect(marker).toHaveAccessibleName("Footnote 1");
    await marker.click();
    await expect(page).toHaveURL(/#fn-1$/);
    await page.locator("#fn-1").getByRole("link", { name: "Back to text" }).click();
    await expect(page).toHaveURL(/#fnref-1$/);
    await expect(marker).toBeFocused();
  });

  test("the ledger is a table of eight states with 05 current and 08 planned", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const ledger = page.locator("table").filter({ has: page.getByRole("columnheader", { name: "What happens" }) });
    await expect(ledger.getByRole("columnheader")).toHaveCount(6);
    await expect(ledger.getByRole("rowheader")).toHaveCount(8);
    await expect(ledger.locator('[aria-current="step"]')).toContainText("Purchased");
    await expect(ledger.getByRole("row").last()).toContainText("Planned");
  });

  test("programme marks carry their programme's name", async ({ page }) => {
    await page.goto("/");
    for (const name of ["GIFT IFIH Young Builders Program", "Claude for Startups", "MongoDB for Startups"]) {
      await expect(page.getByRole("img", { name, exact: true }).first()).toBeAttached();
    }
    await expect(page.getByRole("img", { name: "T-Hub, RubriX Cohort 5" }).first()).toBeAttached();
  });
});

test.describe("registers below desktop", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("stack without horizontal scroll and keep their table semantics", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
    const ledger = page.locator("table").filter({ has: page.getByRole("columnheader", { name: "What happens" }) });
    await expect(ledger.getByRole("rowheader")).toHaveCount(8);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expectNoAxeViolations(page);
  });
});

test.describe("Home (build step 3, in progress)", () => {
  test("footnote 1 appears once, under the foundations, and every marker 1 links to it", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("#fn-1")).toHaveCount(1);
    await expect(page.locator("#fn-1")).toContainText("Kubar’s own ITFS registration is targeted for 2027");
    // REDRAW-2026-11-14.md 9.6: the status footnote sits under the foundations, not in the hero.
    const foundationsY = (await page.getByRole("heading", { name: "An exchange needs more than a venue." }).boundingBox())!.y;
    expect((await page.locator("#fn-1").boundingBox())!.y).toBeGreaterThan(foundationsY);
    const markers = page.locator("a.footnote-marker", { hasText: "¹" });
    expect(await markers.count()).toBeGreaterThan(2);
    for (const marker of await markers.all()) await expect(marker).toHaveAttribute("href", "#fn-1");
    // Back to text returns to whichever marker the reader followed.
    await page.locator("#fnref-1-ledger").click();
    await expect(page).toHaveURL(/#fn-1$/);
    await page.locator("#fn-1").getByRole("link", { name: "Back to text" }).click();
    await expect(page).toHaveURL(/#fnref-1-ledger$/);
  });

  test("How we estimate this opens footnote 2, and its marker opens it too", async ({ page }) => {
    await page.goto("/");
    const disclosure = page.locator("details", { hasText: "How we estimate this" });
    await expect(disclosure).not.toHaveAttribute("open", "");
    await expect(page.locator("#fn-2")).toBeHidden();
    await expect(page.locator("#fn-3")).toBeVisible();
    await page.getByText("How we estimate this").click();
    await expect(page.locator("#fn-2")).toBeVisible();
    await page.getByText("How we estimate this").click();
    await expect(page.locator("#fn-2")).toBeHidden();
    await page.locator("#fnref-2").click();
    await expect(page.locator("#fn-2")).toBeVisible();
    await expect(page.locator("#fn-2")).toBeFocused();
  });

  test("at 390 the hero carries no footnote, with no sideways scroll", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const footnoteY = (await page.locator("#fn-1").boundingBox())!.y;
    const recordY = (await page.locator(".iso-record").getByText("Record RCV-0001").boundingBox())!.y;
    expect(footnoteY).toBeGreaterThan(recordY);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expectNoAxeViolations(page);
  });
});

test.describe("Home, complete (build step 3)", () => {
  test("has every section heading once and no automated WCAG violations at 1440", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    for (const name of [
      "The missing piece isn’t capital.",
      "Follow one receivable from shipment to settlement.",
      "An exchange needs more than a venue.",
      "Who takes part.",
      "Standing and memberships.",
      "The people building it.",
      "Start the right conversation.",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name, exact: true })).toHaveCount(1);
    }
    await expect(page.getByText("Kubar is in the data path of every step and in the money path of none.")).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test("with reduced motion the ledger shows and nothing is pinned", async ({ page }) => {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await expect(page.locator(".story-on")).toBeHidden();
      await expect(page.getByRole("columnheader", { name: "What happens" })).toBeVisible();
    }
  });

  test("the pinned story steps through eight states on scroll and can be skipped", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await storyLive(page);
    const story = page.locator("[data-story-state]");
    await expect(story).toHaveAttribute("data-story-state", "1");
    // The eight states are cards in reading order; the ledger waits as the fallback.
    await expect(story.locator("ol > li")).toHaveCount(8);
    await expect(page.locator(".story-ledger")).toBeHidden();
    for (const state of [3, 6, 8]) {
      await scrollToState(page, state);
      await expect(story).toHaveAttribute("data-story-state", String(state));
      await expect(story.locator('[aria-current="step"]')).toHaveCount(1);
      await expect(story.locator("ol > li").nth(state - 1).locator(".story-card")).toHaveAttribute("aria-current", "step");
    }
    await expect(page.getByText("Registry entry, planned")).toBeVisible();
    await scrollToState(page, 1);
    await page.getByRole("link", { name: "Skip the story" }).click();
    await expect(page).toHaveURL(/#closing-line$/);
    await page.waitForTimeout(500); // let the cards' 200 ms change finish before measuring contrast
    await expectNoAxeViolations(page);
  });

  test("contact routes carry their intents and people link out", async ({ page }) => {
    await page.goto("/");
    // The first two routes are cards, each one link; the financial-institution card is petrol.
    const institution = page.getByRole("link", { name: "A bank, finance company, insurer or fund Start a programme conversation" });
    await expect(institution).toHaveAttribute("href", "/contact?intent=institution");
    await expect(institution).toHaveAttribute("data-ground", "petrol");
    await expect(page.getByRole("link", { name: "A trade platform or marketplace Talk about an integration" })).toHaveAttribute("href", "/contact?intent=platform");
    await expect(page.getByRole("link", { name: "Email us" })).toHaveAttribute("href", "mailto:partnerships@kubar.tech");
    await expect(page.getByRole("link", { name: "Write to us" })).toHaveAttribute("href", "/contact?intent=other");
    const card = page.getByRole("link", { name: "Vaibhav Sharma on LinkedIn (opens in a new tab)" });
    await expect(card).toHaveAttribute("target", "_blank");
    await expect(page.getByRole("img", { name: "Kavish Mahajan, Creative Director" })).toBeAttached();
  });

  test("at 390 and 768 nothing scrolls sideways and axe is clean", async ({ page }) => {
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
      await expectNoAxeViolations(page);
    }
  });
});

test.describe("Home drawings (redraw step 2)", () => {
  test("the map reads in one order, keeps money away from Kubar and dims the arrows a card doesn't touch", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const map = page.locator(".party-map");
    await expect(map.getByRole("heading", { level: 3 })).toHaveText(["Buyers", "Financiers", "Exporters", "Trade platforms", "Kubar", "Credit insurers"]);
    await expect(map.getByText("Money path: only between banks")).toBeVisible();
    await expect(map.getByText("Data path: documents and records")).toBeVisible();
    // Six arrows between the cards at desktop: two solid (money), four dashed (data); none of money touches Kubar.
    const arrows = map.locator("svg:visible .draw-arrow");
    await expect(arrows).toHaveCount(6);
    await expect(map.locator("svg:visible .draw-arrow:has(.draw-solid)")).toHaveCount(2);
    for (const touches of await map.locator("svg:visible .draw-arrow:has(.draw-solid)").evaluateAll((els) => els.map((el) => el.getAttribute("data-touches")))) {
      expect(touches).not.toContain("kubar");
    }
    // The whole card is its link's target.
    await expect(map.locator('[data-party="kubar"]').getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    // Hovering Kubar dims the two money arrows and the data arrow between exporters and platforms.
    await map.locator('[data-party="kubar"]').hover();
    await page.waitForTimeout(300);
    const dimmed = await arrows.evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity === "0.3").map((el) => el.getAttribute("data-touches")));
    expect(dimmed.sort()).toEqual(["buyers financiers", "exporters platforms", "financiers exporters"]);
  });

  test("below desktop the map is one column with the return arrow up the right side", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const map = page.locator(".party-map");
    const names = ["buyers", "financiers", "exporters", "platforms", "kubar", "insurers"];
    let previous = -Infinity;
    for (const name of names) {
      const box = (await map.locator(`[data-party="${name}"]`).boundingBox())!;
      expect(box.y).toBeGreaterThan(previous);
      previous = box.y;
    }
    // Five arrows down the column and the dashed return arrow, drawn between the measured cards.
    await expect(map.locator("svg:visible .draw-arrow")).toHaveCount(6);
    await expect(map.locator('svg:visible .draw-arrow[data-touches="kubar financiers"]')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });

  test("drawings start undrawn below the fold and play once as they come into view", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const map = page.locator(".party-map");
    await expect(map).toHaveAttribute("data-phase", "armed");
    await map.scrollIntoViewIfNeeded();
    await expect(map).toHaveAttribute("data-phase", "playing");
    // Reduced motion: everything is drawn from the start.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".party-map")).toHaveAttribute("data-phase", "done");
    await expect(page.locator(".iso-foundations")).toHaveAttribute("data-phase", "done");
  });

  test("on desktop a foundation label marks its block with rani top edges, below desktop nothing, and Tab skips it", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    // Computed values, not whether :has() matches (a fill utility once beat the rule).
    const label = page.locator('.iso-foundations li[data-level="2"]');
    const edge = page.locator('.iso-top-edge[data-level="2"]');
    const face = page.locator(".iso-top").nth(2);
    const opacity = () => edge.evaluate((el) => getComputedStyle(el).opacity);
    const white = await face.evaluate((el) => getComputedStyle(el).fill);
    await expect(label).toHaveAttribute("tabindex", "-1");
    expect(await opacity()).toBe("0");
    await label.hover();
    await expect.poll(opacity).toBe("1");
    expect(await edge.evaluate((el) => getComputedStyle(el).strokeWidth)).toBe("2px");
    // The face stays white.
    expect(await face.evaluate((el) => getComputedStyle(el).fill)).toBe(white);
    await page.mouse.move(0, 0);
    await expect.poll(opacity).toBe("0");
    // A click focuses the label, and the mark holds.
    await label.click();
    await expect(label).toBeFocused();
    await expect.poll(opacity).toBe("1");
    // Tab skips the labels and the map's Buyers card; the record's rows stay in the route.
    await expect(page.locator('[data-party="buyers"]')).toHaveAttribute("tabindex", "-1");
    await expect(page.locator(".iso-record ol li").first()).toHaveAttribute("tabindex", "0");
    // Below desktop the labels sit under the drawing: no mark.
    await page.setViewportSize({ width: 390, height: 844 });
    await label.click();
    await expect(label).toBeFocused();
    expect(await opacity()).toBe("0");
  });

  test("standing is four plain statements, and the programmes sit in one row at desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const section = page.locator("section", { has: page.getByRole("heading", { name: "Standing and memberships." }) });
    await expect(section.locator("table")).toHaveCount(0);
    const statements = section.locator("ul").first().locator("li");
    await expect(statements).toHaveCount(4);
    // No kind labels (REDRAW section 10): each statement starts with its kind.
    await expect(statements.first()).toHaveText("Priority entry to the IFSCA FinTech Innovation Sandbox through GIFT IFIH");
    const marks = section.locator("ul").nth(1).locator("li");
    await expect(marks).toHaveCount(6);
    const tops = await marks.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(1);
  });
});

test.describe("Home hero order", () => {
  test("below 1200 the record follows the headline in the page and on screen; from 1200 the desktop grid", async ({ page }) => {
    const top = (selector: string) => page.locator(selector).first().evaluate((el) => el.getBoundingClientRect().top);
    // Phones, tablets and iPads (portrait and landscape).
    for (const [width, height] of [[390, 844], [375, 667], [744, 1133], [820, 1180], [1180, 820]] as const) {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      const h1Bottom = await page.locator("main h1").evaluate((el) => el.getBoundingClientRect().bottom);
      const record = await top(".iso-record");
      expect(Math.round(record - h1Bottom), `${width}: 24 px under the headline`).toBe(24);
      // On the first screen.
      expect(record, `${width}: the record starts on the first screen`).toBeLessThan(height);
      expect(await top("main h1 ~ p"), `${width}: subline after the record`).toBeGreaterThan(record);
      expect(await top('a[href="#one-receivable"]')).toBeGreaterThan(await top("main h1 ~ p"));
    }
    // The page order is the screen order: headline, record, subline, routes, anchor.
    const inOrder = await page.evaluate(() => {
      const nodes = [
        document.querySelector("main h1"),
        document.querySelector(".iso-record"),
        document.querySelector("main h1 ~ p:not(.iso-record *)"),
        document.querySelector('a[href="#one-receivable"]'),
      ];
      return nodes.every((node, i) => i === 0 || Boolean(nodes[i - 1]!.compareDocumentPosition(node!) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    expect(inOrder).toBe(true);
    // From 1200: the record beside the headline, the routes under the headline.
    await page.setViewportSize({ width: 1376, height: 1032 });
    await page.goto("/");
    expect(Math.round(await top(".iso-record"))).toBe(Math.round(await top("main h1")));
    await expect(page.locator("main h1 ~ p").first()).toBeHidden();
  });
});

test.describe("pinned story (redraw step 3)", () => {
  const sizes = [[1440, 790], [1366, 650], [1536, 730], [1280, 590], [820, 1050], [390, 664], [375, 548]] as const;
  const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const state = (page: Page) => page.locator("[data-story-state]");

  for (const path of ["/", "/how-it-works"]) {
    test(`${path} pins the drawing at every required viewport, also as the address bar hides and shows`, async ({ page }) => {
      for (const [width, height] of sizes) {
        await page.setViewportSize({ width, height });
        await page.goto(path);
        await storyLive(page);
        const lanes = page.locator(".story-on .lanes");
        await scrollToState(page, 3);
        await expect(state(page), `${width}x${height}`).toHaveAttribute("data-story-state", "3");
        const pinned = Math.round((await lanes.boundingBox())!.y);
        await scrollToState(page, 5);
        await expect(state(page), `${width}x${height}`).toHaveAttribute("data-story-state", "5");
        expect(Math.round((await lanes.boundingBox())!.y), `${width}x${height} pinned`).toBe(pinned);
        // The address bar hides: a taller viewport. The story stays, still pinned.
        await page.setViewportSize({ width, height: height + 56 });
        await scrollToState(page, 6);
        await expect(state(page), `${width}x${height + 56}`).toHaveAttribute("data-story-state", "6");
        await expect(page.locator(".story-on")).toBeVisible();
        expect(Math.round((await lanes.boundingBox())!.y), `${width}x${height + 56} pinned`).toBe(pinned);
        // And shows again.
        await page.setViewportSize({ width, height });
        await scrollToState(page, 7);
        await expect(state(page), `${width}x${height}`).toHaveAttribute("data-story-state", "7");
        expect(Math.round((await lanes.boundingBox())!.y), `${width}x${height} pinned again`).toBe(pinned);
        // 08 shows with the drawing still in place; once the last card has gone, the drawing goes too.
        await scrollToState(page, 8);
        await expect(state(page), `${width}x${height}`).toHaveAttribute("data-story-state", "8");
        expect(Math.round((await lanes.boundingBox())!.y), `${width}x${height} pinned at 08`).toBe(pinned);
        await page.evaluate(() => {
          const last = document.querySelectorAll(".story-on ol > li")[7].getBoundingClientRect();
          window.scrollTo({ top: last.bottom + scrollY - 40, behavior: "instant" });
        });
        expect((await lanes.boundingBox())!.y, `${width}x${height} released`).toBeLessThan(pinned - 100);
        expect(await overflow(page), `${width}x${height}`).toBe(0);
      }
    });

    test(`${path}: the lanes fit their column, with no sideways scroll at 1200, 1280 and 1366`, async ({ page }) => {
      for (const width of [1200, 1280, 1366]) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        expect(await overflow(page), `${width}`).toBe(0);
        const lanes = (await page.locator(".story-on .lanes").boundingBox())!;
        expect(lanes.x + lanes.width, `${width}`).toBeLessThanOrEqual(width);
      }
    });
  }

  test("a screen too short for the smallest rows gets the ledger", async ({ page }) => {
    for (const [width, height] of [[844, 390], [375, 500], [1280, 520]] as const) {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      await expect(page.locator(".story"), `${width}x${height}`).toHaveAttribute("data-story-fits", "false");
      await expect(page.locator(".story-on")).toBeHidden();
      await expect(page.getByRole("columnheader", { name: "What happens" })).toBeVisible();
    }
  });
});

test.describe("Kubar Protocol (redraw step 4)", () => {
  test("carries its metadata, actions and the venue footnote", async ({ page }) => {
    await page.goto("/products/kubar-protocol");
    await expect(page).toHaveTitle("Kubar Protocol · Kubar Labs");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Underwrite once. Buy every receivable that fits.");
    await expect(page.getByRole("link", { name: "Start a programme conversation" }).first()).toHaveAttribute("href", "/contact?intent=institution");
    await expect(page.getByRole("link", { name: "partnerships@kubar.tech" })).toHaveAttribute("href", "mailto:partnerships@kubar.tech");
    await expect(page.locator("#fn-1")).toHaveCount(1);
    await expect(page.getByText("Planned", { exact: true })).toHaveCount(1);
    // Ten questions, the two halves of "How a programme runs" and the five parties of "Who holds what".
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(17);
  });

  test("redraw: the limit drawing, one Illustrative, the sheet, the loop, the holders and the corridor", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/products/kubar-protocol");
    // The hero's drawing is decoration; the page says Illustrative once, on the receivable sheet.
    await expect(page.locator("main section").first().locator("svg[aria-hidden='true']").first()).toBeAttached();
    await expect(page.getByRole("button", { name: "Illustrative" })).toHaveCount(1);
    const sheet = page.locator("dl").filter({ hasText: "Face value" });
    await expect(sheet.getByText("$225,000", { exact: true })).toBeVisible();
    // The loop: five steps in order, no party tags; the line draws once in view.
    const loop = page.locator(".programme-loop");
    await expect(loop.locator("ol > li")).toHaveCount(5);
    await expect(loop.locator("ol > li").first()).toContainText("The exporter, or its platform, submits the shipment");
    await expect(loop.locator("ol > li").first()).not.toContainText("Exporter\n");
    await expect(loop).toHaveAttribute("data-phase", "armed");
    await loop.scrollIntoViewIfNeeded();
    await expect(loop).toHaveAttribute("data-phase", "playing");
    // A card only raises: a tap or click focuses it, Tab skips it.
    const card = loop.locator(".loop-card").nth(2);
    await expect(card).toHaveAttribute("tabindex", "-1");
    // Who holds what: the financier is the petrol card.
    await expect(page.locator('[data-ground="petrol"]').filter({ hasText: "You, the financier" })).toHaveCount(1);
    // Programme 1: Next in a dashed box; the venue has no numbers.
    await expect(page.locator("dl.border-dashed")).toContainText("Chemicals and pharmaceutical formulations");
    await expect(page.locator("section", { has: page.getByRole("heading", { name: "The venue comes last." }) }).locator(".t-code")).toHaveCount(0);
  });

  test("laptops keep the 1440 composition from 1200 up", async ({ page }) => {
    const box = async (selector: string) => (await page.locator(selector).first().boundingBox())!;
    for (const width of [1200, 1280, 1366, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/products/kubar-protocol");
      // What you buy: the timeline beside the sheet from 1280, under it at full width below that.
      const sheet = await box("dl:has(> dt:text-is('Face value'))");
      const timeline = await box("[role='img'][aria-label^='A timeline']");
      if (width >= 1280) expect(timeline.x, `${width}: timeline beside the sheet`).toBeGreaterThan(sheet.x + sheet.width);
      else expect(timeline.y, `${width}: timeline under the sheet`).toBeGreaterThan(sheet.y + sheet.height);
      // How a programme runs: the loop beside the set-up list, its cards inside the page.
      const setUp = await box(".programme-loop >> xpath=ancestor::div[contains(@class,'fit-stage')]/preceding-sibling::div[1]");
      const loop = await box(".programme-loop");
      expect(loop.x, `${width}: loop beside the list`).toBeGreaterThan(setUp.x + setUp.width - 1);
      expect(loop.x + loop.width, `${width}: loop inside the page`).toBeLessThanOrEqual(width);
      // The payment lanes beside the heading.
      const heading = await box("#payment-heading");
      const lanes = await box("[role='img'][aria-label^='Three payments']");
      expect(lanes.x, `${width}: lanes beside the heading`).toBeGreaterThan(heading.x + heading.width);
      expect(lanes.y, `${width}: lanes level with the heading`).toBeLessThan(heading.y + heading.height);
    }
  });

  test("references stay whole, Programme 1's labels are muted, and the payment path reads as drawn", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto("/products/kubar-protocol");
    for (const ref of await page.locator(".programme-loop .t-code > span").all()) {
      await expect(ref).toHaveCSS("white-space", "nowrap");
    }
    const muted = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.color = "var(--color-ink-muted)";
      document.body.appendChild(probe);
      const colour = getComputedStyle(probe).color;
      probe.remove();
      return colour;
    });
    for (const label of ["Exporters", "Buyers", "Financier", "Cover", "Next"]) {
      await expect(page.locator("dt", { hasText: new RegExp(`^${label}$`) }).last()).toHaveCSS("color", muted);
    }
    // At 1440 the note sits on its grey chip.
    await expect(page.locator("[role='img'][aria-label^='Three payments'] p", { hasText: "Kubar holds none" })).toHaveClass(/bg-accent-soft/);
    // Below 1200: "Kubar" with the chip, and "Buyer → Financier’s collection account".
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/products/kubar-protocol");
    const kubarRow = page.locator("p", { has: page.locator("span", { hasText: "Kubar holds none" }) }).filter({ hasText: /^Kubar/ });
    await expect(kubarRow.first()).toBeVisible();
    await expect(kubarRow.first()).not.toContainText("Kubar:");
    await expect(page.getByRole("row", { name: /Face value, on the due date/ })).toContainText("Financier’s collection account");
    await expect(page.getByRole("row", { name: /Face value, on the due date/ })).toContainText("Buyer");
  });

  test("tablets and phones keep the small money timeline and the evidence drawing", async ({ page }) => {
    for (const [width, height] of [[390, 844], [768, 1024], [820, 1180]] as const) {
      await page.setViewportSize({ width, height });
      await page.goto("/products/kubar-protocol");
      await expect(page.getByText("Day 0", { exact: true }), `${width}`).toBeVisible();
      await expect(page.getByText("Day 75", { exact: true }), `${width}`).toBeVisible();
      // The stacked evidence drawing: the elements, then the record box with its three readers.
      await expect(page.locator("li:visible", { hasText: "You buy on it" }), `${width}`).toHaveCount(1);
      await expect(page.locator("p:visible", { hasText: /^Record RCV-0001$/ }), `${width}`).toHaveCount(1);
    }
  });

  test("nothing scrolls sideways from 1200 to 1440", async ({ page }) => {
    for (const width of [1200, 1280, 1366, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/products/kubar-protocol");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${width}`).toBe(0);
    }
  });

  test("at 390 and 768 nothing scrolls sideways and axe is clean", async ({ page }) => {
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/products/kubar-protocol");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
      await expectNoAxeViolations(page);
    }
  });
});

test.describe("NavDhan SDK (build step 4)", () => {
  test("carries its metadata and actions, and no status words", async ({ page }) => {
    await page.goto("/products/navdhan-sdk");
    await expect(page).toHaveTitle("NavDhan SDK · Kubar Labs");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Trade finance inside the software your exporters already use.");
    await expect(page.getByRole("link", { name: "Talk about an integration" }).first()).toHaveAttribute("href", "/contact?intent=platform");
    await expect(page.getByText(/In build|Where it stands/)).toHaveCount(0);
    await expect(page.getByRole("link", { name: "See Kubar Protocol" })).toHaveAttribute("href", "/products/kubar-protocol");
  });

  test("at 390 and 768 nothing scrolls sideways and axe is clean", async ({ page }) => {
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/products/navdhan-sdk");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
      await expectNoAxeViolations(page);
    }
  });
});

test.describe("How it works (build step 4)", () => {
  test("carries its metadata, routes, glossary and one status footnote", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/how-it-works");
    await expect(page).toHaveTitle("How it works · Kubar Labs");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("From the port to the record.");
    await expect(page.getByRole("link", { name: "For financial institutions" })).toHaveAttribute("href", "/products/kubar-protocol");
    await expect(page.getByRole("link", { name: "Who holds what" })).toHaveAttribute("href", "/products/kubar-protocol#who-holds-what");
    await expect(page.getByRole("link", { name: "Talk about an integration" })).toHaveAttribute("href", "/contact?intent=platform");
    await expect(page.locator("#fn-1")).toHaveCount(1);
    await expect(page.locator("#term-itfs")).toContainText("targeted for 2027");
    await expect(page.locator("[id^=term-]")).toHaveCount(19);
    await expect(page.getByText("In build")).toHaveCount(0);
  });

  test("the anchor from Who holds what lands on Kubar Protocol's section", async ({ page }) => {
    await page.goto("/products/kubar-protocol#who-holds-what");
    await expect(page.locator("#who-holds-what")).toBeInViewport();
  });

  test("the rail steps through eight states with the documents line, and skips to the evidence", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/how-it-works");
    await storyLive(page);
    const story = page.locator("[data-story-state]");
    await expect(story).toHaveAttribute("data-story-state", "1");
    await expect(page.getByRole("link", { name: "See how it works" })).toHaveCount(0);
    await scrollToState(page, 6);
    await expect(story).toHaveAttribute("data-story-state", "6");
    await expect(story.locator('[aria-current="step"]')).toContainText("Payment reference; closure of the shipping bill");
    await scrollToState(page, 1);
    await page.getByRole("link", { name: "Skip the story" }).click();
    await expect(page).toHaveURL(/#evidence$/);
    // Let the evidence stack arrive (the record waits at 40% until it has), then check state 06.
    await page.locator("#evidence ol").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await scrollToState(page, 6);
    await expect(story).toHaveAttribute("data-story-state", "6");
    await page.waitForTimeout(500);
    await expectNoAxeViolations(page);
  });

  test("the evidence stack arrives and ends fully shown", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/how-it-works");
    await page.locator("#evidence").scrollIntoViewIfNeeded();
    await page.locator("#evidence ol").scrollIntoViewIfNeeded();
    const cards = page.locator("#evidence ol > li");
    await expect(cards).toHaveCount(8);
    await expect(cards.last()).toContainText("The financier owns the receivable");
    await expect(cards.last()).toHaveCSS("opacity", "1");
    await expect(page.getByText("Record RCV-0001 · Evidence package", { exact: true }).locator("xpath=../..")).toHaveCSS("opacity", "1");
  });

  test("with reduced motion at 390 and 768 the ledger shows, nothing scrolls sideways and axe is clean", async ({ page }) => {
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/how-it-works");
      await expect(page.locator(".story-on")).toBeHidden();
      await expect(page.locator(".story-ledger").getByText("Kubar is in the data path of every step and in the money path of none.")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
      await expectNoAxeViolations(page);
    }
  });
});

test.describe("About (build step 4)", () => {
  test("carries its metadata, the team anchor, both status footnotes and no removed section", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveTitle("About · Kubar Labs");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Foundations first.");
    await expect(page.locator("#team")).toHaveCount(1);
    await expect(page.locator("#team ul").first().locator("li")).toHaveCount(6);
    await expect(page.getByRole("link", { name: "Rayansh Srivastava on LinkedIn (opens in a new tab)" })).toHaveAttribute("target", "_blank");
    await expect(page.locator("#fn-1")).toHaveCount(1);
    await expect(page.locator("#fn-1-gift")).toHaveCount(1);
    await expect(page.getByText("Planned", { exact: true })).toHaveCount(1);
    await expect(page.getByText("Where we are")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Email us (partnerships@kubar.tech)" })).toHaveAttribute("href", "mailto:partnerships@kubar.tech");
    await expect(page.getByRole("link", { name: "Follow one receivable through all five" })).toHaveAttribute("href", "/how-it-works");
  });

  test("portraits load through the image optimiser at the size the layout needs", async ({ page }) => {
    await page.goto("/about");
    const portraits = page.locator("#team img");
    await expect(portraits).toHaveCount(6);
    for (const img of await portraits.all()) {
      await img.scrollIntoViewIfNeeded();
      // The first request for each size makes the optimiser transcode an 800 × 1000 PNG.
      await expect(img).toHaveJSProperty("complete", true, { timeout: 15_000 });
      expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
      expect(await img.evaluate((el: HTMLImageElement) => el.currentSrc)).toMatch(/\/_next\/image\?url=%2Fpeople%2F.+&w=\d+&q=75$/);
    }
  });

  test("the old /team address lands on the team", async ({ page }) => {
    await page.goto("/team");
    await expect(page).toHaveURL(/\/about#team$/);
    await expect(page.getByRole("heading", { name: "The team." })).toBeInViewport();
  });

  test("at 390 and 768 nothing scrolls sideways and axe is clean", async ({ page }) => {
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/about");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
      await expectNoAxeViolations(page);
    }
  });
});

test.describe("Contact (build step 5)", () => {
  const fill = async (page: import("@playwright/test").Page) => {
    await page.getByLabel("Full name").fill("Arjun Mehta");
    await page.getByLabel("Work email").fill("arjun.mehta@bank.example");
    await page.getByLabel("Organisation").fill("A bank’s IFSC Banking Unit");
    await page.getByLabel("What would you like to discuss?").fill("We finance rice exporters and would like to understand how a programme would run for us.");
  };
  const send = (page: import("@playwright/test").Page) => page.getByRole("button", { name: "Send message" }).click();

  test("carries its metadata, the routes and the direct addresses", async ({ page }) => {
    await page.goto("/contact");
    await expect(page).toHaveTitle("Contact · Kubar Labs");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Talk to us.");
    await expect(page.getByRole("link", { name: "Ask about Programme 1" })).toHaveAttribute("href", "/contact?intent=exporter#form");
    await expect(page.getByRole("link", { name: "Email us" })).toHaveAttribute("href", "mailto:partnerships@kubar.tech");
    await expect(page.getByRole("link", { name: "keshav@kubar.tech" })).toHaveAttribute("href", "mailto:keshav@kubar.tech");
    await expect(page.getByText(/24 hours/)).toHaveCount(0);
    for (const label of ["Full name", "Work email", "Organisation", "Your role", "What would you like to discuss?"]) {
      await expect(page.getByLabel(label)).toHaveValue("");
      await expect(page.getByLabel(label)).not.toHaveAttribute("placeholder", /.+/);
    }
    await expect(page.getByText("0 of 2,000")).toBeVisible();
  });

  test("each ?intent= value preselects its option and sets the message help", async ({ page }) => {
    const help: Record<string, string | null> = {
      institution: "For example: the trade you finance today, the limits you work with, or what your credit committee will ask.",
      platform: "For example: your platform, the exporters on it and what you’d like them to have.",
      exporter: "For example: what you export, where your buyers are and how much of your bank limit you use.",
      investor: "For example: your fund and what you’d like to know.",
      press: "For example: your publication, your deadline and your question.",
      other: null,
    };
    for (const [intent, line] of Object.entries(help)) {
      await page.goto(`/contact?intent=${intent}`);
      await expect(page.getByLabel("I’m writing as")).toHaveValue(intent);
      if (line) await expect(page.getByText(line)).toBeVisible();
      else await expect(page.getByText(/^For example/)).toHaveCount(0);
    }
    await page.goto("/contact?intent=nonsense");
    await expect(page.getByLabel("I’m writing as")).toHaveValue("");
  });

  test("a route on the page chooses the intent without a reload", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("link", { name: "Talk about an integration" }).click();
    await expect(page.getByLabel("I’m writing as")).toHaveValue("platform");
  });

  test("sending an empty form shows every message as written, and the summary takes focus", async ({ page }) => {
    let called = false;
    await page.route("**/api/contact", (route) => { called = true; return route.fulfill({ status: 200, body: "{}" }); });
    await page.goto("/contact");
    await send(page);
    const summary = page.getByRole("alert").filter({ hasText: "Your message didn’t send. Please check these fields." });
    await expect(summary).toBeFocused();
    for (const message of [
      "Please choose who you’re writing as.",
      "Please enter your full name.",
      "Please enter your work email.",
      "Please enter your organisation.",
      "Please tell us what you’d like to discuss.",
    ]) {
      await expect(summary.getByRole("link", { name: message })).toBeVisible();
      await expect(page.getByText(message)).toHaveCount(2);
    }
    await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Your role")).not.toHaveAttribute("aria-invalid", "true");
    await summary.getByRole("link", { name: "Please enter your work email." }).click();
    await expect(page.getByLabel("Work email")).toBeFocused();
    expect(called).toBe(false);
    await expectNoAxeViolations(page);
  });

  test("a malformed email and an over-long message get their own messages", async ({ page }) => {
    await page.goto("/contact?intent=press");
    await fill(page);
    await page.getByLabel("Work email").fill("arjun at bank");
    await page.getByLabel("What would you like to discuss?").fill("m".repeat(2001));
    await expect(page.getByText("2,001 of 2,000")).toBeVisible();
    await send(page);
    await expect(page.getByText("Please enter an email address in the form name@organisation.com.")).toHaveCount(2);
    await expect(page.getByText("Please keep your message under 2,000 characters.")).toHaveCount(2);
  });

  test("a sent message posts the new contract and is replaced by the thanks", async ({ page }) => {
    let body: Record<string, unknown> = {};
    await page.route("**/api/contact", async (route) => {
      body = route.request().postDataJSON();
      await new Promise((resolve) => setTimeout(resolve, 400));
      await route.fulfill({ status: 200, contentType: "application/json", body: '{"success":true}' });
    });
    await page.goto("/contact?intent=institution");
    await fill(page);
    await page.getByLabel("Your role").fill("Head of trade finance");
    const button = page.getByRole("button", { name: "Send message" });
    const width = (await button.boundingBox())!.width;
    await button.click();
    const sending = page.getByRole("button", { name: "Sending…" });
    await expect(sending).toBeVisible();
    await expect(sending).not.toHaveAttribute("disabled");
    expect((await sending.boundingBox())!.width).toBe(width);
    const heading = page.getByRole("heading", { name: "Message sent." });
    await expect(heading).toBeFocused();
    await expect(page.getByText("Thank you, Arjun. Your message is with the team, and we’ll reply from a kubar.tech address.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to the home page" })).toHaveAttribute("href", "/");
    await expect(page.locator("form")).toHaveCount(0);
    expect(body).toEqual({
      intent: "institution",
      name: "Arjun Mehta",
      email: "arjun.mehta@bank.example",
      organisation: "A bank’s IFSC Banking Unit",
      role: "Head of trade finance",
      message: "We finance rice exporters and would like to understand how a programme would run for us.",
      website: "",
    });
    await expectNoAxeViolations(page);
  });

  test("server error, rate limit and offline each show their copy and keep the values", async ({ page, context }) => {
    await page.goto("/contact?intent=exporter");
    await fill(page);

    await page.route("**/api/contact", (route) => route.fulfill({ status: 500, contentType: "application/json", body: "{}" }));
    await send(page);
    await expect(page.getByText("Your message didn’t send. Please try again, or email outreach@kubar.tech directly.")).toBeVisible();
    await expect(page.locator("form").getByRole("link", { name: "outreach@kubar.tech" })).toHaveAttribute("href", "mailto:outreach@kubar.tech");
    await expectNoAxeViolations(page);

    await page.unroute("**/api/contact");
    await page.route("**/api/contact", (route) => route.fulfill({ status: 429, contentType: "application/json", body: "{}" }));
    await send(page);
    await expect(
      page.getByText("We’ve had several messages from this connection in a short time. Please wait a few minutes and try again, or email outreach@kubar.tech."),
    ).toBeVisible();

    await context.setOffline(true);
    await send(page);
    await expect(page.getByText("You seem to be offline. Your message is still here; send it again when you’re connected.")).toBeVisible();
    await context.setOffline(false);

    await expect(page.getByLabel("Full name")).toHaveValue("Arjun Mehta");
    await expect(page.getByLabel("I’m writing as")).toHaveValue("exporter");
  });

  test("the honeypot is out of reach of people and assistive technology", async ({ page }) => {
    await page.goto("/contact");
    const trap = page.locator("#contact-website");
    await expect(trap).toHaveAttribute("tabindex", "-1");
    await expect(page.getByRole("textbox", { name: "Leave this field empty" })).toHaveCount(0);
    expect((await trap.boundingBox())!.x).toBeLessThan(0);
  });

  test("the API on this server rejects cross-origin and oversize requests", async ({ request }) => {
    const data = { intent: "other", name: "A", email: "a@b.example", organisation: "B", message: "Hello" };
    expect((await request.post("/api/contact", { data, headers: { origin: "https://example.com" } })).status()).toBe(403);
    expect((await request.post("/api/contact", { data: { ...data, message: "x".repeat(12_000) }, headers: { origin: "https://kubar.tech" } })).status()).toBe(413);
  });

  test("at 390 and 768 nothing scrolls sideways and axe is clean", async ({ page }) => {
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/contact");
      await send(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
      await expectNoAxeViolations(page);
    }
  });
});

test.describe("Legal pages (build step 5)", () => {
  test("the privacy notice has its eleven sections, contents links and the grievance address", async ({ page }) => {
    await page.goto("/legal/privacy");
    await expect(page).toHaveTitle("Privacy notice · Kubar Labs");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy notice");
    await expect(page.getByRole("navigation", { name: "Contents" }).getByRole("link")).toHaveCount(11);
    await page.getByRole("link", { name: "9. Grievance Officer" }).click();
    await expect(page).toHaveURL(/#section-9$/);
    await expect(page.getByRole("heading", { name: "9. Grievance Officer" })).toBeInViewport();
    await expect(page.getByRole("main").getByRole("link", { name: "keshav@kubar.tech" })).toHaveAttribute("href", "mailto:keshav@kubar.tech");
  });

  test("the terms have their thirteen sections and link to the privacy notice", async ({ page }) => {
    await page.goto("/legal/terms");
    await expect(page).toHaveTitle("Terms of use · Kubar Labs");
    await expect(page.getByRole("navigation", { name: "Contents" }).getByRole("link")).toHaveCount(13);
    await expect(page.getByRole("main").getByRole("link", { name: "privacy notice", exact: true })).toHaveAttribute("href", "/legal/privacy");
  });

  test("the old /privacy address lands on the notice, and both pages fit at 390", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveURL(/\/legal\/privacy$/);
    await page.setViewportSize({ width: 390, height: 900 });
    for (const path of ["/legal/privacy", "/legal/terms"]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
      await expectNoAxeViolations(page);
    }
  });
});

test.describe("Metadata, social card and structured data (build step 6)", () => {
  // HANDOFF section 5, word for word.
  const pages: [string, string, string][] = [
    ["/", "Kubar Labs · Building the institutional exchange for cross-border trade finance", "Starting with the asset: export receivables an international financier can buy again and again, insured in its own name."],
    ["/products/kubar-protocol", "Kubar Protocol · Kubar Labs", "Underwrite once, then buy every export receivable that fits: without recourse for the buyer’s credit, insured in your name, with the evidence behind each one."],
    ["/products/navdhan-sdk", "NavDhan SDK · Kubar Labs", "Embed NavDhan SDK so your exporters can finance their export receivables inside your platform. Financiers buy; Kubar runs the programme."],
    ["/how-it-works", "How it works · Kubar Labs", "Follow one illustrative export receivable from shipment to settlement: who does what, the documents behind each step and where the money moves."],
    ["/about", "About · Kubar Labs", "Kubar Labs is building the institutional exchange for cross-border trade finance, foundations first. The team and our standing."],
    ["/contact", "Contact · Kubar Labs", "Talk to Kubar Labs about a programme, an integration or anything else. Tell us who you are and your message reaches the right people."],
    ["/legal/privacy", "Privacy notice · Kubar Labs", "How Kubar Labs handles personal data collected through kubar.tech."],
    ["/legal/terms", "Terms of use · Kubar Labs", "The terms on which kubar.tech is offered."],
  ];

  for (const [path, title, description] of pages) {
    test(`${path} carries its title, description and the shared social card`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", description);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Kubar Labs");
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", pages[0][2]);
      await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", "Kubar Labs: Building the institutional exchange for cross-border trade finance.");
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", path === "/" ? "https://kubar.tech" : `https://kubar.tech${path}`);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
      await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", "Kubar Labs");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index, follow/);
    });
  }

  test("the social image is a 1200 by 630 PNG, cached for a year, and /opengraph-image points at it", async ({ page, request }) => {
    const image = await request.get("/media/kubar-labs-social-bd9a99c9.png");
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toBe("image/png");
    expect(image.headers()["cache-control"]).toContain("immutable");
    const bytes = await image.body();
    expect(bytes.readUInt32BE(16)).toBe(1200);
    expect(bytes.readUInt32BE(20)).toBe(630);
    await page.goto("/");
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    const redirect = await request.get("/opengraph-image", { maxRedirects: 0 });
    expect(redirect.status()).toBe(308);
    expect(redirect.headers().location).toBe("/media/kubar-labs-social-bd9a99c9.png");
    expect((await request.get("/media/kubar-labs-og-b2add55b.png")).status()).toBe(404);
  });

  test("the Organisation JSON-LD names the entity, the new logo, partnerships@ and LinkedIn only", async ({ page, request }) => {
    await page.goto("/about");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks).toHaveLength(1);
    const data = JSON.parse(blocks[0]);
    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Kubar Labs",
      legalName: "Kubar Protocol Private Limited",
      url: "https://kubar.tech",
      logo: "https://kubar.tech/media/kubar-mark-970208af.png",
      email: "partnerships@kubar.tech",
      sameAs: ["https://www.linkedin.com/company/kubarlabs/"],
    });
    expect((await request.get("/media/kubar-mark-970208af.png")).status()).toBe(200);
  });

  test("the sitemap lists the eight routes and robots points at it", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(pages.map(([path]) => (path === "/" ? "https://kubar.tech" : `https://kubar.tech${path}`)));
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap: https://kubar.tech/sitemap.xml");
    expect(robots).toContain("Disallow: /api/");
  });

  test("pages that are not for search say so", async ({ page }) => {
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
    // The build's specimen page is gone.
    expect((await page.request.get("/specimens")).status()).toBe(404);
  });

  test("the footer copyright carries the current year and the favicon is the mark", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(`© ${new Date().getFullYear()} Kubar Protocol Private Limited`)).toBeVisible();
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", /icon\.svg/);
  });
});

test.describe("Abbreviations (HANDOFF section 8)", () => {
  test("the first use on a page carries its expansion; later uses are plain text", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/about");
    const itfs = page.locator('abbr[data-abbr="ITFS"]');
    await expect(itfs).toHaveCount(1);
    await expect(page.locator('abbr[data-abbr="GIFT City"]')).toHaveCount(1);
    expect(await page.getByRole("main").getByText("ITFS").count()).toBeGreaterThan(1);
    const tip = itfs.getByRole("tooltip", { includeHidden: true });
    await expect(tip).toBeHidden();
    await expect(itfs).toHaveAccessibleDescription("International Trade Finance Service platform");
    // No abbreviation sits inside a link, a button, a heading or a header cell.
    expect(await page.locator("a abbr, button abbr, h1 abbr, h2 abbr, h3 abbr, th abbr").count()).toBe(0);
  });

  test("the tooltip opens on focus and on hover, stays under the pointer and closes with Escape", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/about");
    const itfs = page.locator('abbr[data-abbr="ITFS"]');
    const tip = itfs.getByRole("tooltip", { includeHidden: true });
    await itfs.focus();
    await expect(tip).toBeVisible();
    await expect(tip).toHaveText("International Trade Finance Service platform");
    await page.keyboard.press("Escape");
    await expect(tip).toBeHidden();
    await itfs.blur();
    await itfs.hover();
    await expect(tip).toBeVisible();
    await tip.hover();
    await expect(tip).toBeVisible();
    await expectNoAxeViolations(page);
    await page.mouse.move(5, 5);
    await expect(tip).toBeHidden();
  });

  test("the marks follow the page on a client navigation, and tooltips stay inside a 390 px screen", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("abbr[data-abbr]").first()).toBeAttached();
    for (const abbr of await page.locator("abbr[data-abbr]").all()) {
      await abbr.scrollIntoViewIfNeeded();
      await abbr.focus();
      const box = await abbr.getByRole("tooltip").boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(390);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "How it works" }).click();
    await expect(page).toHaveURL(/\/how-it-works$/);
    await expect(page.locator('abbr[data-abbr="RBI"]')).toHaveCount(1);
  });
});
