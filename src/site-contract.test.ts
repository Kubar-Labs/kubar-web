import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";
import messages from "../messages/en.json";
import sitemap, { sitemapRoutes } from "./app/sitemap";

const root = join(__dirname, "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("routes and redirects (HANDOFF section 5)", () => {
  it("permanently redirects the four old routes", async () => {
    const redirects = await nextConfig.redirects!();
    const expected = [
      ["/products/navdhan", "/products/navdhan-sdk"],
      ["/for-platforms", "/products/navdhan-sdk"],
      ["/team", "/about#team"],
      ["/privacy", "/legal/privacy"],
    ];
    for (const [source, destination] of expected) {
      expect(redirects).toContainEqual(expect.objectContaining({ source, destination, permanent: true }));
    }
  });

  it("keeps the www to apex redirect", async () => {
    const redirects = await nextConfig.redirects!();
    expect(redirects).toContainEqual(
      expect.objectContaining({
        source: "/:path+",
        has: [{ type: "host", value: "www.kubar.tech" }],
        destination: "https://kubar.tech/:path+",
      }),
    );
  });

  it("lists exactly the eight public routes in the sitemap", () => {
    expect(sitemapRoutes).toHaveLength(8);
    expect(sitemap().map((entry) => entry.url)).toEqual([
      "https://kubar.tech",
      "https://kubar.tech/products/kubar-protocol",
      "https://kubar.tech/products/navdhan-sdk",
      "https://kubar.tech/how-it-works",
      "https://kubar.tech/about",
      "https://kubar.tech/contact",
      "https://kubar.tech/legal/privacy",
      "https://kubar.tech/legal/terms",
    ]);
  });
});

describe("copy matches docs/rebuild/copy word for word", () => {
  const allMessages = JSON.stringify(messages);

  /** Every tagged line of a copy file, without its tag and trailing notes. */
  function copyLines(file: string) {
    return read(`docs/rebuild/copy/${file}`)
      .split("\n")
      .filter((line) => /^\[[A-Za-z]+\] /.test(line))
      .map((line) => line.replace(/^\[[A-Za-z]+\] /, "").replace(/\s+[→←].*$/, "").replace(/\s{2,}\(.*$/, "").trim());
  }

  it("carries every header and footer line (00-header-footer.md)", () => {
    for (const line of copyLines("00-header-footer.md")) {
      const expected = line.replace(/© \d{4}/, "© {year}");
      expect(allMessages, `missing: ${line}`).toContain(JSON.stringify(expected).slice(1, -1));
    }
  });

  it("carries the 404 and error lines (07-system-and-legal.md)", () => {
    const lines = copyLines("07-system-and-legal.md").slice(0, 9);
    for (const line of lines) {
      if (line.startsWith("Please try again")) {
        expect(messages.system.error.line.replace(/<\/?email>/g, "")).toBe(line);
      } else {
        expect(allMessages, `missing: ${line}`).toContain(line);
      }
    }
  });

  it("keeps the footer copyright year current", () => {
    expect(messages.footer.copyright).toBe("© {year} Kubar Protocol Private Limited");
  });
});

describe("tokens", () => {
  it("keeps src/app/tokens.css in step with docs/rebuild/tokens/tokens.css (fonts aside)", () => {
    const strip = (css: string) =>
      css
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("--font-"))
        .join("\n");
    expect(strip(read("src/app/tokens.css"))).toBe(strip(read("docs/rebuild/tokens/tokens.css")));
  });

  it("uses 48/52 for the display at tablet (decided 13 Nov 2026)", () => {
    expect(read("src/app/tokens.css")).toContain("--text-display: 48px; --text-display--line-height: 52px;");
  });
});
