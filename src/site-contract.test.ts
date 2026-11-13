import { readdirSync, readFileSync } from "node:fs";
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

  /** Tagged lines under one "## " heading of a copy file, split where a line holds two tags. */
  function sectionLines(file: string, heading: string) {
    const text = read(`docs/rebuild/copy/${file}`);
    const start = text.indexOf(`## ${heading}`);
    const end = text.indexOf("\n## ", start + 3);
    return text
      .slice(start, end === -1 ? undefined : end)
      .split("\n")
      .filter((line) => /^\[[A-Za-z]+\] /.test(line))
      .flatMap((line) => line.split(/\s{2,}(?=\[[A-Za-z]+\] )/))
      .map((part) => part.replace(/^\[[A-Za-z]+\] /, "").replace(/\s+[→←].*$/, "").replace(/\s{2,}\(.*$/, "").trim())
      .filter(Boolean);
  }
  const has = (line: string) => allMessages.includes(JSON.stringify(line).slice(1, -1));

  it("carries the record's words (01-home.md, Hero)", () => {
    const skip = new Set(["Building the institutional exchange¹ for cross-border trade finance.", "¹", "Back to text"]);
    for (const line of sectionLines("01-home.md", "Hero").filter((l) => !skip.has(l))) {
      expect(has(line), `missing: ${line}`).toBe(true);
    }
  });

  it("carries the standing register and programme rows (01-home.md, Standing)", () => {
    const lines = sectionLines("01-home.md", "Standing").slice(4); // after the heading, lead and column heads
    for (const line of lines) expect(has(line), `missing: ${line}`).toBe(true);
  });

  it("carries the technology programmes (01-home.md)", () => {
    for (const line of sectionLines("01-home.md", "Technology programmes")) {
      expect(has(line), `missing: ${line}`).toBe(true);
    }
  });

  it("matches the ledger's eight states to the copy (01-home.md, Only at 768 and 390)", () => {
    const copy = read("docs/rebuild/copy/01-home.md");
    for (const state of messages.ledger.states) {
      expect(copy, `state ${state.no}`).toContain(`${state.no} ${state.state}`);
      expect(copy, `state ${state.no} what`).toContain(state.what);
      if (state.data) expect(copy, `state ${state.no} data`).toContain(state.data);
      if (state.money) expect(copy, `state ${state.no} money`).toContain(state.money);
    }
  });

  it("carries every Home line from the gap to Contact (01-home.md)", () => {
    const skip = new Set(["¹", "²", "³", "Back to text", "01 … 08", "Illustrative", "05", "Purchased"]);
    for (const heading of ["The gap", "One receivable", "Band · closing line", "Foundations first", "Who takes part", "People", "Contact"]) {
      for (let line of sectionLines("01-home.md", heading)) {
        if (skip.has(line) || line === "—") continue;
        line = line.replace(/[¹²³]$/, "").replace("State 08 · Planned¹", "State 08 · Planned");
        if (line === "Party · Financier") line = "Party · {party}";
        if (line === "05 of 08") line = "{n} of 08";
        expect(has(line), `${heading}: missing: ${line}`).toBe(true);
      }
    }
  });

  /** Every tagged fragment of a page's copy file, to check against the messages. */
  function pageFragments(file: string) {
    return read(`docs/rebuild/copy/${file}`)
      .split("\n")
      .filter((line) => /^\[[A-Za-z]+\] /.test(line))
      .flatMap((line) => line.split(/\s{2,}(?=\[[A-Za-z]+\] )|\s+\|\s+/))
      .map((part) =>
        part
          .replace(/^\[[A-Za-z]+\] /, "")
          .replace(/^\d\d\s+\[[A-Za-z]+\] /, "")
          .replace(/\s+[→←].*$/, "")
          .replace(/\s{2,}\(.*$/, "")
          .replace(/^From /, "")
          .trim(),
      )
      .filter((part) => part && !/^[¹²³—]$/.test(part) && !/^\d\d$/.test(part));
  }
  const flat = allMessages.replace(/<marker><\/marker>/g, "¹");

  it("carries every Kubar Protocol line (02-kubar-protocol.md)", () => {
    const skip = new Set(["Back to text", "Illustrative", "Element", "Party", "Institution", "Field"]);
    for (const line of pageFragments("02-kubar-protocol.md")) {
      if (skip.has(line)) continue;
      expect(flat.includes(JSON.stringify(line).slice(1, -1)), `missing: ${line}`).toBe(true);
    }
  });

  it("carries every NavDhan SDK line (03-navdhan-sdk.md)", () => {
    const skip = new Set(["Illustrative", "Capability", "Step"]);
    for (const line of pageFragments("03-navdhan-sdk.md")) {
      if (skip.has(line)) continue;
      expect(flat.includes(JSON.stringify(line).slice(1, -1)), `missing: ${line}`).toBe(true);
    }
    expect(allMessages).not.toMatch(/In build|Where it stands/);
  });

  it("carries every How it works line (04-how-it-works.md)", () => {
    const skip = new Set(["Back to text", "Illustrative", "Term", "Meaning", "Party", "Does", "Signs", "State", "Skip the story", "Settled", "Purchased"]);
    const lanes = /^(Lane heads|Row numbers|Legend|Path labels)/;
    for (const line of pageFragments("04-how-it-works.md")) {
      if (skip.has(line) || lanes.test(line)) continue;
      const parts = line.split(" · ");
      if (parts.length > 2) {
        // A row of separate labels (the record's elements, the money path's parties).
        for (const part of parts) expect(flat.includes(JSON.stringify(part).slice(1, -1)), `missing: ${part}`).toBe(true);
        continue;
      }
      const expected = line.replace(/^(\d\d) of 08$/, "{n} of 08").replace(/^¹ /, "").replace(/^Doc \d\d$/, "Doc {no}");
      expect(flat.includes(JSON.stringify(expected).slice(1, -1)), `missing: ${line}`).toBe(true);
    }
    const copy = read("docs/rebuild/copy/04-how-it-works.md");
    for (const state of messages.howItWorks.rail.states) {
      expect(copy, `state ${state.no}`).toContain(state.what);
      if (state.data) expect(copy, `state ${state.no} data`).toContain(state.data);
      if (state.money) expect(copy, `state ${state.no} money`).toContain(state.money);
    }
    expect(messages.howItWorks.terms.rows).toHaveLength(19);
    expect(JSON.stringify(messages.howItWorks)).not.toMatch(/In build/);
  });

  it("carries every About line (05-about.md)", () => {
    const skip = new Set(["Back to text", "Kind", "Entry", "Field", "Planned", "LinkedIn"]);
    for (const line of pageFragments("05-about.md")) {
      if (skip.has(line) || line.startsWith("Planned (") || line.startsWith("Technology programmes, grants and credits, then")) continue;
      const expected = line.replace(/^¹ /, "").replace(/¹$/, "");
      const parts = expected.split(" · ");
      if (parts.length > 2) {
        for (const part of parts) expect(flat.includes(JSON.stringify(part.replace(/ \(.*\)$/, "")).slice(1, -1)), `missing: ${part}`).toBe(true);
        continue;
      }
      expect(flat.includes(JSON.stringify(expected).slice(1, -1)), `missing: ${line}`).toBe(true);
    }
    expect(JSON.stringify(messages.about)).not.toMatch(/Where we are|In build|In preparation/);
    expect(messages.about.team.people).toHaveLength(6);
    expect(messages.about.team.advisers.rows).toHaveLength(4);
  });

  it("carries the contact form's contract word for word (06-contact.md)", () => {
    const copy = read("docs/rebuild/copy/06-contact.md");
    const form = messages.contact.form;
    for (const text of [...Object.values(form.labels), ...Object.values(form.errors), ...Object.values(form.intents), ...Object.values(form.messageHelp)]) {
      expect(copy, `not in the copy: ${text}`).toContain(text);
    }
    for (const text of [form.emailHelp, form.notice, form.privacy, form.send, form.sending, form.sent.heading, form.sent.link, form.sent.body.replace("{firstName}", "[first name]")]) {
      expect(copy, `not in the copy: ${text}`).toContain(text);
    }
    for (const text of Object.values(form.failed)) expect(copy).toContain(text.replace(/<\/?email>/g, ""));
    expect(Object.keys(form.intents)).toEqual(["institution", "platform", "exporter", "investor", "press", "other"]);
    expect(form.messageHelp).not.toHaveProperty("other");
    for (const row of messages.contact.routes.rows) {
      expect(copy).toContain(`${row.who} | ${row.step} | ${row.goesTo}`);
    }
    for (const row of messages.contact.direct.rows) expect(copy).toContain(row.join(" | "));
    expect(JSON.stringify(messages.contact)).not.toMatch(/24 hours|phone/i);
  });

  it("carries the privacy notice and terms as written (07-system-and-legal.md)", () => {
    const copy = read("docs/rebuild/copy/07-system-and-legal.md");
    for (const page of [messages.legal.privacy, messages.legal.terms]) {
      for (const section of page.sections) {
        expect(copy).toContain(`[H4] ${section.n}. ${section.title}`);
        for (const block of section.blocks) expect(copy, `not in the copy: ${block}`).toContain(block.replace(/<\/?link>/g, ""));
      }
    }
    expect(messages.legal.privacy.sections).toHaveLength(11);
    expect(messages.legal.terms.sections).toHaveLength(13);
  });

  it("keeps every record document with its Proves line (copy deck 4.2)", () => {
    expect(messages.record.documents).toHaveLength(6);
    for (const doc of messages.record.documents) expect(doc.proves.length).toBeGreaterThan(10);
  });

  it("keeps the footer copyright year current", () => {
    expect(messages.footer.copyright).toBe("© {year} Kubar Protocol Private Limited");
  });
});

