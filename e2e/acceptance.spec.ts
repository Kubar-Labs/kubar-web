import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";

/*
 * Acceptance checks (docs/rebuild/HANDOFF.md, section 13) that hold for every
 * route: what must never appear, reflow, keyboard focus, target sizes, the
 * performance budget, and the rendered words against docs/rebuild/copy.
 */
const routes = [
  "/",
  "/products/kubar-protocol",
  "/products/navdhan-sdk",
  "/how-it-works",
  "/about",
  "/contact",
  "/legal/privacy",
  "/legal/terms",
] as const;

const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe("what the site never shows", () => {
  for (const path of routes) {
    test(`${path} has no status words, dated status, section numbers, italics or chips`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      const text = (await page.locator("body").innerText()).replace(/\s+/g, " ");
      // Status labels from the old copy deck; only the venue keeps "Planned".
      // The terms of use no longer mention status labels either (15 Nov).
      expect(text).not.toMatch(/\b(In build|In preparation|In pilot|In use|Demonstrated|Status labels)\b/);
      expect(text).not.toMatch(/\bas at\b/i);
      expect(text).not.toMatch(/What the labels mean/);
      // Never retail, never named partners' capital or emblems.
      expect(text).not.toMatch(/\b(loan|lender|borrower|repayment|escrow|seamless|tokens?)\b/i);
      // No section numbers or labels above headings (legal pages number their sections by design).
      if (!path.startsWith("/legal")) {
        const headings = await page.locator("main h2, main h3").allInnerTexts();
        for (const heading of headings) expect(heading, heading).not.toMatch(/^\s*\d{1,2}\s*[·.:]/);
      }
      const italic = await page.evaluate(() => [...document.querySelectorAll("body *")].filter((el) => getComputedStyle(el).fontStyle !== "normal").length);
      expect(italic).toBe(0);
      const rounded = await page.evaluate(
        () => [...document.querySelectorAll("main *, header *, footer *")].filter((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius) > 0).length,
      );
      expect(rounded).toBe(0);
      // REDRAW-2026-11-14.md rule 5: no hairline between sections; the header keeps its own rule.
      const ruled = await page.evaluate(() =>
        [...document.querySelectorAll("main > section, main > div > section")].filter((el) => {
          const style = getComputedStyle(el);
          return parseFloat(style.borderBottomWidth) > 0 || parseFloat(style.borderTopWidth) > 0;
        }).length,
      );
      expect(ruled).toBe(0);
      // A shadow only as one of the three elevations (REDRAW-2026-11-14.md, section 2).
      const strayShadows = await page.evaluate(() => {
        const probe = document.createElement("div");
        document.body.appendChild(probe);
        const allowed = ["--elevation-1", "--elevation-2", "--elevation-3"].map((name) => {
          probe.style.boxShadow = `var(${name})`;
          return getComputedStyle(probe).boxShadow;
        });
        probe.remove();
        // Tailwind's shadow utilities compose the elevation after four empty
        // ring and inset layers ("rgba(0, 0, 0, 0) 0px 0px 0px 0px"); those draw nothing.
        const visible = (shadow: string) => shadow.replace(/rgba\(0, 0, 0, 0\) 0px 0px 0px 0px(, )?/g, "") || "none";
        return [...document.querySelectorAll("main *, header *, footer *")]
          .map((el) => visible(getComputedStyle(el).boxShadow))
          .filter((shadow) => shadow !== "none" && !allowed.includes(shadow));
      });
      expect(strayShadows).toEqual([]);
      // No kicker line above a page's headline (REDRAW-2026-11-14.md, section 3).
      const beforeH1 = await page.evaluate(() => document.querySelector("main h1")?.previousElementSibling?.textContent ?? "");
      expect(beforeH1).toBe("");
    });
  }

  test("only the venue is Planned, and footnote 1 travels with it", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const path of ["/", "/products/kubar-protocol", "/how-it-works", "/about"]) {
      await page.goto(path);
      const planned = page.getByRole("main").getByText("Planned", { exact: true });
      expect(await planned.count(), path).toBeGreaterThan(0);
      await expect(page.locator('[id^="fn-1"]').first()).toContainText("Kubar’s own ITFS registration is targeted for 2027");
    }
    for (const path of ["/products/navdhan-sdk", "/contact"]) {
      await page.goto(path);
      await expect(page.getByRole("main").getByText("Planned", { exact: true })).toHaveCount(0);
    }
  });
});

