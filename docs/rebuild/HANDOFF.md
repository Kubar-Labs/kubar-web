# kubar.tech rebuild: Phase 8 handoff

For Claude Code, building the new kubar.tech in `Kubar-Labs/kubar-web`. Prepared 13 Nov 2026 from the signed-off design (Phases 5 to 7, with the option B changes of 4–12 Nov). Owner: Vaibhav Sharma, vaibhav@kubar.tech.

Everything you need to build is in this folder:

| File | What it is |
|---|---|
| HANDOFF.md | This brief: decisions, rules, routes, behaviour, build order, acceptance checks, open items |
| copy/*.md | The final words of every page, extracted from Figma in reading order, with each line's text style and link target |
| tokens/tokens.css, tokens/tokens.json, tokens/README.md | Colour, type, layout, shape and motion tokens, exported from the Figma variables |
| components.md | Every component with its Figma node ID, variants and behaviour, plus what not to build |
| KICKOFF.md | The prompt to start the Claude Code session |

## 1 · Ground rules

1. **Work on a branch, never on main.** Use the branch `rebuild-2026`, which already holds this folder. Commit as you go and push the branch. Do not merge, do not deploy to production, and do not change Cloudflare settings. Production releases are run locally by the team (docs/deployment.md); preview deploys only when Vaibhav asks.
2. **The copy is signed off.** Use the words in `copy/` exactly, including curly quotes, non-breaking hyphens in "set‑off" and the superscript footnote markers. If something reads wrong, or a line doesn't fit, flag it to Vaibhav; don't rewrite it. The only copy changes made in this handoff are listed in section 5 (metadata) and follow his decisions.
3. **Figures only as written.** $80bn, $126.92M, 2,857, $441.78bn and the rest come from the model of record and the sources register; never round, restate or add a figure.
4. **Nothing that expires.** The site is updated about once a quarter. No status words ("In build", "In preparation" and the like), no "as at" dates, no progress sections. The one exception is the venue's "Planned" with its footnote ¹.
5. **Never** use the State Emblem or the national flag; never name a financier or partner beyond what the copy names; never suggest retail access. The footnote ¹ (the ITFS registration line) travels with every mention of the venue.
6. **kubar.tech only.** navdhan.app is a separate site and stays untouched.
7. **Read the Next.js docs in node_modules first** (AGENTS.md: this Next.js has breaking changes).

## 2 · Sources of truth, in order

1. This file.
2. `copy/` for words, `tokens/` for values, `components.md` for behaviour.
3. The Figma page frames (section 3): layout, spacing, proportions. Build only visible layers: hidden layers in the frames are removed content (for example "Where we are"), not alternatives.
4. Figma component descriptions: useful for intent, but many predate option B. Where they disagree with this file, this file wins.
5. Notion (hub https://app.notion.com/p/40b1ff4407808189ad38dbaa91b4ad6c): Phase 5 design system (40c1ff44078081ab8eefed901afbd618), Phase 6 page designs (40d1ff44078081ac9c17d0fb5c6e64ba), Phase 7 motion (40e1ff44078081468ac9ea6fa5394426) and the copy deck (40c1ff44078081d39c1df8080158e47c, with 4.1 site-wide and 4.7 contact). Each Phase page opens with a dated option B amendment; the text below the amendment is older.

If two sources disagree and this order doesn't settle it, ask Vaibhav.

## 3 · Figma

File: https://www.figma.com/design/pFO3DEpqVzWCJdPghuq8nU. Use the Figma MCP tools (get_design_context, get_screenshot) with these node IDs; in a URL, write the ID with a hyphen (`?node-id=160-6`).

| Page | Route | 1440 | 768 | 390 |
|---|---|---|---|---|
| Home | / | 160:6 | 166:3363 | 162:1295 |
| Kubar Protocol | /products/kubar-protocol | 167:6 | 169:1931 | 168:684 |
| NavDhan SDK | /products/navdhan-sdk | 170:6 | 170:698 | 170:250 |
| How it works | /how-it-works | 172:6 | 172:1770 | 172:760 |
| About | /about | 173:6 | 173:1118 | 173:566 |
| Contact | /contact | 174:6 | 174:616 | 174:291 |
| 404 | (not found) | 176:6 | 176:265 | 176:151 |
| Error | (error boundary) | 176:347 | 176:485 | 176:424 |
| Privacy notice | /legal/privacy | 176:546 | 176:916 | 176:740 |
| Terms of use | /legal/terms | 176:1059 | 176:1486 | 176:1281 |

Other pages in the file: C1–C6 (components, see components.md), 01 · Foundations (token boards), 02 · Mark and lock-up, 03 · Idiom (diagram rules), 07 · Motion (179:275: four prototype flows, press Play).

**Home at 1440 is the reference page.** It was reviewed section by section with Vaibhav on 4 and 12 Nov. The other pages and sizes follow its idiom; the tablet and mobile frames other than Home's, Contact, and the legal and system pages were changed but not reviewed at full size, so where they look inconsistent with Home at 1440, follow Home and note it.

## 4 · What changed after the sign-offs (option B, 4–12 Nov)

On 4 Nov Vaibhav found the designs generic and AI-looking. He chose to keep the argument and the components' logic and rebuild their dressing. The Figma file reflects all of this; it's listed here because older documents don't.

**Type.** No italics anywhere. Headings H2–H4 are Schibsted Grotesk Medium, not the serif. Newsreader is only for the display headline, the band's line and the record's summary. Figures are Geist Mono. Mono labels and tags are sentence case with no tracking; mono capitals only for status words inside the record and ledger (Filed, Purchased, Planned).

**Colour.** Paper is a cool near-white (#F7F7F5), the inset #ECECE8. The current row is the inset ground plus a rani marker.

**Components.**
- "Illustrative" is a plain rani word with a dotted underline, not a chip. "Kubar holds none" and "No account, no payment, no release" are plain words, not chips.
- The state meter is a text counter, "05 of 08", not squares.
- No pictograms in record rows, party rows or diagram boxes. The Kubar mark appears in the header, the footer and the lanes diagram's Kubar column only, not in the "Who takes part" row.
- Portraits are in colour at rest; nothing changes colour on hover.
- The current-row marker is a 6 px rani bar whose foot is cut at the Kubar mark's angle (a 33° diagonal).
- Diagrams that were boxes and arrows are ruled registers: "If a buyer doesn't pay", the foundations stack, and the programme loop ("How a programme runs").

**Page anatomy (every page, every size).**
- The header is fixed on scroll.
- Sections are joined by a single hairline in `--color-rule-strong`, with `--section-space` (72/56/48) above and below. The band keeps the larger `--band-space`.
- No section numbers and no label above a heading.
- At desktop a section head is the heading (400 px wide) with its lead beside it (680 px). Several sections put their whole body beside the head instead (400 + 800): Home "The gap", "Standing", "Contact"; Kubar Protocol "The payment path", "The venue"; NavDhan SDK "Rules"; How it works "The evidence package"; About "Why GIFT City". Small sizes stack.
- Home's hero at desktop: two columns, the display (56 px) and the two route rows on the left (600), the record level with them on the right.

**Content decisions by Vaibhav.**
- Removed: "Where we are" (Home and About), "Where it stands" (NavDhan SDK), every status word and status column, the "What the labels mean" legend, the "Memberships and credits, not partnerships" note, the DPIIT row in the standing register (it stays in About's company register).
- Standing register: Sandbox, Membership, Award (FinVision), Award (Winner, Popular Choice Award, Startup Mahakumbh 2025).
- T-Hub, RubriX Cohort 5 (Incubation) replaces InfoEdge Centre for Entrepreneurship.
- Six headlines changed to drop a repeated two-beat cadence (already in `copy/`).
- Kept: the kicker on each product page naming who it's for; the subline and "Follow one receivable" link in the hero at 768 and 390.

## 5 · Routes, redirects and metadata

| Page | Route | Title | Meta description |
|---|---|---|---|
| Home | / | Kubar Labs · Building the institutional exchange for cross-border trade finance | Starting with the asset: export receivables an international financier can buy again and again, insured in its own name. |
| Kubar Protocol | /products/kubar-protocol | Kubar Protocol · Kubar Labs | Underwrite once, then buy every export receivable that fits: without recourse for the buyer's credit, insured in your name, with the evidence behind each one. |
| NavDhan SDK | /products/navdhan-sdk | NavDhan SDK · Kubar Labs | Embed NavDhan SDK so your exporters can finance their export receivables inside your platform. Financiers buy; Kubar runs the programme. |
| How it works | /how-it-works | How it works · Kubar Labs | Follow one illustrative export receivable from shipment to settlement: who does what, the documents behind each step and where the money moves. |
| About | /about | About · Kubar Labs | Kubar Labs is building the institutional exchange for cross-border trade finance, foundations first. The team and our standing. |
| Contact | /contact | Contact · Kubar Labs | Talk to Kubar Labs about a programme, an integration or anything else. Tell us who you are and your message reaches the right people. |
| Privacy notice | /legal/privacy | Privacy notice · Kubar Labs | How Kubar Labs handles personal data collected through kubar.tech. |
| Terms of use | /legal/terms | Terms of use · Kubar Labs | The terms on which kubar.tech is offered. |

Two descriptions differ from copy deck 4.1, following Vaibhav's 12 Nov decisions: NavDhan SDK drops its closing "In build." and About drops "Where we are,". Tell him in your first report.

Social card (Open Graph and Twitter, every page unless it sets its own): title "Kubar Labs"; description the Home subline; image with "Building the institutional exchange for cross-border trade finance." and the lock-up; alt "Kubar Labs: Building the institutional exchange for cross-border trade finance." The current image (public/media/kubar-labs-og-b2add55b.png) is the old brand; make a new one in the new type and colours and show it to Vaibhav.

Organisation JSON-LD: keep it, with email partnerships@kubar.tech, LinkedIn https://www.linkedin.com/company/kubarlabs/ and the new logo. Drop the Substack link unless Vaibhav confirms it.

Redirects (permanent): /products/navdhan → /products/navdhan-sdk · /for-platforms → /products/navdhan-sdk · /team → /about#team · /privacy → /legal/privacy. Keep the existing www → apex redirect and the /opengraph-image redirect (pointed at the new image). Update `src/app/sitemap.ts` to the eight routes and `robots.ts` as needed.

Footer copyright: "© [current year] Kubar Protocol Private Limited".

## 6 · Layout and responsive behaviour

- Grid: 12 columns at desktop, 8 at tablet, 4 at mobile; margins 80/40/20; gutters 24/24/16; content up to 1280 px, centred. Running text within `--measure` (640).
- Breakpoints (not in Figma; proposed): mobile < 768, tablet 768–1199, desktop ≥ 1200.
- Tablet is the mobile structure at eight columns with tablet type sizes. Nothing has a separate tablet layout.
- Every table on the site is a real `<table>` with header cells (the record, the ledger, every register). At mobile they become stacked rows: each row a block, the first cell as its heading, the other cells under it with their column names where the design shows them. Keep the table semantics (or use a description list) so screen readers still read them as structured data.
- Diagrams that are desktop-only (lanes, evidence sources drawing, platform lanes) have a register that carries the same content at every size; the register is always in the DOM.
- Square corners, no shadows, no gradients.

## 7 · Motion (final)

Motion shows a change of state and nothing else. Hover is only colour and underline.

| Element | Trigger | Behaviour | Duration, ease |
|---|---|---|---|
| Home "Follow one receivable…" (desktop) | Scroll | Pinned story, eight steps: each step writes the next state's row into the lanes (320 ms) and changes the panel (the counter, the state name, the sentence cross-fade 200 ms; path lines draw). A fast scroll lands on the nearest state with no half-drawn rows. "Skip the story" jumps past it. Never traps scroll. | scene 600 ms, standard |
| How it works "What happens to a receivable, in order." (desktop) | Scroll | The same mechanism with the How it works panel. | scene 600 ms |
| How it works "Who relies on the record." | Enters viewport | The eight document cards arrive one by one from 24 px below at 0 opacity, 80 ms apart, the purchase confirmation last; the record below is at 40% opacity until the last card lands. Hover or tap a card to open its From and Proves (one at a time). | write 320 ms each |
| Home "The gap" scale bar | Enters viewport, once | The $80bn bar draws from zero to full width, left to right; the $126.92M tick and hairline appear at the end. | scene 600 ms, standard |
| Buttons, links, nav items, rows | Hover, press | Colour, ground or underline (1 px → 2 px) only. Focus ring appears at once. | hover 120 ms |
| Products menu, mobile menu sheet, Illustrative note, abbreviation tips, question answers | Open, close | Fade in (the menu settles from 8 px above); leave on the exit ease; Escape closes; focus moves in and returns. | disclose 200 ms |
| Footnote | Arrived at from its marker | Takes the inset ground and rani marker, fading after 2 s; "Back to text" returns focus to the marker. | disclose |
| Form errors, error summary | Submit with errors | Appear with no transition; the summary takes focus. | none |

Nothing else animates. In particular, from the original Phase 7 spec these are dropped: the record's rows writing in on load, the money timeline's bars drawing, the embed sketch's states stepping, portraits colouring on hover, the state meter's squares.

On 768 and 390, and everywhere with `prefers-reduced-motion: reduce`: the two pinned stories are the ledger register (no pinning), the evidence stack is static with the last card open and the record at full, the bar is drawn, every duration is 0, smooth scroll is off. Screen readers always get the registers.

Implementation: the repo already has GSAP, Lenis and framer-motion (all three removed during the build: the pinned stories use CSS sticky and a small scroll reader; Vaibhav, 13 Nov 2026). Use GSAP ScrollTrigger for the two pinned stories and CSS transitions on the tokens for everything else; drop framer-motion unless it's needed. Lenis is optional; if kept, it must be off with reduced motion and must not break anchor links or focus. The header is fixed, so give anchor targets `scroll-margin-top` equal to the header's height.

## 8 · Accessibility

Target WCAG 2.2 AA; the existing e2e suite runs axe on every route and must stay green.
- "Skip to content" is the first focusable element; `#main-content` takes focus.
- One `h1` per page (the display headline).
- External links (LinkedIn, team profiles) add "(opens in a new tab)" to their accessible name and show the up-right arrow.
- Footnote markers are links named "Footnote 1" etc.; each footnote ends with "Back to text".
- Portraits: alt "[Name], [role]". Programme logos: alt is the programme name as written in the row.
- "Illustrative" is a button that opens its note in place.
- Abbreviations: the first use on each page carries its expansion as a tooltip that is also available to screen readers (list in copy deck 4.1: AD bank, DPIIT, EDPMS, FACE, GFTN, GIFT City, GIFT IFIH, IBU, IFSC, IFSCA, ITFS, MeitY, MSME, NIBM, RBI, SME, STPI).
- Colour never carries meaning alone (rani states always carry their word).
- Focus ring: 2 px `--color-focus`, offset 2 px, on every interactive element, never removed.
- Targets: 44 px for primary controls, 24 px minimum for inline links.
- Menus and the mobile sheet: Escape closes, focus is trapped in the sheet while open, the page behind doesn't scroll.

## 9 · What carries over in the repo, and what goes

Carries over (keep, adapt as below):
- `src/app/api/contact/route.ts`, `src/lib/contact-queue.ts` and `workers/contact-email/`: the queue, the email Worker, the rate limiter, the honeypot, the origin check and the request-size limit. The payload changes (below).
- `next.config.ts`: security headers and CSP, cache headers, the www redirect. Add the redirects in section 5.
- `wrangler.jsonc`, `open-next.config.ts`, `worker.mjs`, docs/deployment.md: deployment stays as it is.
- next-intl: keep the setup. Note that AGENTS.md says messages are YAML, but the repo loads `messages/en.json`; follow the code, and correct AGENTS.md.
- e2e/site.spec.ts: keep its checks (one h1, canonical URL, OG image, no axe violations, skip link) and point them at the new routes.

Goes (replace):
- Every page and component of the current site (src/app/*/page.tsx, src/components/*), its copy in messages/en.json, its palette and Plus Jakarta Sans.
- `src/approved-website-update.test.ts`: it protects the old site byte for byte and will fail by design. Replace it with tests for the new contracts (routes, redirects, the form's fields and intents, metadata).
- The Agentation dev toolbar can stay (dev only) or go; your call.

**The contact form's contract changes.** Old fields: fullName, email, phone, companyName, category (bank, fintech, …), website (honeypot). New fields (copy/06-contact.md): intent (institution, platform, exporter, investor, press, other), name, email, organisation, role (optional), message (≤ 2,000 characters), website (honeypot, unchanged). No phone. Update the API's validation, the queue message type, the Worker and their tests. Server-side limits mirror the client's.
- Routing: institution, platform and investor messages go to partnerships@kubar.tech; exporter, press and other to outreach@kubar.tech. The Worker currently sends everything to `CONTACT_FORM_RECIPIENT_EMAIL` (outreach@). Add the routing in code, but **Cloudflare Email Routing must allow partnerships@kubar.tech as a destination before this works in production: that's a dashboard step for Vaibhav.** Until he confirms it, keep a fallback that sends everything to outreach@.
- The internal email: subject "kubar.tech · [intent] · [organisation]"; plain, readable HTML in the new palette (the current template is the old dark-and-gold brand) plus a text part. Escape everything, as now.
- No reply-time promise anywhere.

## 10 · Assets

- Kubar mark and lock-up: the master SVGs (kubar-mark-{petrol,white,black}.svg, kubar-lockup-{petrol,white,black}.svg, sent to Vaibhav on 1 Nov; ask him for the zip, or export from Figma components 7:5 and 7:10). They replace public/logo.png. Favicon and app icon from the mark.
- Team portraits: export from the Person card instances on About · 1440 (173:6) at 2×, 4:5, in colour. Six people: Vaibhav Sharma, Rayansh Srivastava, Keshav Dudani, Manchit Sanan, Divyesh Reddy, Kavish Mahajan. Kavish's photo is black and white at source; keep it as is. The repo's public/team images are older; don't use them unless Vaibhav says they're the same photos.
- Programme logos: export from the Figma components listed in components.md (single ink, 176 × 64 box). The T-Hub mark is a raster; export at 2× and ask Vaibhav for a vector.
- Icons: the nine Figma icons (components.md), as inline SVG in currentColor. Don't add an icon library.
- Images: AVIF/WebP through the existing Cloudflare Images binding; explicit width and height on every image.

## 11 · Performance budget

Mobile, p75: LCP ≤ 2.0 s, INP ≤ 200 ms, CLS ≤ 0.05. Fonts ≤ 300 KB total with two preloaded. Home JavaScript ≤ 170 KB compressed; load the motion code after first paint. Headlines, footnotes and the first screen must not wait for motion or fonts (font-display: swap with metric-matched fallbacks). Cloudflare Web Analytics only; no other trackers, no cookies.

## 12 · Build order and check-ins

Report to Vaibhav at the end of each step with screenshots at 1440, 768 and 390, and wait for his go-ahead before the next.
1. Foundations: fonts, tokens in globals.css, the grid, header (fixed), footer, skip link, 404 and error pages. Remove the old pages and components. One page of type and colour specimens for review.
2. Primitives and registers: buttons, links, footnotes, Illustrative, the record, the ledger, route rows, standing, programme rows, the table-to-stack pattern.
3. Home, complete, at all three sizes, with the pinned story and the scale bar. This is the reference: get Vaibhav's sign-off before the other pages.
4. Kubar Protocol, NavDhan SDK, How it works, About.
5. Contact with the new form contract, API, Worker and tests; the legal pages.
6. Redirects, metadata, sitemap, social image, JSON-LD.
7. QA (section 13), then a preview deploy if Vaibhav asks for one.

## 13 · Acceptance checks

- `npm run release:check` passes (lint, typecheck, unit tests, Cloudflare build). `npm run test:e2e` passes, including axe on every route.
- Every word on every page matches `copy/` (diff the rendered text against the files; that check is worth automating).
- No status words except the venue's "Planned"; no "as at" dates; no section numbers; no labels above headings; no italics; no pictograms in rows; no chips.
- Each page compared with its Figma frame at 1440, 768 and 390 (screenshots side by side); Home at 1440 is held to the closest match.
- Reduced motion: both stories show their registers, nothing animates.
- Keyboard only: every link, button, menu, disclosure, footnote and form field reachable and operable, focus always visible, Escape closes everything that opens.
- The form: each intent preselects from ?intent=, every error message appears as written, the error summary takes focus, success/server error/rate limit/offline states all show their copy, the honeypot silently drops, oversize and cross-origin requests are rejected.
- Redirects return 308/301 to the right place; the sitemap lists the eight routes.
- Lighthouse mobile on Home, Kubar Protocol and How it works within the budget in section 11.
- Text at 200% zoom and at 320 px wide reflows with no horizontal scroll (the lanes diagram is desktop-only, so this holds).

## 14 · Open items (Vaibhav to decide; build around them)

1. **Tablet display size.** The token is 56 at desktop but 64 at tablet. Proposal: 48 at tablet. (tokens/README.md)
2. **Legal placeholders.** "Last updated: [date]" on both legal pages, and the retention period "[24 months]" in the privacy notice. Both legal pages are drafts for counsel (copy deck 4.8, not legal advice).
3. **Terms, section 4,** says "Status labels describe the position on the date shown"; the site no longer carries status labels. Build as written; flag for counsel.
4. **partnerships@ routing** needs the Cloudflare Email Routing destination (section 9).
5. **Social image** to be redrawn in the new brand and approved.
6. **T-Hub logo** as a vector.
7. **Unreviewed frames.** Tablet and mobile frames other than Home's, Contact, and the legal and system pages were changed but not reviewed at full size in Figma. Where they disagree with Home at 1440's idiom, follow Home and list the differences in your report.