describe("metadata (HANDOFF section 5)", () => {
  it("matches every page's title and description to the handoff table", () => {
    const table = read("docs/rebuild/HANDOFF.md")
      .split("\n")
      .filter((line) => /^\| .+ \| \/\S* \| /.test(line))
      .map((line) => line.split("|").map((cell) => cell.trim()))
      .filter((cells) => cells[3].includes("Kubar Labs"));
    expect(table).toHaveLength(8);
    const metas: Record<string, { title: string; description: string }> = {
      "/": { title: messages.site.homeTitle, description: messages.site.homeDescription },
      "/products/kubar-protocol": messages.kubarProtocol.meta,
      "/products/navdhan-sdk": messages.navdhanSdk.meta,
      "/how-it-works": messages.howItWorks.meta,
      "/about": messages.about.meta,
      "/contact": messages.contact.meta,
      "/legal/privacy": messages.legal.privacy.meta,
      "/legal/terms": messages.legal.terms.meta,
    };
    for (const [, , route, title, description] of table) {
      expect(metas[route].title, route).toBe(title);
      // The handoff table types a straight apostrophe; the site sets a typographic one.
      expect(metas[route].description.replace(/’/g, "'"), route).toBe(description);
    }
  });

  it("points the social card and the /opengraph-image redirect at one existing file", async () => {
    const { socialImage, socialCard, organisationLogo } = await import("./app/page-metadata");
    const { existsSync } = await import("node:fs");
    expect(existsSync(join(root, "public", socialImage.url))).toBe(true);
    expect(existsSync(join(root, "public", organisationLogo))).toBe(true);
    expect(socialCard).toEqual({ title: messages.site.socialTitle, description: messages.site.homeDescription });
    expect(socialImage.alt).toBe(messages.site.socialImageAlt);
    const redirects = await nextConfig.redirects!();
    expect(redirects).toContainEqual({ source: "/opengraph-image", destination: socialImage.url, permanent: true });
  });
});

