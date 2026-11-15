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
    // The cards' own slots (How it works has a second list in the pinned stack).
    const slot = story.querySelectorAll(".story-card")[n - 1].parentElement!;
    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height"));
    const pin = matchMedia("(min-width: 1200px)").matches ? 0 : story.querySelector<HTMLElement>(".story-pin")!.offsetHeight;
    const line = header + pin + 0.45 * (innerHeight - header - pin);
    window.scrollTo({ top: slot.getBoundingClientRect().top + scrollY - line + 20, behavior: "instant" });
  }, n);
}

async function expectNoAxeViolations(page: Page) {
  // Measure only once nothing is moving: a drawing that is still fading in reads as low contrast.
  // (A fixed wait isn't enough: headless frames only advance when something asks for one.)
  await expect
    .poll(() => page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running" && (a.effect?.getComputedTiming().iterations ?? 1) !== Infinity).length), { timeout: 10_000 })
    .toBe(0);
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

  test("Home marks its example in words, with no Illustrative tag", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Illustrative" })).toHaveCount(0);
    await expect(
      page.getByText("An example: a $225,000 rice invoice to a buyer in the UAE, due 75 days after shipment.", { exact: true }),
    ).toBeVisible();
    await expect(page.locator(".iso-record ol").first()).toHaveAccessibleDescription(
      "An example record of one export receivable, with six documents filed.",
    );
  });

  // The Illustrative tag's open-and-close test went with the component in build step 6: no page has the tag.
  test("no page carries an Illustrative tag", async ({ page }) => {
    for (const path of publicRoutes) {
      await page.goto(path);
      await expect(page.getByRole("button", { name: "Illustrative" }), path).toHaveCount(0);
      await expect(page.getByText("Illustrative", { exact: true }), path).toHaveCount(0);
    }
  });

  test("Home after the 15 Nov audit: larger captions, no skip arrow, no technology programmes, 44 px tap areas", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.getByText(/^a year of Indian SME and mid-market export receiva/).first()).toHaveCSS("font-size", "17px");
    const note = page.getByText("Drawn to scale. $126.92M is about 0.16% of the bar above.", { exact: true });
    await expect(note).toHaveCSS("font-size", "13px");
    expect(await note.evaluate((el) => getComputedStyle(el).fontFamily)).not.toMatch(/mono/i);
    await expect(page.getByRole("link", { name: "Skip the story" }).locator("svg")).toHaveCount(0);
    await expect(page.getByText("Technology programmes, grants and credits")).toHaveCount(0);
    await page.goto("/about");
    await expect(page.getByText("Technology programmes, grants and credits")).toBeVisible();
    // On a touch screen (pointer: coarse) a standalone link's tap area is 44 px tall; the link looks the same.
    // Headless Chromium doesn't report a coarse pointer, so read the rule itself.
    await page.goto("/");
    const link = page.locator("main a.tap-area:visible").first();
    await expect(link).toBeVisible();
    expect((await link.boundingBox())!.height).toBeLessThan(44);
    const rule = await page.evaluate(() => {
      for (const sheet of [...document.styleSheets]) {
        const walk = (rules: CSSRuleList, coarse: boolean): string | null => {
          for (const r of [...rules]) {
            if (r instanceof CSSMediaRule) {
              const found = walk(r.cssRules, coarse || /pointer:\s*coarse/.test(r.conditionText));
              if (found) return found;
            } else if ("cssRules" in r && (r as CSSGroupingRule).cssRules?.length && !(r instanceof CSSStyleRule)) {
              const found = walk((r as CSSGroupingRule).cssRules, coarse);
              if (found) return found;
            } else if (coarse && r instanceof CSSStyleRule && /\.tap-area::?after/.test(r.selectorText)) {
              return `${r.style.position} ${r.style.height}`;
            }
          }
          return null;
        };
        const found = walk(sheet.cssRules, false);
        if (found) return found;
      }
      return null;
    });
    expect(rule).toBe("absolute 44px");
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
    // The technology programmes show on About only (section 13 B4); the finance programmes on both.
    await page.goto("/about");
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
    // Wait for the state itself before measuring contrast: every written lane row fully faded in
    // (a fixed wait isn't enough, since headless frames only advance when something asks for one).
    await expect
      .poll(() => page.evaluate(() => [...document.querySelectorAll(".story-on .lane-row")].every((row) => ["0", "1"].includes(getComputedStyle(row).opacity))))
      .toBe(true);
    await page.waitForTimeout(250);
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
    // Wait for the dimmed state itself, not for a fixed time.
    const dimmed = () => arrows.evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity === "0.3").map((el) => el.getAttribute("data-touches")).sort());
    await expect.poll(dimmed).toEqual(["buyers financiers", "exporters platforms", "financiers exporters"]);
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
        // How it works on a short phone: the pinned stack would take over half the screen, so the ledger shows.
        if (path === "/how-it-works" && width < 768 && height < 620) {
          await expect(page.locator(".story"), `${width}x${height}`).toHaveAttribute("data-story-fits", "false");
          await expect(page.locator(".story-ledger .iso-evidence ol > li")).toHaveCount(8);
          continue;
        }
        await storyLive(page);
        const lanes = page.locator(".story-on :is(.lanes, .story-stack)");
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
          const last = document.querySelectorAll(".story-on .story-card")[7].parentElement!.getBoundingClientRect();
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
        const lanes = (await page.locator(".story-on :is(.lanes, .story-stack)").boundingBox())!;
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

  test("redraw: the limit drawing, the sheet marked An example, the loop, the holders and the corridor", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/products/kubar-protocol");
    // The hero's drawing is decoration. No Illustrative tag (15 Nov): the sheet's top row says "An example" in plain words.
    await expect(page.locator("main section").first().locator("svg[aria-hidden='true']").first()).toBeAttached();
    await expect(page.getByRole("button", { name: "Illustrative" })).toHaveCount(0);
    const example = page.getByText("An example", { exact: true });
    await expect(example).toHaveCount(1);
    await expect(example).toBeVisible();
    await expect(example).toHaveClass(/t-fine/);
    await expect(example).toHaveClass(/text-ink-muted/);
    const title = page.getByText("Receivable RCV-0001", { exact: true });
    const [t, e] = [(await title.boundingBox())!, (await example.boundingBox())!];
    expect(Math.abs(t.y + t.height / 2 - (e.y + e.height / 2)), "on the title's row").toBeLessThan(4);
    expect(e.x, "at the right of the row").toBeGreaterThan(t.x + t.width);
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

  test("the evidence package shows its ten elements once; a row is a button that opens its Checked against line", async ({ page, browser }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/products/kubar-protocol");
    const list = page.locator(".evidence-sources");
    const rows = list.getByRole("button");
    await expect(rows).toHaveCount(10);
    await expect(page.getByRole("columnheader", { name: "Checked against" })).toHaveCount(0);
    const line = (text: string) => list.getByText(text, { exact: true });
    await expect(rows.nth(2)).toHaveAttribute("aria-expanded", "false");
    await expect(line("The invoice: goods, quantity, value and buyer")).toBeHidden();
    // Hover opens nothing; a click does, and the plus turns to a minus.
    await rows.nth(2).hover();
    await expect(line("The invoice: goods, quantity, value and buyer")).toBeHidden();
    const icon = () => rows.nth(2).locator("svg path").getAttribute("d");
    const plus = await icon();
    await rows.nth(2).click();
    await expect(rows.nth(2)).toHaveAttribute("aria-expanded", "true");
    await expect(line("The invoice: goods, quantity, value and buyer")).toBeVisible();
    expect(await icon()).not.toBe(plus);
    // One at a time, from the keyboard too.
    await rows.nth(5).focus();
    await page.keyboard.press("Enter");
    await expect(line("Headroom on the buyer’s limit")).toBeVisible();
    await expect(line("The invoice: goods, quantity, value and buyer")).toBeHidden();
    await expect(rows.nth(2)).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("Space");
    await expect(line("Headroom on the buyer’s limit")).toBeHidden();
    await expectNoAxeViolations(page);
    // A tap on a phone.
    const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const tab = await phone.newPage();
    await tab.goto("/products/kubar-protocol");
    const tapped = tab.locator(".evidence-sources").getByRole("button").nth(7);
    await tapped.scrollIntoViewIfNeeded();
    await tapped.tap();
    await expect(tab.locator(".evidence-sources").getByText("The bank’s letter", { exact: true })).toBeVisible();
    expect((await tapped.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await tab.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    await phone.close();
  });

  test("the loss history and the buyer limit are drawn, with their labels as lists", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/products/kubar-protocol");
    const loss = page.locator(".loss-history");
    await expect(loss.locator("svg").first()).toHaveAttribute("aria-hidden", "true");
    await expect(loss.locator("ul > li")).toHaveText(["Settled", "The loss historyRecorded by buyer, exporter and commodity", "It lets an insurer price the pool", "It brings in the next financier"]);
    // The lead isn't shown; it describes the drawing for screen readers.
    const lead = page.getByText(/^Recorded by buyer, exporter and commodity, it lets an insurer price the pool/);
    await expect(lead).toHaveClass(/sr-only/);
    // RCV-0003 waits 40 px higher, then comes down once in view.
    await expect(loss).toHaveAttribute("data-phase", "armed");
    await loss.scrollIntoViewIfNeeded();
    await expect(loss).toHaveAttribute("data-phase", "playing");
    await expect(loss.locator(".loss-settle")).toHaveCSS("transform", "none");
    // Insurance: the lead stays, the box sits under it with three labels and no movement.
    const insurance = page.locator("section", { has: page.locator("#insurance-heading") });
    await expect(insurance.getByText(/^The credit-insurance policy is yours/)).toBeVisible();
    await expect(insurance.locator("ul > li")).toHaveText(["An approved buyer limit", "Headroom", "Receivables bought"]);
    await expect(insurance.locator(".limit-settle")).toHaveCount(0);
    // Below 1200 the labels sit under each drawing.
    await page.setViewportSize({ width: 390, height: 844 });
    for (const scope of [loss, insurance]) {
      const art = (await scope.locator("svg").first().boundingBox())!;
      const first = (await scope.locator("ul > li").first().boundingBox())!;
      expect(first.y).toBeGreaterThan(art.y + art.height - 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });

  test("the loop stepper: a click on a card calls the travelling sheet to it and raises the card", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/products/kubar-protocol");
    const loop = page.locator(".programme-loop");
    await loop.scrollIntoViewIfNeeded();
    const sheet = loop.locator(".loop-sheet");
    const card = (no: string) => loop.locator(`.loop-card[data-step="${no}"]`);
    await card("02").hover();
    await expect(loop).not.toHaveAttribute("data-picked", "02");
    await card("02").click();
    await expect(loop).toHaveAttribute("data-picked", "02");
    await expect(sheet).toHaveCSS("offset-distance", "12%");
    expect(await card("02").evaluate((el) => getComputedStyle(el, "::before").opacity)).toBe("1");
    await card("04").click();
    await expect(sheet).toHaveCSS("offset-distance", "52%");
    // A click elsewhere sends it back to rest by 05.
    await page.locator("#runs-heading").click();
    await expect(loop).not.toHaveAttribute("data-picked", /.+/);
    await expect(sheet).toHaveCSS("offset-distance", "72%");
  });

  test("the questions are an accordion below 768, first one open, and stay open from 768 up", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/products/kubar-protocol");
    const questions = page.locator("section", { has: page.locator("#questions-heading") });
    const buttons = questions.getByRole("button");
    await expect(buttons).toHaveCount(10);
    await expect(buttons.first()).toHaveAttribute("aria-expanded", "true");
    await expect(buttons.nth(1)).toHaveAttribute("aria-expanded", "false");
    await expect(questions.locator("p:visible")).toHaveCount(1);
    await buttons.nth(3).click();
    await expect(buttons.nth(3)).toHaveAttribute("aria-expanded", "true");
    await expect(buttons.first()).toHaveAttribute("aria-expanded", "false");
    await expect(questions.locator("p:visible")).toHaveCount(1);
    expect((await buttons.nth(1).boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(questions.getByRole("button")).toHaveCount(0);
    await expect(questions.locator("p:visible")).toHaveCount(10);
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

test.describe("NavDhan SDK (build step 6)", () => {
  test("the hero carries What you embed: picking a row marks it and outlines its part of the sketch", async ({ page, browser }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/products/navdhan-sdk");
    const hero = page.locator("main section").first();
    await expect(hero.getByRole("heading", { name: "What you embed." })).toBeVisible();
    const rows = hero.getByRole("button", { pressed: undefined }).filter({ hasNot: page.locator("svg") });
    const row = (name: string) => hero.getByRole("button", { name: new RegExp(`^${name}`) });
    const sketch = hero.getByRole("img");
    await expect(hero.locator("ul > li > button:visible")).toHaveCount(6);
    expect(await rows.count()).toBeGreaterThanOrEqual(6);
    // Eligibility check is picked from the start.
    await expect(row("Eligibility check")).toHaveAttribute("aria-pressed", "true");
    const outlined = () => sketch.locator(".outline-2:visible");
    await expect(outlined()).toHaveCount(1);
    await expect(outlined()).toContainText("Buyer country");
    await expect(row("Eligibility check")).toHaveCSS("border-left-color", "rgb(2, 39, 50)");
    // Hover picks; the pick stays when the pointer leaves.
    await row("Indicative offer").hover();
    await expect(row("Indicative offer")).toHaveAttribute("aria-pressed", "true");
    await expect(outlined()).toContainText("All-in price");
    await page.mouse.move(5, 5);
    await expect(row("Indicative offer")).toHaveAttribute("aria-pressed", "true");
    // Shipment and document capture outlines the Shipment list.
    await row("Shipment and document capture").click();
    await expect(outlined()).toContainText("Bill of lading");
    // The two rows with no part in the sketch swap the panel's content.
    await expect(sketch.getByText("Identity check", { exact: true })).toBeHidden();
    await row("Consented onboarding").focus();
    await expect(sketch.getByText("Identity check", { exact: true })).toBeVisible();
    await expect(sketch.getByText("Consent recorded", { exact: true })).toBeVisible();
    await expect(sketch.getByText("Indicative offer", { exact: true })).toBeHidden();
    await expect(sketch.getByText("Purchased", { exact: true })).toBeHidden();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(row("Events for your product")).toHaveAttribute("aria-pressed", "true");
    await expect(sketch.getByText("Purchased", { exact: true })).toBeVisible();
    await expect(sketch.getByText("Indicative offer", { exact: true })).toBeVisible();
    // The sketch sits beside the list.
    const list = (await hero.locator("ul").first().boundingBox())!;
    const art = (await sketch.boundingBox())!;
    expect(art.x).toBeGreaterThan(list.x + list.width);
    await expectNoAxeViolations(page);
    // 1000 to 1199: the sketch beside the list, the list about 45% wide. Below 1000: the accordion, no full sketch.
    await page.setViewportSize({ width: 1024, height: 900 });
    const l2 = (await hero.locator("ul").first().boundingBox())!;
    const a2 = (await sketch.boundingBox())!;
    expect(a2.x).toBeGreaterThan(l2.x + l2.width - 1);
    expect(l2.width / 944).toBeGreaterThan(0.4);
    expect(l2.width / 944).toBeLessThan(0.5);
    for (const width of [999, 820, 768]) {
      await page.setViewportSize({ width, height: 1180 });
      await expect(sketch, `${width}`).toBeHidden();
      await expect(hero.getByRole("button", { expanded: true }), `${width}`).toHaveCount(1);
    }
    // Phones: no full sketch; the rows are an accordion, each opening its own piece of the sketch.
    const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const tab = await phone.newPage();
    await tab.goto("/products/navdhan-sdk");
    const phoneHero = tab.locator("main section").first();
    await expect(phoneHero.getByRole("img")).toBeHidden();
    const accordion = phoneHero.locator("ul > li > button:visible");
    await expect(accordion).toHaveCount(6);
    const open = (name: string) => phoneHero.getByRole("button", { name: new RegExp(`^${name}`), expanded: true });
    await expect(phoneHero.getByRole("button", { expanded: true })).toHaveCount(1);
    await expect(open("Eligibility check")).toBeVisible();
    const piece = (name: string) => phoneHero.locator("li", { has: tab.getByRole("button", { name: new RegExp(`^${name}`) }) }).locator("div[id]:visible");
    await expect(piece("Eligibility check")).toContainText("Buyer country");
    const pieces: [string, string][] = [
      ["Consented onboarding", "Identity checkBusiness checkConsent recorded"],
      ["Shipment and document capture", "Bill of lading"],
      ["Indicative offer", "All-in price"],
      ["Application and status", "Settlement"],
      ["Events for your product", "InvoicePurchased"],
    ];
    for (const [name, text] of pieces) {
      const button = phoneHero.locator("ul > li > button:visible", { hasText: name });
      await button.scrollIntoViewIfNeeded();
      await button.tap();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      await expect(phoneHero.getByRole("button", { expanded: true })).toHaveCount(1);
      await expect(piece(name)).toContainText(text);
      const box = (await piece(name).boundingBox())!;
      const rowBox = (await button.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(rowBox.y + rowBox.height - 1);
      expect(box.x + box.width).toBeLessThanOrEqual(390 - 20 + 1);
    }
    expect(await tab.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    // A row closed on a phone, then a wider screen: Eligibility check is picked again.
    await phoneHero.getByRole("button", { expanded: true }).tap();
    await expect(phoneHero.getByRole("button", { expanded: true })).toHaveCount(0);
    await tab.setViewportSize({ width: 1024, height: 768 });
    await expect(phoneHero.getByRole("button", { name: /^Eligibility check/, pressed: true })).toBeVisible();
    await expect(phoneHero.getByRole("img").locator(".outline-2:visible")).toContainText("Buyer country");
    await phone.close();
  });

  test("two audiences side by side, no numbers on the rules, no column heads, the layers drawn", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/products/navdhan-sdk");
    const a = (await page.getByRole("heading", { name: "Dollar finance beyond their bank limit." }).boundingBox())!;
    const b = (await page.getByRole("heading", { name: "Finance in your product." }).boundingBox())!;
    expect(Math.round(a.y)).toBe(Math.round(b.y));
    expect(b.x).toBeGreaterThan(a.x + a.width);
    await expect(page.getByRole("columnheader")).toHaveCount(0);
    for (const gone of ["Capability", "Step", "What happens", "You keep the relationship"]) {
      await expect(page.getByText(gone, { exact: true }), gone).toHaveCount(0);
    }
    const rules = page.locator("section", { has: page.locator("#rules-heading") });
    await expect(rules.locator("ol > li")).toHaveCount(4);
    await expect(rules.locator(".t-code")).toHaveCount(0);
    const layers = page.locator(".iso-layers");
    await expect(layers.locator("svg").first()).toHaveAttribute("aria-hidden", "true");
    await expect(layers.locator("ol > li")).toHaveText(["NavDhan SDK", "Your platform", "Kubar Protocol", "Banks, insurers and funds"]);
    await expect(layers).toHaveAttribute("data-phase", "armed");
    await layers.scrollIntoViewIfNeeded();
    await expect(layers).toHaveAttribute("data-phase", "playing");
    // A label marks its layer on hover.
    const label = layers.locator("ol > li").nth(2);
    await label.hover();
    await expect.poll(() => label.locator(".iso-top-edge").evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    // Stacked below 1200.
    await page.setViewportSize({ width: 768, height: 1024 });
    const a2 = (await page.getByRole("heading", { name: "Dollar finance beyond their bank limit." }).boundingBox())!;
    const b2 = (await page.getByRole("heading", { name: "Finance in your product." }).boundingBox())!;
    expect(b2.y).toBeGreaterThan(a2.y + a2.height);
  });

  test("laptops keep the 1440 composition, and nothing scrolls sideways at any width", async ({ page }) => {
    for (const width of [375, 390, 768, 1200, 1280, 1366, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/products/navdhan-sdk");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${width}`).toBe(0);
      if (width >= 1200) {
        const hero = page.locator("main section").first();
        const list = (await hero.locator("ul").first().boundingBox())!;
        const art = (await hero.getByRole("img").boundingBox())!;
        expect(art.x, `${width}: sketch beside the list`).toBeGreaterThan(list.x + list.width - 1);
        expect(art.x + art.width, `${width}: sketch inside the page`).toBeLessThanOrEqual(width);
      }
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

  test("the rail tells the story on the evidence stack: documents land state by state, relying lines follow", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/how-it-works");
    await storyLive(page);
    const story = page.locator("[data-story-state]");
    const stack = page.locator(".story-on .story-stack");
    const row = (no: string) => stack.locator(`li[data-doc="${no}"]`);
    const relying = (text: string) => stack.getByText(text, { exact: true }).locator("xpath=ancestor::li[1]");
    await expect(story).toHaveAttribute("data-story-state", "1");
    await expect(page.locator(".story-on .lanes")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "See how it works" })).toHaveCount(0);
    // The documents in their new order, top down.
    await expect(stack.locator("ol > li")).toHaveText([
      "Doc 08Purchase confirmation",
      "Doc 07Buyer’s acknowledgement",
      "Doc 06Credit-insurance cover",
      "Doc 05No-objection",
      "Doc 04Inspection report, where the programme requires one",
      "Doc 03Bill of lading, electronic where issued",
      "Doc 02Shipping bill",
      "Doc 01Commercial invoice",
    ]);
    // State 01: Doc 01 to 03.
    for (const no of ["01", "02", "03"]) await expect(row(no)).toHaveCSS("opacity", "1");
    for (const no of ["04", "08"]) await expect(row(no)).toHaveCSS("opacity", "0");
    await scrollToState(page, 2);
    for (const no of ["04", "05"]) await expect(row(no)).toHaveCSS("opacity", "1");
    await expect(row("06")).toHaveCSS("opacity", "0");
    await scrollToState(page, 3);
    await expect(row("06")).toHaveCSS("opacity", "1");
    await scrollToState(page, 4);
    await expect(row("07")).toHaveCSS("opacity", "1");
    await expect(row("08")).toHaveCSS("opacity", "0");
    await expect(relying("The financier buys on it.")).toHaveCSS("opacity", "0");
    await scrollToState(page, 5);
    await expect(row("08")).toHaveCSS("opacity", "1");
    await expect(stack.locator('svg:visible g[data-from="5"]')).toHaveCSS("opacity", "1");
    await expect(relying("The financier buys on it.")).toHaveCSS("opacity", "1");
    await expect(relying("The exporter’s bank closes the shipping bill against it.")).toHaveCSS("opacity", "0");
    await scrollToState(page, 6);
    await expect(relying("The exporter’s bank closes the shipping bill against it.")).toHaveCSS("opacity", "1");
    await expect(relying("The government’s interest subvention is filed on it, where the exporter qualifies.")).toHaveCSS("opacity", "1");
    await expect(relying("The insurer prices on it.")).toHaveCSS("opacity", "0");
    await scrollToState(page, 7);
    await expect(relying("The insurer prices on it.")).toHaveCSS("opacity", "1");
    // Once shown, each stays.
    await scrollToState(page, 8);
    await expect(row("01")).toHaveCSS("opacity", "1");
    await expect(relying("The financier buys on it.")).toHaveCSS("opacity", "1");
    // The cards carry no Documents block and no legend; the notes sit under the stack.
    await expect(page.locator(".story-on").getByText("Documents", { exact: true })).toHaveCount(0);
    await expect(page.locator(".story-on").getByText("Data path: documents and records")).toHaveCount(0);
    await expect(page.locator(".story-on").getByText(/^Each element carries its source/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Who relies on the record." })).toHaveCount(0);
    // Skip the story goes to the next section.
    await scrollToState(page, 1);
    await page.getByRole("link", { name: "Skip the story" }).click();
    await expect(page).toHaveURL(/#money$/);
    await expectNoAxeViolations(page);
  });

  test("with reduced motion at 390 and 768 the ledger shows, nothing scrolls sideways and axe is clean", async ({ page }) => {
    for (const width of [390, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/how-it-works");
      await expect(page.locator(".story-on")).toBeHidden();
      await expect(page.locator(".story-ledger").getByText("Kubar is in the data path of every step and in the money path of none.")).toBeVisible();
      // The complete stack comes with the ledger.
      await expect(page.locator(".story-ledger .iso-evidence ol > li")).toHaveCount(8);
      await expect(page.locator(".story-ledger").getByText("The insurer prices on it.", { exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
      await expectNoAxeViolations(page);
    }
  });
});

test.describe("How it works (build step 5)", () => {
  const box = async (page: Page, selector: string) => (await page.locator(selector).first().boundingBox())!;

  test("the hero's eight steps, no Illustrative tag, and the cuts of section 10", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/how-it-works");
    const steps = page.locator("svg.iso-steps");
    await expect(steps).toHaveAttribute("aria-hidden", "true");
    await expect(steps.locator(".steps-rise")).toHaveCount(8);
    await expect(steps.locator(".steps-petrol")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Illustrative" })).toHaveCount(0);
    await expect(page.getByText("Illustrative", { exact: true })).toHaveCount(0);
    // The lead and the meta description keep "illustrative" in words.
    await expect(page.getByText(/^One illustrative receivable, followed step by step/)).toBeVisible();
    // Section 10: the two shortened headings, no legend line for Kubar, nothing under the evidence stack's rows but the financier's line.
    await expect(page.getByRole("heading", { name: "What happens to a receivable.", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "If a buyer doesn’t pay.", exact: true })).toBeVisible();
    await expect(page.getByText("Kubar: the one filled column")).toHaveCount(0);
    await expect(page.getByText("05 Purchased")).toHaveCount(0);
    await expect(page.getByText(/8 of 8/)).toHaveCount(0);
    await expect(page.locator(".story-on").getByText("Record RCV-0001 · Evidence package", { exact: true })).toBeVisible();
    // The glossary has no column heads; each term is its row's header.
    const glossary = page.locator("table").filter({ has: page.locator("#term-itfs") });
    await expect(glossary.getByRole("columnheader")).toHaveCount(0);
    await expect(glossary.getByRole("rowheader")).toHaveCount(19);
  });

  test("a row lifts its sheet on hover and on a tap, and Tab skips the rows", async ({ page, browser }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/how-it-works");
    const sheet = (doc: string) => page.locator(`.story-on .iso-evidence svg:visible .iso-lift[data-doc="${doc}"]`);
    const row = page.locator('.story-on .iso-evidence li[data-doc="03"]');
    await expect(row).toHaveAttribute("tabindex", "-1");
    await row.hover();
    await expect(sheet("03")).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -14)");
    await expect(sheet("02")).toHaveCSS("transform", "none");
    // A phone: a tap on a row lifts its sheet.
    const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const tab = await phone.newPage();
    await tab.goto("/how-it-works");
    const tapped = tab.locator('.story-on .iso-evidence li[data-doc="02"]');
    await tapped.scrollIntoViewIfNeeded();
    await tapped.tap();
    await expect(tab.locator('.story-on .iso-evidence svg:visible .iso-lift[data-doc="02"]')).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -14)");
    await phone.close();
  });

  test("with reduced motion the drawings stand still and a lift is a colour change", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const path of ["/", "/how-it-works"]) {
      await page.goto(path);
      const scope = path === "/" ? ".iso-record" : ".story-ledger .iso-evidence";
      const row = page.locator(`${scope} li`).nth(2);
      await row.scrollIntoViewIfNeeded();
      await row.hover();
      const lifted = page.locator(`${scope} svg:visible .iso-lift`).nth(path === "/" ? 3 : 5);
      await expect(lifted, path).toHaveCSS("transform", "none");
      await expect(lifted.locator("rect").nth(2), path).not.toHaveCSS("fill", "rgb(255, 255, 255)");
    }
    await expect(page.locator(".steps-rise").first()).toHaveCSS("animation-name", "none");
    await expect(page.locator(".story-ledger .iso-evidence")).toHaveAttribute("data-phase", "done");
    await expect(page.locator(".unpaid-flow")).toHaveAttribute("data-phase", "done");
  });

  test("If a buyer doesn't pay: three steps, a fork, two branches, no rani", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/how-it-works");
    const flow = page.locator(".unpaid-flow");
    // It starts undrawn below the fold and plays once in view.
    await expect(flow).toHaveAttribute("data-phase", "armed");
    await flow.scrollIntoViewIfNeeded();
    await expect(flow).toHaveAttribute("data-phase", "playing");
    await expect(flow.locator("ol > li")).toHaveCount(6);
    await expect(flow.getByText("No dispute", { exact: true })).toBeVisible();
    await expect(flow.getByText("A dispute", { exact: true })).toBeVisible();
    await expect(flow.getByText("Kubar holds none of the risk", { exact: true })).toBeVisible();
    // Rule 11.4: numbers and branch labels in the secondary colour, not rani.
    for (const text of ["01", "06", "No dispute", "A dispute"]) {
      const color = await flow.getByText(text, { exact: true }).evaluate((el) => getComputedStyle(el).color);
      expect(color, text).not.toBe("rgb(173, 36, 104)");
    }
    // Desktop: 01 to 03 in a row, 04 and 05 on the next row with 06 at the right edge, under the fork.
    const at = async (no: string) => (await flow.locator("li", { hasText: new RegExp(`^${no}`) }).locator("div").first().boundingBox())!;
    const [s1, s3, s4, s5, s6] = await Promise.all(["01", "03", "04", "05", "06"].map(at));
    expect(Math.round(s3.y)).toBe(Math.round(s1.y));
    expect(s4.y).toBeGreaterThan(s1.y + s1.height + 100);
    expect(Math.round(s5.y)).toBe(Math.round(s4.y));
    expect(Math.round(s6.y)).toBe(Math.round(s4.y));
    expect(Math.round(s6.x + s6.width)).toBe(1360);
    await expect(flow.locator(".fork-bar")).toBeVisible();
    // Phone: one column, in reading order, the fork's lines gone.
    await page.setViewportSize({ width: 390, height: 844 });
    const order = await Promise.all(["01", "02", "03", "04", "05", "06"].map(at));
    for (let i = 1; i < order.length; i++) expect(order[i].y).toBeGreaterThan(order[i - 1].y + order[i - 1].height);
    await expect(flow.locator(".fork-bar")).toBeHidden();
  });

  test("Each party signs: a map from 1200 up, the register below it, the table always there for screen readers", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/how-it-works");
    const map = page.locator(".signs-map");
    await expect(map).toBeVisible();
    await expect(map.locator("> div")).toHaveAttribute("aria-hidden", "true");
    await expect(map.locator("[data-party]")).toHaveCount(7);
    await expect(map.locator("[tabindex]")).toHaveCount(0);
    for (const text of ["The policy", "The mandate", "Purchase agreement", "Agreement with Kubar", "Services agreement", "Programme terms", "Its no-objection", "Its acknowledgement", "A line is an agreement between the two parties it joins.", "A tag is a paper one party signs on its own."]) {
      await expect(map.getByText(text, { exact: true }), text).toBeVisible();
    }
    // 304 × 204 cards, 184 between columns, 100 between rows; Kubar under the Financier, in petrol.
    const card = async (party: string) => (await map.locator(`[data-party="${party}"]`).boundingBox())!;
    const [insurer, financier, kubar, exporter, bank] = await Promise.all(["insurer", "financier", "kubar", "exporter", "bank"].map(card));
    expect([Math.round(insurer.width), Math.round(insurer.height)]).toEqual([304, 204]);
    expect(Math.round(financier.x - insurer.x - insurer.width)).toBe(184);
    expect(Math.round(kubar.y - financier.y - financier.height)).toBe(100);
    expect(Math.round(kubar.x)).toBe(Math.round(financier.x));
    expect(Math.round(bank.x)).toBe(Math.round(kubar.x));
    expect(exporter.x).toBeGreaterThan(kubar.x + kubar.width);
    await expect(map.locator('[data-party="kubar"]')).toHaveCSS("background-color", "rgb(2, 39, 50)");
    // The table is still in the page, read but not shown.
    const table = page.getByRole("table").filter({ has: page.getByRole("columnheader", { name: "Signs" }) });
    await expect(table.getByRole("row")).toHaveCount(8);
    expect((await table.boundingBox())!.width).toBeLessThanOrEqual(1);
    // A card keeps its own lines and labels and dims the others.
    await map.locator('[data-party="insurer"]').hover();
    await expect(map).toHaveAttribute("data-picked", "insurer");
    await expect(map.getByText("The policy", { exact: true })).toHaveCSS("opacity", "1");
    await expect(map.getByText("Services agreement", { exact: true })).toHaveCSS("opacity", "0.3");
    await page.mouse.move(5, 5);
    await expect(map.getByText("Services agreement", { exact: true })).toHaveCSS("opacity", "1");
    // 1200: the same composition, narrower.
    await page.setViewportSize({ width: 1200, height: 900 });
    const [f2, k2, e2] = await Promise.all(["financier", "kubar", "exporter"].map(card));
    expect(Math.round(k2.x)).toBe(Math.round(f2.x));
    expect(Math.round(e2.x + e2.width)).toBe(1120);
    // Below 1200: the stacked register, no map.
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(map).toBeHidden();
    await expect(table).toBeVisible();
  });

  test("a tap on a card of the signs map picks it", async ({ browser }) => {
    const tablet = await browser.newContext({ viewport: { width: 1376, height: 1032 }, hasTouch: true });
    const page = await tablet.newPage();
    await page.goto("/how-it-works");
    const map = page.locator(".signs-map");
    await map.locator('[data-party="exporter"]').scrollIntoViewIfNeeded();
    await map.locator('[data-party="exporter"]').tap();
    await expect(map).toHaveAttribute("data-picked", "exporter");
    await expect(map.getByText("The policy", { exact: true })).toHaveCSS("opacity", "0.3");
    await expect(map.getByText("Purchase agreement", { exact: true })).toHaveCSS("opacity", "1");
    await tablet.close();
  });

  test("laptops keep the 1440 composition from 1200 up, and nothing scrolls sideways", async ({ page }) => {
    for (const width of [1200, 1280, 1366, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/how-it-works");
      // The hero: the steps beside the words.
      const words = await box(page, "main h1");
      const steps = await box(page, "svg.iso-steps");
      expect(steps.x, `${width}: steps beside the words`).toBeGreaterThan(words.x + words.width);
      expect(steps.x + steps.width, `${width}: steps inside the page`).toBeLessThanOrEqual(width);
      // The story: the stack beside the cards, its rows beside it, inside the page.
      const card = await box(page, ".story-on .story-card");
      const stack = await box(page, ".story-on .iso-evidence svg:visible");
      const row = await box(page, '.story-on .iso-evidence li[data-doc="01"]');
      expect(stack.x, `${width}: stack beside the cards`).toBeGreaterThan(card.x + card.width);
      expect(row.x, `${width}: rows beside the stack`).toBeGreaterThan(stack.x + stack.width - 30);
      expect(row.x + row.width, `${width}: rows inside the page`).toBeLessThanOrEqual(width);
      // The fork: steps 01 to 03 in one row.
      const first = await box(page, ".unpaid-flow ol > li:nth-child(1) > div");
      const third = await box(page, ".unpaid-flow ol > li:nth-child(3) > div");
      expect(Math.round(third.y), `${width}: one row`).toBe(Math.round(first.y));
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${width}`).toBe(0);
    }
  });

  test("tablets and phones keep the drawings as the 768 and 390 frames draw them", async ({ page }) => {
    for (const [width, beside] of [[768, true], [390, false], [375, false]] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/how-it-works");
      const words = await box(page, "main section:first-of-type .flex.flex-col a");
      const steps = await box(page, "svg.iso-steps");
      expect(steps.y, `${width}: steps under the routes`).toBeGreaterThan(words.y);
      // The stack stays pinned with its rows beside it; the complete stack waits with the ledger.
      const stack = await box(page, ".story-on .iso-evidence svg:visible");
      const row = await box(page, '.story-on .iso-evidence li[data-doc="01"]');
      expect(row.x, `${width}: rows beside`).toBeGreaterThan(stack.x + stack.width - (beside ? 30 : 0));
      // References stay whole.
      await expect(page.locator(".story-ledger .iso-evidence .whitespace-nowrap").first()).toHaveText("RCV-0001");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${width}`).toBe(0);
    }
  });
});

test.describe("rule 11.4: rani only for footnote markers, the current state, errors and the one element a drawing is about", () => {
  const RANI = "rgb(173, 36, 104)";
  test("the loop's step numbers, Kubar holds none and Home's Planned are in the secondary colour", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const colour = (locator: import("@playwright/test").Locator) => locator.first().evaluate((el) => getComputedStyle(el).color);
    await page.goto("/products/kubar-protocol");
    for (const no of ["01", "03", "05"]) expect(await colour(page.locator(`.loop-card[data-step="${no}"] .t-code`)), `loop ${no}`).not.toBe(RANI);
    for (const el of await page.getByText("Kubar holds none", { exact: true }).all()) expect(await el.evaluate((x) => getComputedStyle(x).color)).not.toBe(RANI);
    for (const path of ["/", "/how-it-works"]) {
      await page.goto(path);
      const notes = await page.getByText("Kubar holds none", { exact: true }).all();
      expect(notes.length, path).toBeGreaterThan(0);
      for (const el of notes) expect(await el.evaluate((x) => getComputedStyle(x).color), path).not.toBe(RANI);
    }
    await page.goto("/");
    const planned = page.locator(".iso-foundations").getByText("Planned").locator("visible=true").first();
    expect(await colour(planned)).not.toBe(RANI);
    // The footnote marker beside it keeps rani.
    expect(await colour(page.locator(".iso-foundations .footnote-marker:visible"))).toBe(RANI);
  });

  test("standalone links that had no tap area take one: Skip the story on Home, LinkedIn on the team cards, a lone address on Contact", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Skip the story" })).toHaveClass(/tap-area/);
    await page.goto("/about");
    await expect(page.getByRole("link", { name: "Rayansh Srivastava on LinkedIn (opens in a new tab)" })).toHaveClass(/tap-area/);
    await page.goto("/contact");
    await expect(page.getByRole("link", { name: "partnerships@kubar.tech", exact: true }).last()).toHaveClass(/tap-area/);
    await expect(page.getByRole("link", { name: "keshav@kubar.tech" })).not.toHaveClass(/tap-area/);
  });

  test("NavDhan SDK's lanes drawing is fitted to its column on laptops", async ({ page }) => {
    for (const width of [1200, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/products/navdhan-sdk");
      const stage = page.locator(".fit-stage").filter({ hasText: "The financier" });
      await expect.poll(async () => { const lane = (await stage.getByText("The financier", { exact: true }).boundingBox())!; return Math.round(lane.x + lane.width) <= width - 80; }, { message: `${width}: the last lane inside the content column` }).toBe(true);
    }
  });
});

test("the content security policy allows Cloudflare Web Analytics and nothing else from outside", async ({ request }) => {
  const policy = (await request.get("/")).headers()["content-security-policy"];
  const directive = (name: string) => policy.split("; ").find((part) => part.startsWith(`${name} `))!;
  expect(directive("script-src")).toBe("script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com");
  expect(directive("connect-src")).toBe("connect-src 'self' https://cloudflareinsights.com");
  expect(policy.match(/https?:\/\/[^\s;]+/g)).toEqual(["https://static.cloudflareinsights.com", "https://cloudflareinsights.com"]);
});

test("legal pages carry their date and the retention period, with no placeholder left (15 Nov)", async ({ page }) => {
  for (const path of ["/legal/privacy", "/legal/terms"]) {
    await page.goto(path);
    const main = page.getByRole("main");
    await expect(main.getByText("Last updated: 15 November 2026", { exact: true })).toBeVisible();
    expect(await main.innerText(), path).not.toMatch(/\[[^\]]*\]/);
  }
  await page.goto("/legal/privacy");
  await expect(page.getByRole("main")).toContainText("We keep enquiries for 24 months after our last exchange");
  await page.goto("/legal/terms");
  await expect(page.getByRole("main").getByRole("heading", { name: "4. Plans and examples", exact: true })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: /Plans and examples$/ })).toBeVisible();
  await expect(page.getByRole("main")).not.toContainText("status");
});

test("Home's map: a tap on the card with no link dims the arrows that don't touch it", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  await page.goto("/");
  const map = page.locator(".party-map");
  await map.locator('[data-party="buyers"]').scrollIntoViewIfNeeded();
  await map.locator('[data-party="buyers"]').tap();
  await expect(map).toHaveAttribute("data-picked", "buyers");
  await expect(map.locator('svg:visible .draw-arrow[data-touches="platforms kubar"]')).toHaveCSS("opacity", "0.3");
  await expect(map.locator('svg:visible .draw-arrow[data-touches="buyers financiers"]')).toHaveCSS("opacity", "1");
  await context.close();
});

test.describe("On this page index (section 12, item 5)", () => {
  for (const [path, first, count] of [["/products/kubar-protocol", "What you buy", 11], ["/how-it-works", "What happens to a receivable", 5]] as const) {
    test(`${path}: a row under the hero, then a button and a sheet once it has scrolled away`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      const header = () => page.evaluate(() => document.querySelector("header")!.getBoundingClientRect().height);
      const before = await header();
      const row = page.getByRole("navigation", { name: "On this page" });
      await expect(row.getByRole("link")).toHaveCount(count);
      await expect(row.getByRole("link").first()).toHaveText(first);
      const button = page.getByRole("button", { name: "On this page" });
      await expect(button).toHaveCount(0);
      // Every link has a target on the page.
      for (const href of await row.getByRole("link").evaluateAll((els) => els.map((el) => el.getAttribute("href")!))) {
        await expect(page.locator(href)).toHaveCount(1);
      }
      // Past the row: the button; it opens the list with the current section marked.
      const target = await row.getByRole("link").nth(2).getAttribute("href");
      await page.locator(target!).scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy(0, 300));
      await expect(button).toBeVisible();
      expect(await header()).toBe(before);
      // The button steps aside over anything pressable, so move on until it is clear.
      const clear = () => button.evaluate((el) => getComputedStyle(el.parentElement!).opacity === "1" && getComputedStyle(el.parentElement!).pointerEvents !== "none");
      for (let i = 0; i < 40 && !(await clear()); i++) {
        await page.evaluate(() => window.scrollBy(0, 120));
        await page.waitForTimeout(150);
      }
      expect(await clear()).toBe(true);
      await button.click();
      const sheet = page.getByRole("dialog", { name: "On this page" });
      await expect(sheet.getByRole("link")).toHaveCount(count);
      await expect(sheet.locator('[aria-current="location"]')).toHaveCount(1);
      await page.keyboard.press("Escape");
      await expect(sheet).toBeHidden();
      await expect(button).toBeFocused();
      // A pick closes it and goes there.
      await button.focus();
      await page.keyboard.press("Enter");
      await sheet.getByRole("link").last().click();
      await expect(sheet).toBeHidden();
      await expect(page).toHaveURL(/#[a-z0-9-]+-heading$/);
      await expectNoAxeViolations(page);
      // A phone: the button stays inside the screen.
      await page.setViewportSize({ width: 390, height: 844 });
      const box = (await button.boundingBox())!;
      expect(box.x + box.width).toBeLessThanOrEqual(390);
      // It never sits over something a reader would press: with a link, a button, a field or the
      // footer under it, it steps aside (hidden and out of reach); otherwise it shows. Checked by
      // comparing rectangles all the way down the page.
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      let shownSomewhere = 0;
      for (let top = 1200; top < total; top += 500) {
        await page.evaluate((y) => window.scrollTo(0, y), top);
        await page.waitForTimeout(200);
        const state = await button.evaluate((el) => {
          const float = el.parentElement!;
          const r = el.getBoundingClientRect();
          const under = [...document.querySelectorAll("a, button, input, select, textarea, summary, label, [tabindex]:not(main), [role='button'], footer")].some((other) => {
            if (float.contains(other)) return false;
            const o = other.getBoundingClientRect();
            return o.width > 0 && o.height > 0 && o.left < r.right && o.right > r.left && o.top < r.bottom && o.bottom > r.top;
          });
          return { under, shown: getComputedStyle(float).opacity === "1" && getComputedStyle(float).pointerEvents !== "none" };
        });
        expect(state.shown, `at ${top}: shown only when nothing pressable is under it`).toBe(!state.under);
        if (state.shown) shownSomewhere++;
      }
      expect(shownSomewhere).toBeGreaterThan(3);
      await page.evaluate(() => window.scrollTo(0, 100000));
      await page.waitForTimeout(250);
      await expect(page.locator("footer")).toBeInViewport();
      expect(await button.evaluate((el) => getComputedStyle(el.parentElement!).pointerEvents)).toBe("none");
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    });
  }
});

test.describe("About (build step 4)", () => {
  test("carries its metadata, the team anchor, one status footnote and no removed section", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveTitle("About · Kubar Labs");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Foundations first.");
    await expect(page.locator("#team")).toHaveCount(1);
    await expect(page.locator("#team ul").first().locator("li")).toHaveCount(6);
    await expect(page.getByRole("link", { name: "Rayansh Srivastava on LinkedIn (opens in a new tab)" })).toHaveAttribute("target", "_blank");
    await expect(page.locator("#fn-1")).toHaveCount(1);
    // Footnote 1 shows once; the marker in Why GIFT City links to it.
    await expect(page.locator("#fn-1-gift")).toHaveCount(0);
    await expect(page.locator("#fnref-1-gift")).toHaveAttribute("href", "#fn-1");
    await expect(page.getByText("Planned", { exact: true })).toHaveCount(1);
    await expect(page.getByText("Where we are")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Email us (partnerships@kubar.tech)" })).toHaveAttribute("href", "mailto:partnerships@kubar.tech");
    await expect(page.getByRole("link", { name: "Follow one receivable through all five" })).toHaveAttribute("href", "/how-it-works");
  });

  test("build step 7: the foundations are drawn, the cuts are in, and Why GIFT City has its three zones", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");
    await expect(page.getByText("Five foundations, built from the bottom up")).toHaveCount(0);
    await expect(page.getByText(/^Kubar acts as the financier’s origination and servicing agent\. It never holds/)).toHaveCount(0);
    // The company register's heads are read, not shown.
    for (const gone of ["Field", "Entry"]) {
      await expect(page.getByRole("columnheader", { name: gone, exact: true }).locator("xpath=ancestor::thead"), gone).toHaveClass(/sr-only/);
    }
    const blocks = page.locator(".iso-foundations");
    await expect(blocks.locator("svg").first()).toHaveAttribute("aria-hidden", "true");
    await expect(blocks.locator("ol > li")).toHaveCount(5);
    await expect(blocks.locator("ol > li").first()).toContainText("The venue");
    await expect(blocks.locator("ol > li").first()).toContainText("Planned");
    // Standing as on Home: the statements beside the heading.
    const heading = (await page.locator("#standing-heading").boundingBox())!;
    const statement = (await page.getByText(/^Priority entry to the IFSCA FinTech Innovation Sandbox/).boundingBox())!;
    expect(statement.x).toBeGreaterThan(heading.x + heading.width);
    // Why GIFT City: the drawing beside the words, three zones and three arrows as real text.
    const gift = page.locator("section", { has: page.locator("#gift-heading") });
    const art = gift.locator("svg[aria-hidden='true']").first();
    const words = (await gift.getByText(/^GIFT City is India’s international financial services centre/).boundingBox())!;
    expect((await art.boundingBox())!.x).toBeGreaterThan(words.x + words.width);
    for (const text of ["Onshore India", "The exporter and its own bank", "GIFT City", "A bank’s unit buys the receivable, in foreign currency", "Abroad", "The buyer pays the financier’s account", "The receivable", "Purchase price", "Payment on the due date"]) {
      await expect(gift.getByText(text, { exact: true }).locator("visible=true"), text).toHaveCount(1);
    }
    for (const width of [1200, 1280, 1366, 768, 390, 375]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${width}`).toBe(0);
      await expect(gift.getByText("Payment on the due date", { exact: true }).locator("visible=true"), `${width}`).toHaveCount(1);
    }
    // Phones: the zones stack down the page, each platform with its words beside it; the arrows
    // run between the rows with their labels, in the order receivable, purchase price, payment.
    const rows = gift.locator("ol > li");
    await expect(rows).toHaveCount(3);
    const y = async (text: string) => (await gift.getByText(text, { exact: true }).locator("visible=true").boundingBox())!.y;
    const order = await Promise.all(["Onshore India", "The receivable", "Purchase price", "GIFT City", "Payment on the due date", "Abroad"].map(y));
    expect([...order].sort((p, q) => p - q)).toEqual(order);
    const platformBox = (await rows.first().locator("svg").first().boundingBox())!;
    const title = (await gift.getByText("Onshore India", { exact: true }).locator("visible=true").boundingBox())!;
    expect(Math.round(platformBox.width)).toBe(120);
    expect(title.x).toBeGreaterThan(platformBox.x + platformBox.width);
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

  test("build step 7: two-column routes, a route pre-fills and focuses the form, the addresses sit beside it", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/contact");
    const routes = page.getByRole("table").filter({ has: page.getByRole("columnheader", { name: "Next step" }) });
    await expect(routes.getByRole("columnheader")).toHaveText(["If you are", "Next step"]);
    await expect(page.getByText("Goes to")).toHaveCount(0);
    await expect(page.getByText("Direct", { exact: true })).toHaveCount(0);
    // The addresses beside the form.
    const select = page.getByLabel("I’m writing as");
    const direct = page.getByRole("table").filter({ has: page.getByRole("columnheader", { name: "Write to" }) });
    const form = (await select.boundingBox())!;
    const table = (await direct.boundingBox())!;
    expect(table.x).toBeGreaterThan(form.x + form.width);
    expect(Math.abs(table.y - form.y)).toBeLessThan(40);
    await expect(direct.getByRole("row")).toHaveCount(5);
    // Choosing a route pre-fills "I'm writing as" and moves focus to it.
    await expect(select).toHaveValue("");
    await page.getByRole("link", { name: "Talk about an integration" }).click();
    await expect(page).toHaveURL(/intent=platform#form$/);
    await expect(select).toHaveValue("platform");
    await expect(select).toBeFocused();
    await expect(select).toBeInViewport();
    await page.getByRole("link", { name: "Ask about Programme 1" }).click();
    await expect(select).toHaveValue("exporter");
    await expect(select).toBeFocused();
    // The same route again, after the field was changed by hand: filled and focused again.
    await select.selectOption("press");
    await page.getByRole("link", { name: "Ask about Programme 1" }).click();
    await expect(select).toHaveValue("exporter");
    await expect(select).toBeFocused();
    // Arriving from another page with ?intent= pre-fills it and leaves focus alone; choosing
    // the route already in the address still moves focus.
    await page.goto("/contact?intent=institution");
    await expect(select).toHaveValue("institution");
    await expect(select).not.toBeFocused();
    await page.getByRole("link", { name: "Start a programme conversation" }).click();
    await expect(select).toBeFocused();
    // Below 1200 the addresses come under the form; nothing scrolls sideways.
    for (const width of [1200, 1280, 1366]) {
      await page.setViewportSize({ width, height: 900 });
      const f = (await select.boundingBox())!;
      const t = (await direct.boundingBox())!;
      expect(t.x, `${width}`).toBeGreaterThan(f.x + f.width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${width}`).toBe(0);
    }
    for (const width of [768, 390, 375]) {
      await page.setViewportSize({ width, height: 900 });
      const button = (await page.getByRole("button", { name: "Send message" }).boundingBox())!;
      expect((await direct.boundingBox())!.y, `${width}`).toBeGreaterThan(button.y + button.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `${width}`).toBe(0);
    }
    await expectNoAxeViolations(page);
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