test.describe("reflow", () => {
  for (const path of routes) {
    test(`${path} reflows at 320 px and at 200% zoom with no sideways scroll`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      // 320 CSS px wide (WCAG 1.4.10), then 1440 at 200% zoom, which lays out as 720.
      for (const width of [320, 720]) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        expect(await overflow(page), `${path} at ${width}`).toBe(0);
        const clipped = await page.evaluate(() =>
          [...document.querySelectorAll("main p, main h1, main h2, main h3, main td, main th, main li")].filter((el) => {
            const box = el.getBoundingClientRect();
            return box.width > 0 && (box.right > window.innerWidth + 1 || box.left < -1) && !el.closest("[class*='overflow-x-auto'], [class*='-left-'], [class*='sr-only']");
          }).length,
        );
        expect(clipped, `${path} at ${width}: text outside the viewport`).toBe(0);
      }
    });
  }
});

test.describe("keyboard", () => {
  for (const path of routes) {
    test(`${path}: every stop is visible, ringed and big enough`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      await page.waitForTimeout(500); // abbreviations are marked after hydration
      const expected = await page.evaluate(
        () =>
          [...document.querySelectorAll<HTMLElement>("a[href], button, input, select, textarea, summary, [tabindex='0']")].filter(
            (el) =>
              el.getClientRects().length > 0 &&
              el.tabIndex >= 0 &&
              getComputedStyle(el).visibility !== "hidden" &&
              !el.closest("[aria-hidden='true']") &&
              // The content of a closed disclosure isn't rendered, so it isn't a stop.
              !el.closest("details:not([open]) > :not(summary)"),
          ).length,
      );
      const seen = new Set<string>();
      for (let i = 0; i < expected + 5; i++) {
        await page.keyboard.press("Tab");
        const stop = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const style = getComputedStyle(el);
          const box = el.getBoundingClientRect();
          el.dataset.qaStop ??= String(document.querySelectorAll("[data-qa-stop]").length + 1);
          return {
            id: el.dataset.qaStop,
            name: (el.getAttribute("aria-label") || el.textContent || el.getAttribute("name") || el.tagName).trim().slice(0, 40),
            outline: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2,
            height: box.height,
            width: box.width,
            inView: box.bottom > 0 && box.top < window.innerHeight,
          };
        });
        if (!stop) continue;
        if (seen.has(stop.id)) break; // wrapped round
        seen.add(stop.id);
        expect(stop.outline, `${path}: no focus ring on "${stop.name}"`).toBe(true);
        expect(stop.inView, `${path}: "${stop.name}" is focused off screen`).toBe(true);
        expect(stop.height, `${path}: "${stop.name}" is ${stop.height} px tall`).toBeGreaterThanOrEqual(24);
        expect(stop.width, `${path}: "${stop.name}" is ${stop.width} px wide`).toBeGreaterThanOrEqual(24);
      }
      expect(seen.size, `${path}: stops reached by Tab`).toBe(expected);
    });
  }

  test("Escape closes everything that opens", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const products = page.getByRole("button", { name: "Products" });
    await products.click();
    await expect(products).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(products).toHaveAttribute("aria-expanded", "false");
    await page.setViewportSize({ width: 390, height: 800 });
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});