describe("error boundaries", () => {
  it("keeps the client-side error copy equal to the messages", async () => {
    const { errorCopy } = await import("./app/error-copy");
    expect(errorCopy.title).toBe(messages.system.error.title);
    expect(errorCopy.display).toBe(messages.system.error.display);
    expect(`${errorCopy.lineBefore}<email>${errorCopy.email}</email>${errorCopy.lineAfter}`).toBe(messages.system.error.line);
  });

  it("ships no message formatter or class merger to the browser", () => {
    const walk = (dir: string): string[] =>
      readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory() ? walk(`${dir}/${entry.name}`) : /\.tsx?$/.test(entry.name) ? [`${dir}/${entry.name}`] : [],
      );
    const clients = walk("src").filter((file) => read(file).startsWith('"use client"'));
    expect(clients.length).toBeGreaterThan(8);
    // Modules a client component imports are client code too.
    const reachable = new Set(clients);
    for (const file of reachable) {
      for (const match of read(file).matchAll(/from "@\/([^"]+)"/g)) {
        for (const ext of [".tsx", ".ts"]) {
          try {
            read(`src/${match[1]}${ext}`);
            reachable.add(`src/${match[1]}${ext}`);
          } catch {}
        }
      }
    }
    for (const file of reachable) {
      if (file.includes("agentation")) continue; // development only
      const source = read(file);
      expect(source, file).not.toMatch(/from "next-intl"/);
      expect(source, file).not.toMatch(/from "@\/lib\/utils"/);
      expect(source, file).not.toMatch(/from "[^"]*messages\/en\.json"/);
    }
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
