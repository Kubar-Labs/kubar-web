import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/*
 * Build step 1: the routes that exist so far. Each later step adds its pages
 * here (Home in step 3, the product pages and About in step 4, Contact and the
 * legal pages in step 5).
 */
const publicRoutes = ["/", "/products/kubar-protocol", "/products/navdhan-sdk"] as const;
const OG_IMAGE = /^https:\/\/kubar\.tech\/media\/kubar-labs-og-b2add55b\.png(?:\?.*)?$/;

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

test("the specimen page stays out of search", async ({ page }) => {
  await page.goto("/specimens");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  const sitemap = await page.request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toContain("/specimens");
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

  test("LinkedIn says it opens in a new tab", async ({ page }) => {
    await page.goto("/");
    const linkedin = page.getByRole("banner").getByRole("link", { name: "Kubar Labs on LinkedIn (opens in a new tab)" });
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

test.describe("primitives and registers (build step 2, on /specimens)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the specimen page has no automated WCAG A or AA violations", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/specimens");
    await expectNoAxeViolations(page);
  });

  test("the record shows what each document proves on hover and focus, then returns to the current one", async ({ page }) => {
    await page.goto("/specimens");
    const record = page.locator("table").filter({ has: page.getByRole("columnheader", { name: "Document" }) });
    await expect(record.getByRole("row")).toHaveCount(7);
    const proves = page.getByText("The financier bought the receivable, without recourse for the buyer’s credit").last();
    await expect(proves).toBeVisible();
    await record.getByRole("row", { name: /Shipping bill/ }).hover();
    await expect(page.locator('[aria-hidden="true"]').getByText("The goods were cleared for export, as invoiced")).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(proves).toBeVisible();
    await record.getByRole("row", { name: /Electronic bill of lading/ }).focus();
    await expect(page.locator('[aria-hidden="true"]').getByText("The goods were shipped on board")).toBeVisible();
    await expect(record).toHaveAttribute("aria-describedby", /.+/);
  });

  test("Illustrative opens its note in place and closes again", async ({ page }) => {
    await page.goto("/specimens");
    const tag = page.getByRole("button", { name: "Illustrative" }).first();
    await expect(tag).toHaveAttribute("aria-expanded", "false");
    await tag.click();
    await expect(tag).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("An example receivable, not a real transaction.").first()).toBeVisible();
    await tag.click();
    await expect(page.getByText("An example receivable, not a real transaction.").first()).toBeHidden();
  });

  test("a footnote marker goes to its footnote, and Back to text returns to the marker", async ({ page }) => {
    await page.goto("/specimens");
    const marker = page.locator("#fnref-specimen-1");
    await expect(marker).toHaveAccessibleName("Footnote 1");
    await marker.click();
    await expect(page).toHaveURL(/#fn-specimen-1$/);
    await page.locator("#fn-specimen-1").getByRole("link", { name: "Back to text" }).click();
    await expect(page).toHaveURL(/#fnref-specimen-1$/);
    await expect(marker).toBeFocused();
  });

  test("the ledger is a table of eight states with 05 current and 08 planned", async ({ page }) => {
    await page.goto("/specimens");
    const ledger = page.locator("table").filter({ has: page.getByRole("columnheader", { name: "What happens" }) });
    await expect(ledger.getByRole("columnheader")).toHaveCount(6);
    await expect(ledger.getByRole("rowheader")).toHaveCount(8);
    await expect(ledger.locator('[aria-current="step"]')).toContainText("Purchased");
    await expect(ledger.getByRole("row").last()).toContainText("Planned");
  });

  test("programme marks carry their programme's name", async ({ page }) => {
    await page.goto("/specimens");
    for (const name of ["GIFT IFIH Young Builders Program", "Claude for Startups", "MongoDB for Startups"]) {
      await expect(page.getByRole("img", { name, exact: true }).first()).toBeAttached();
    }
    await expect(page.getByRole("img", { name: "T-Hub, RubriX Cohort 5" }).first()).toBeAttached();
  });

  test("the sending button keeps its width", async ({ page }) => {
    await page.goto("/specimens");
    const idle = page.getByRole("button", { name: "Send message", exact: true }).first();
    const sending = page.getByRole("button", { name: "Sending…", exact: true });
    await expect(sending).toHaveAttribute("aria-disabled", "true");
    const [idleBox, sendingBox] = [await idle.boundingBox(), await sending.boundingBox()];
    expect(Math.round(sendingBox!.width)).toBe(Math.round(idleBox!.width));
  });
});

test.describe("registers below desktop", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("stack without horizontal scroll and keep their table semantics", async ({ page }) => {
    await page.goto("/specimens");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
    const ledger = page.locator("table").filter({ has: page.getByRole("columnheader", { name: "What happens" }) });
    await expect(ledger.getByRole("rowheader")).toHaveCount(8);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expectNoAxeViolations(page);
  });
});

test.describe("Home (build step 3, in progress)", () => {
  test("footnote 1 has one target, reached from the headline and from the ledger", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#fn-1")).toHaveCount(1);
    await expect(page.locator('a[href="#fn-1"]')).toHaveCount(2);
    await page.locator("#fnref-1").click();
    await expect(page).toHaveURL(/#fn-1$/);
  });

  test("at 390 the status footnote sits before the record, with no sideways scroll", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const footnoteY = (await page.locator("#fn-1").boundingBox())!.y;
    const recordY = (await page.getByText("Record RCV-0001").boundingBox())!.y;
    expect(footnoteY).toBeLessThan(recordY);
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
      "Who takes part, and what each one does.",
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
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("[data-story-state]")).toHaveCount(0);
    await expect(page.getByRole("columnheader", { name: "What happens" })).toBeVisible();
  });

  test("the pinned story steps through eight states on scroll and can be skipped", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const story = page.locator("[data-story-state]");
    await expect(story).toHaveAttribute("data-story-state", "1");
    // The register stays in the DOM for assistive technology.
    await expect(page.getByRole("columnheader", { name: "What happens" })).toBeAttached();
    const top = await story.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    for (const state of [3, 6, 8]) {
      await page.evaluate((y) => window.scrollTo(0, y), top - 105 + 420 * (state - 1) + 100);
      await expect(story).toHaveAttribute("data-story-state", String(state));
    }
    await expect(page.getByText("Registry entry, planned")).toBeVisible();
    await page.evaluate((y) => window.scrollTo(0, y), top);
    await page.getByRole("link", { name: "Skip the story" }).click();
    await expect(page).toHaveURL(/#closing-line$/);
    await page.waitForTimeout(500); // let the panel's 200 ms cross-fade finish before measuring contrast
    await expectNoAxeViolations(page);
  });

  test("contact routes carry their intents and people link out", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Start a programme conversation" })).toHaveAttribute("href", "/contact?intent=institution");
    await expect(page.getByRole("link", { name: "Talk about an integration" })).toHaveAttribute("href", "/contact?intent=platform");
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

test.describe("Kubar Protocol (build step 4)", () => {
  test("carries its metadata, actions and the venue footnote", async ({ page }) => {
    await page.goto("/products/kubar-protocol");
    await expect(page).toHaveTitle("Kubar Protocol · Kubar Labs");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Underwrite once. Buy every receivable that fits.");
    await expect(page.getByRole("link", { name: "Start a programme conversation" }).first()).toHaveAttribute("href", "/contact?intent=institution");
    await expect(page.getByRole("link", { name: "partnerships@kubar.tech" })).toHaveAttribute("href", "mailto:partnerships@kubar.tech");
    await expect(page.locator("#fn-1")).toHaveCount(1);
    await expect(page.getByText("Planned", { exact: true })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(10);
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