test.describe("performance budget (HANDOFF section 11)", () => {
  for (const path of ["/", "/products/kubar-protocol", "/how-it-works"]) {
    test(`${path}: fonts, script weight, first-party requests only, no cookies, stable layout`, async ({ page, context }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const client = await context.newCDPSession(page);
      await client.send("Network.enable");
      // Each width loads from the network, not from the first load's cache.
      await client.send("Network.setCacheDisabled", { cacheDisabled: true });
      const seen = new Map<string, { url: string; type: string; prefetch: boolean; bytes: number }>();
      client.on("Network.requestWillBeSent", (event) =>
        seen.set(event.requestId, {
          url: event.request.url,
          type: event.type ?? "",
          // Next's router prefetch of linked routes sends this header (RSC payloads).
          prefetch: Object.keys(event.request.headers).some((k) => /^(next-router-prefetch|purpose|sec-purpose)$/i.test(k)),
          bytes: 0,
        }),
      );
      client.on("Network.responseReceived", (event) => {
        const r = seen.get(event.requestId);
        if (r) r.type = event.type;
      });
      client.on("Network.loadingFinished", (event) => {
        const r = seen.get(event.requestId);
        if (r) r.bytes = event.encodedDataLength;
      });
      // The page's own script, without prefetches: the scripts its own HTML names. Next also
      // fetches the routes linked from what's on screen, their page chunks and the shared chunks
      // those pull in, which this page doesn't run; none of those are in its HTML. (Telling them
      // apart by URL or header missed the shared chunks, which carry no prefetch header and aren't
      // under /app/.) Bytes on the wire, headers included. Measured at 390 and at 1440, where
      // different links are on screen.
      const html = await (await page.request.get(path)).text();
      const inHtml = (url: string) => html.includes(new URL(url).pathname);
      const ownScripts = () =>
        [...seen.values()].filter((r) => r.type === "Script" && !r.prefetch && inHtml(r.url)).reduce((sum, r) => sum + r.bytes, 0);
      const prefetched = () =>
        [...seen.values()].filter((r) => r.prefetch || (r.type === "Script" && !inHtml(r.url))).reduce((sum, r) => sum + r.bytes, 0);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path, { waitUntil: "networkidle" });
      const wide = ownScripts();
      console.log(`${path} at 1440: own scripts ${(wide / 1024).toFixed(1)} KB; prefetched ${(prefetched() / 1024).toFixed(1)} KB`);
      expect(wide).toBeLessThanOrEqual(170 * 1024);
      seen.clear();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(path, { waitUntil: "networkidle" });

      const requests = [...seen.values()];
      const origin = new URL(page.url()).origin;
      expect(requests.filter((r) => !r.url.startsWith(origin) && !r.url.startsWith("data:")).map((r) => r.url)).toEqual([]);

      const scripts = ownScripts();
      const fonts = requests.filter((r) => r.type === "Font");
      test.info().annotations.push({ type: "weights", description: `${path}: scripts ${(scripts / 1024).toFixed(1)} KB compressed, fonts ${(fonts.reduce((s, r) => s + r.bytes, 0) / 1024).toFixed(1)} KB` });
      console.log(`${path} at 390: own scripts ${(scripts / 1024).toFixed(1)} KB; prefetched ${(prefetched() / 1024).toFixed(1)} KB; fonts ${fonts.length} files, ${(fonts.reduce((s, r) => s + r.bytes, 0) / 1024).toFixed(1)} KB`);
      expect(scripts).toBeLessThanOrEqual(170 * 1024);
      expect(fonts.reduce((sum, r) => sum + r.bytes, 0)).toBeLessThanOrEqual(300 * 1024);
      await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(2);

      expect(await context.cookies()).toEqual([]);

      const images = await page.evaluate(() => [...document.images].filter((img) => !img.getAttribute("width") || !img.getAttribute("height")).length);
      expect(images).toBe(0);

      const cls = await page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            let total = 0;
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
                if (!entry.hadRecentInput) total += entry.value;
              }
            }).observe({ type: "layout-shift", buffered: true });
            setTimeout(() => resolve(total), 1000);
          }),
      );
      console.log(`${path}: CLS ${cls.toFixed(4)}`);
      expect(cls).toBeLessThanOrEqual(0.05);
    });
  }
});

