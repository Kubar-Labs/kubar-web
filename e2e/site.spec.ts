import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/*
 * Build step 1: the routes that exist so far. Each later step adds its pages
 * here (Home in step 3, the product pages and About in step 4, Contact and the
 * legal pages in step 5).
 */
const publicRoutes = ["/", "/products/kubar-protocol", "/products/navdhan-sdk", "/how-it-works", "/about", "/contact", "/legal/privacy", "/legal/terms"] as const;
const OG_IMAGE = /^https:\/\/kubar\.tech\/media\/kubar-labs-social-bd9a99c9\.png(?:\?.*)?$/;

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
    const story = page.locator("[data-story-state]");
    await expect(story).toHaveAttribute("data-story-state", "1");
    await expect(page.getByRole("link", { name: "See how it works" })).toHaveCount(0);
    const top = await story.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((y) => window.scrollTo(0, y), top - 105 + 420 * 5 + 100);
    await expect(story).toHaveAttribute("data-story-state", "6");
    await expect(story.getByText("Payment reference; closure of the shipping bill")).toBeVisible();
    await page.evaluate((y) => window.scrollTo(0, y), top);
    await page.getByRole("link", { name: "Skip the story" }).click();
    await expect(page).toHaveURL(/#evidence$/);
    // Let the evidence stack arrive (the record waits at 40% until it has), then check state 06.
    await page.locator("#evidence ol").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await page.evaluate((y) => window.scrollTo(0, y), top - 105 + 420 * 5 + 100);
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
    await expect(page.getByText("Record RCV-0001 · Evidence package, 8 of 8").locator("xpath=../..")).toHaveCSS("opacity", "1");
  });

  test("at 390 and 768 the ledger shows, nothing scrolls sideways and axe is clean", async ({ page }) => {
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/how-it-works");
      await expect(page.locator("[data-story-state]")).toHaveCount(0);
      await expect(page.getByText("Kubar is in the data path of every step and in the money path of none.")).toBeVisible();
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
    for (const path of ["/specimens", "/no-such-page"]) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
    }
  });

  test("the footer copyright carries the current year and the favicon is the mark", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(`© ${new Date().getFullYear()} Kubar Protocol Private Limited`)).toBeVisible();
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", /icon\.svg/);
  });
});
