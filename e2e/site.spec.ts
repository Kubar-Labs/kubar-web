import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/*
 * Build step 1: the routes that exist so far. Each later step adds its pages
 * here (Home in step 3, the product pages and About in step 4, Contact and the
 * legal pages in step 5).
 */
const publicRoutes = ["/"] as const;
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