test.describe("rendered words match docs/rebuild/copy", () => {
  const copyDir = join(__dirname, "..", "docs", "rebuild", "copy");
  const norm = (value: string) => value.replace(/[¹²³]/g, "").replace(/\s+/g, " ").trim();

  /** Every tagged fragment of a copy file: what a reader should find on the page. */
  function fragments(file: string) {
    return readFileSync(join(copyDir, file), "utf8")
      .split("\n")
      .filter((line) => /^\[[A-Za-z]+\] /.test(line))
      .flatMap((line) => line.split(/\s+(?=\[[A-Za-z]+\] )|\s+\|\s+/))
      .map((part) => part.replace(/^\[[A-Za-z]+\] /, "").replace(/\s+[→←].*$/, "").replace(/\s{2,}\(.*$/, "").replace(/\s+\(.*\)$/, (m) => (/\((rani|select|hint|muted|anchor|filled|legend|external|a label|live|kept|arrow|the address)/.test(m) ? "" : m)).trim())
      .filter((part) => part.length > 3);
  }

  const pages: [string, string, RegExp][] = [
    ["/", "01-home.md", /^(Kubar is in the data path|State 08 · Planned|05 of 08|01 … 08|Purchased|Back to text)/],
    ["/products/kubar-protocol", "02-kubar-protocol.md", /^(Back to text)/],
    // Nothing to skip: the copy has no Illustrative tag since 15 Nov.
    ["/products/navdhan-sdk", "03-navdhan-sdk.md", /^$/],
    ["/how-it-works", "04-how-it-works.md", /^(06 of 08|Settled|Skip the story|Payment reference; closure|The buyer pays \$225,000|Doc \d\d|Purchased|Kubar · Buyer, UAE|Commercial invoice · Shipping bill|Record RCV-0001$|Data path · Kubar|Kubar holds none$|State$|Documents$)/],
    ["/about", "05-about.md", /^(Technology programmes, grants and credits, then|Planned|Email us \()/],
    ["/contact", "06-contact.md", /^(\d+ of 2,000|Sending|Privacy notice)/],
    ["/legal/privacy", "07-system-and-legal.md", /./],
    ["/legal/terms", "07-system-and-legal.md", /./],
  ];

  for (const [path, file, skip] of pages) {
    test(`${path} shows the lines of ${file}`, async ({ page }) => {
      // Full motion at desktop, so the pinned stories and their lanes are on the page too.
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path === "/contact" ? "/contact?intent=institution" : path);
      await page.waitForTimeout(400);
      // textContent, so words kept for screen readers or for other widths count too;
      // abbreviation tooltips are taken out first.
      const rendered = norm(
        await page.evaluate(() => {
          const clone = document.body.cloneNode(true) as HTMLElement;
          clone.querySelectorAll("[role='tooltip'], .footnote-marker, script, style").forEach((el) => el.remove());
          clone.querySelectorAll("td, th, p, li, h1, h2, h3, h4, dt, dd, option, label, button, div").forEach((el) => el.append(" "));
          return clone.textContent ?? "";
        }),
      );
      const missing: string[] = [];
      if (path.startsWith("/legal")) {
        const text = readFileSync(join(copyDir, file), "utf8");
        const start = text.indexOf(path === "/legal/privacy" ? "## Privacy notice" : "## Terms of use");
        const end = text.indexOf("\n## ", start + 3);
        const lines = text
          .slice(start, end === -1 ? undefined : end)
          .split("\n")
          .slice(2)
          .map((line) => line.replace(/^\[[A-Za-z0-9]+\] /, "").replace(/\s+←.*$/, "").replace(/\s{2,}\(.*\)$/, "").replace(/^– /, "").trim())
          .filter((line) => line && !line.startsWith("←") && !line.startsWith("Layout:") && !line.startsWith("Same layout") && !/^1\. .+ · 2\. /.test(line));
        for (const line of lines) if (!rendered.includes(norm(line))) missing.push(line);
      } else {
        for (const fragment of fragments(file)) {
          if (skip.test(fragment)) continue;
          const parts = fragment.includes(" · ") && fragment.split(" · ").length > 2 ? fragment.split(" · ") : [fragment];
          for (const part of parts) if (!rendered.includes(norm(part))) missing.push(part);
        }
      }
      expect(missing, `${path}: lines of the copy file not found on the page`).toEqual([]);
    });
  }
});
