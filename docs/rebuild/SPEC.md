# kubar.tech: the spec, as built and released

This is the one current description of kubar.tech, the public site of Kubar Labs, in `Kubar-Labs/kubar-web`. It describes the site as it was released to production on 15 November 2026 (`main`).

It replaces two files, which are kept unchanged in `archive/`:

- `archive/HANDOFF.md`, the original brief of 13 Nov 2026;
- `archive/REDRAW-2026-11-14.md`, the redraw of 14 Nov and every review after it.

Where the two disagreed, the later decision won, and this file states only the result. The appendix shows where each old section went. Comments in the code that cite "HANDOFF section N" or "REDRAW-2026-11-14.md, section N" point at the archived files; rule numbers that are cited often (11.1 to 11.5) keep their numbers here.

Owner: Vaibhav Sharma, vaibhav@kubar.tech.

| File | What it is |
|---|---|
| SPEC.md | This file |
| copy/*.md | The signed-off words of every page, in reading order, with each line's text style and link target |
| tokens/tokens.css, tokens/tokens.json, tokens/README.md | Colour, type, layout, shape and motion tokens |
| components.md | Every component with its Figma node id, variants and behaviour |
| prototypes/ | Working prototypes that are the reference for motion |
| HANDOVER-SESSION.md | Notes on this machine and on checks that flaked |
| archive/ | The two superseded files |

## 1 · Ground rules

1. **Work on a branch, never on main.** Commit as you go. Do not merge, deploy or change Cloudflare settings. Production releases are run locally by the team (`docs/deployment.md`), and only when Vaibhav says so.
2. **The copy is signed off.** Use the words in `copy/` exactly, including curly quotes, the non-breaking hyphen in "set‑off" and the superscript footnote markers. If something reads wrong, or a line doesn't fit, tell Vaibhav; don't rewrite it and don't cut it.
3. **Figures only as written.** $80bn, $126.92M, 2,857, $441.78bn and the rest come from the model of record and the sources register; never round, restate or add a figure.
4. **Nothing that expires.** The site is updated about once a quarter. No status words ("In build", "In preparation" and the like), no "as at" dates, no progress sections. The one exception is the venue's "Planned" with its footnote ¹.
5. **Never** use the State Emblem or the national flag; never name a financier or partner beyond what the copy names; never suggest retail access.
6. **The site's vocabulary.** A financier buys a receivable. Never loan, lend, lender, borrower or repayment. "ITFS registration", never "licence". This holds for words nobody reads on the page too (alt text, aria labels).
7. **kubar.tech only.** navdhan.app is a separate site and stays untouched.
8. **Read the Next.js docs in `node_modules/next/dist/docs` first** (AGENTS.md: this Next.js has breaking changes).
9. **Never type, ask for or store a password, key or token.** If something needs a sign-in, stop; Vaibhav does it.

## 2 · Sources of truth, in order

1. This file.
2. `copy/` for words, `tokens/` for values, `components.md` for behaviour.
3. The Figma page frames (section 3): layout, spacing, proportions. Build only visible layers: hidden layers are removed content, not alternatives. Frames named "before 14 Nov" are archive.
4. Figma component descriptions: useful for intent, but many predate the redraw. Where they disagree with this file, this file wins.

Where the tablet and phone frames disagree with the build on something this file doesn't settle, the build wins; list the difference, don't change it. If two sources disagree and this order doesn't settle it, ask Vaibhav.

## 3 · Figma

File: https://www.figma.com/design/pFO3DEpqVzWCJdPghuq8nU. Use the Figma connector with these node ids; in a URL, write the id with a hyphen (`?node-id=160-6`).

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

Other pages in the file: C1 to C6 (components, see `components.md`), 01 · Foundations (token boards), 02 · Mark and lock-up, 03 · Idiom (diagram rules), 07 · Motion.

Home at 1440 is the reference page. After 14 Nov most frames were updated at 1440 only; section 8 names the node of each drawing.

## 4 · Routes, redirects and metadata

| Page | Route | Title | Meta description |
|---|---|---|---|
| Home | / | Kubar Labs · Building the institutional exchange for cross-border trade finance | Indian export receivables, originated, insured and documented so an international financier can buy them again and again. |
| Kubar Protocol | /products/kubar-protocol | Kubar Protocol · Kubar Labs | Underwrite once, then buy every export receivable that fits: without recourse for the buyer's credit, insured in your name, with the evidence behind each one. |
| NavDhan SDK | /products/navdhan-sdk | NavDhan SDK · Kubar Labs | Embed NavDhan SDK so your exporters can finance their export receivables inside your platform. Financiers buy; Kubar runs the programme. |
| How it works | /how-it-works | How it works · Kubar Labs | Follow one illustrative export receivable from shipment to settlement: who does what, the documents behind each step and where the money moves. |
| About | /about | About · Kubar Labs | Kubar Labs is building the institutional exchange for cross-border trade finance, foundations first. The team and our standing. |
| Contact | /contact | Contact · Kubar Labs | Talk to Kubar Labs about a programme, an integration or anything else. Tell us who you are and your message reaches the right people. |
| Privacy notice | /legal/privacy | Privacy notice · Kubar Labs | How Kubar Labs handles personal data collected through kubar.tech. |
| Terms of use | /legal/terms | Terms of use · Kubar Labs | The terms on which kubar.tech is offered. |

`src/site-contract.test.ts` holds the site to this table.

- **Social card** (Open Graph and Twitter, every page): title "Kubar Labs"; description the Home subline; image `public/media/kubar-labs-social-bd9a99c9.png`, drawn by `scripts/social-image.mjs` in the site's type and colours, with "Building the institutional exchange for cross-border trade finance." and the lock-up; alt "Kubar Labs: Building the institutional exchange for cross-border trade finance."
- **Organisation JSON-LD:** email partnerships@kubar.tech, LinkedIn https://www.linkedin.com/company/kubarlabs/ and the logo `public/media/kubar-mark-970208af.png`. No Substack link.
- **Redirects (permanent):** /products/navdhan → /products/navdhan-sdk · /for-platforms → /products/navdhan-sdk · /team → /about#team · /privacy → /legal/privacy · /opengraph-image → the social image · www → apex.
- **Sitemap:** the eight routes (`src/app/sitemap.ts`).
- **Footer copyright:** "© [current year] Kubar Protocol Private Limited".

## 5 · The rules behind the drawings

1. **Depth where something stacks or builds.** Documents stack into a record, foundations build into a venue, layers sit behind a product. Those are drawn in isometric projection.
2. **Flat where the reader compares or reads.** The to-scale bar, the who-takes-part map, glossaries, registers a credit committee looks things up in, forms and legal text stay flat.
3. **A shadow means an object.** Sheets, parties on the map, routes you can take, the one item picked out of a set. Never a shadow or a card only to group text.
4. **No set of identical cards.** Where three or four things are compared, one is raised and the rest are quiet columns.
5. **No hairline between sections.** Sections are separated by space. The header keeps its bottom rule.
6. **Monospace only where it carries a reference.** Identifiers (Record RCV-0001, Receivable RCV-0001, the "RCV-0001 · RCV-0002 · …" line, Doc 01 to 08); numbers in a sequence (lane rows, steps, the numbers on the staircase blocks); states and counters (Filed, Purchased, Planned, 05 of 08); figures; the money timeline's day labels. Every other small label is `Sans/Fine` in the secondary text colour.
7. **Numbers only on real sequences.** The venue's three points and the SDK's four rules have none.

Also: no italics anywhere; no pictograms in rows, party boxes or diagram boxes; no chips; no "Illustrative" tag (rule 11.10); no section numbers and no label above a heading; no kicker above a page's headline. The Kubar mark appears in the header, the footer and the lanes drawing's Kubar column only.

## 6 · Tokens

Values live in `tokens/tokens.css` (copied to `src/app/tokens.css`; a test holds the two equal) and are described in `tokens/README.md`. Use the tokens, not raw values.

- **Colour.** The page ground is white (`#FFFFFF`); the inset ground is `#ECECE8`. Petrol is the band's ground and the picked item in a set (the Petrol colour mode, `data-ground="petrol"`). Rani (`--color-accent`) follows rule 11.4. There is no dark theme.
- **Type.** Schibsted Grotesk for the display headline (Medium, −2% tracking), the band's line (Medium, −1%), headings H2 to H4 (Medium), body and UI. Geist Mono per rule 6 of section 5; mono capitals only for state words. Newsreader in one place: `Serif/Record`, the sentence inside a record. Display is 56/60 at desktop, 48/52 at tablet, 40/44 on phones. `Mono/Figure large` (96/100) is used once, on Home's "About $80bn".
- **Type floor.** Rule 11.6.
- **Corners** are square. **Elevation** has three levels, in petrol/900, used only where section 8 names an object:

```css
--elevation-1: 0 1px 2px rgb(2 39 50 / .08), 0 6px 16px rgb(2 39 50 / .08);   /* resting */
--elevation-2: 0 2px 4px rgb(2 39 50 / .08), 0 14px 36px rgb(2 39 50 / .12);  /* raised */
--elevation-3: 0 4px 8px rgb(2 39 50 / .08), 0 24px 56px rgb(2 39 50 / .16);  /* lifted: the current sheet, the picked card */
```

Raised surfaces are white with a 1 px `rule/default` border.

- **Motion tokens:** 120 ms hover, 200 ms openings, 320 ms arrivals with an 80 ms stagger, 600 ms scenes; `--ease-standard` and `--ease-exit`. With `prefers-reduced-motion: reduce` every duration is 0.

## 7 · Layout and page anatomy

- **Grid:** 12 columns at desktop, 8 at tablet, 4 on phones; margins 80/40/20; gutters 24/24/16; content up to 1280 px, centred. Running text stays within `--measure` (640).
- **Breakpoints:** phone below 768; tablet 768 to 1023; laptop and desktop from 1024 (`--breakpoint-lg`), so every iPad in landscape gets the laptop layout (16 Nov 2026; it was 1200 at the release). The value also lives in media queries in `globals.css` and `tokens.css` and in script constants that mirror them (`Header.tsx`, `AbbreviationTips.tsx`, `StoryView.tsx`). `--breakpoint-xl` is 1200, where the content reaches 1040 px.
- **Page margin at laptop width** runs from 40 px at 1024 to 80 px at 1200, so the content runs from 944 to 1040 px without a jump.
- **Tablet** is the phone structure at eight columns with tablet type sizes, full width, with running text kept to `--measure`. An upright iPad shows the 768 layout. Exceptions are named in section 8 (the SDK hero from 1000; the two-column blocks from 768).
- **Laptops get the desktop composition** (rule 11.1). Section 7a says how each section behaves from 1024 to 1199.
- **The header** is fixed on scroll on every page, with its bottom rule. It shows the full nav from 1024. Below 1024 the links collapse into a "Menu" button (64 × 44) that opens a full-screen sheet of ruled rows with "Talk to us" (48 px) at the foot. No LinkedIn link in the header or the sheet. The Products menu opens on click only.
- **Sections** are separated by `--section-space` (72/56/48) and no rule. The band keeps the larger `--band-space`.
- **A section head** at desktop is the heading (400 wide; 320 with a 48 px gap from 1024 to 1199) with its lead beside it (680). Several sections put their whole body beside the head instead (400 + 800): Home "The gap", "Standing", "Contact"; Kubar Protocol "The payment path", "The venue"; NavDhan SDK "Rules"; About "Why GIFT City". Small sizes stack.
- **Tables.** Every register that is still a table is a real `<table>` with header cells; on phones a table becomes stacked rows, each row a block with its first cell as the heading. Where a drawing replaced a visible table, the table stays in the page for screen readers unless the drawing's own list serves everyone (section 8 says which).
- **"On this page"** (Kubar Protocol and How it works): a ruled row under the hero, "On this page" in muted Sans/Fine, then each section's name as an anchor link, wrapping. Once the row has scrolled away a small fixed "On this page" button shows at the bottom right; it opens the same list in a sheet, marks the section the reader is in, and closes on Escape, a pick or a click outside. It steps aside while a link, a button, a field or the footer is under it. It doesn't change the header's height or the pinned journey's measurements. Its names are the words a visitor sees (rule 11.9).
- **Footnote ¹** (the ITFS registration line) shows once on each page that discusses the venue, and every marker ¹ on that page links to it (rule 11.11).
- **Anchor targets** have `scroll-margin-top` equal to the header's height.

## 7a · From 1024 to 1199 (16 Nov 2026)

The rules for this band: a drawing may scale down to 80% and no lower; no label in a drawing under 12 px (mono tags are 11 px by token at every width; the rule governs scaling); no sentence under 15 px; no row leaves more than a third of the content width empty; an iPad is a touch screen at laptop width, so whatever answers a hover answers a tap. Scaling a drawing scales its type, so most sections fit their geometry and keep their type; only a drawing whose words survive it is scaled.

| Section | From 1024 to 1199 |
|---|---|
| Home · hero | Re-flowed, up to 1327: headline and subline across the top, routes left, record right. Two columns need 1,164 px of content. |
| Home · the gap | Laptop layout; the large figure runs from 77 px at 1024 to 96 px at 1200 and the second column is 300. |
| Home · story | Laptop layout: 380 px cards beside the pinned lanes, the party boxes 2 px closer so "Singapore" keeps its line. |
| Foundations drawing (Home, About) | Laptop layout at full size, in its own build: the blocks are 14 px thicker, so the levels are 92 px apart and the five labels, each on its level and each two lines, keep an even 20 px between them. The panel's padding is 24, the leaders 40 shorter and the labels' column 360. |
| Kubar Protocol · What you buy | Re-flowed, up to 1279: the sheet with the tablets' small timeline and its list beside it. The day-axis timeline shows from 1280. |
| Kubar Protocol · How a programme runs | Re-flowed, up to 1279: "Set up once" in two columns of three across the top, the loop under it at its full 760, centred. Side by side from 1280. |
| Kubar Protocol · Cover in your name | Laptop layout; the box moves left so its labels stay inside the content. |
| Kubar Protocol · The loss history | Re-flowed: the heading across the top, the drawing and its labels under it at full size, centred. |
| NavDhan SDK · hero | The sketch keeps its 519 px from 1024; the list takes the rest. |
| NavDhan SDK · How it runs | Laptop layout, fitted (0.89 at 1024); its 13 px labels hold 12 px (`fit-keep`). |
| How it works · story | Side by side with 360 px cards. The pinned column holds the stack and its eight rows, names on two lines where needed; the financier's line and the relying lines follow the cards, as on tablets. Needs about 540 px of height. |
| How it works · If a buyer doesn’t pay | Laptop layout; the three boxes share the width (275 at 1024, 300 from 1200). |
| How it works · signs map | Laptop layout, columns share the width; the key sits under the map. |
| Registers (the ledger) | The state column takes a little from the last. |
| Contact | The form is 560; each address sits under its label. |
| Everything else | Laptop layout, unchanged. |

## 8 · The site, page by page

Node ids are the 1440 frames unless marked. The words are in `copy/`.

### Home (`160:6`, 768 `166:3363`, 390 `162:1295`)

| Section | As built |
|---|---|
| Hero `160:52` | The headline, then the subline directly under it at every width, the two route rows, and the record: `Record · isometric` `245:3225` (768 `248:3239`; phones the compact record `353:3704`). Eight sheets, 08 on top and current, with "FILED" on the top sheet only. Eight rows beside them, one line each, the number and the name, each tied to its sheet by a hairline; no source and no status in the rows. Under the sheets, for the picked document, "From" and "Proves", then "See how it works". 08 is picked until a row is: hover, focus or tap. The hero's rule (Vaibhav, 16 Nov): from 1328, two columns, headline, subline and routes left (578), the record right, because the one-line rows need 1,164 px of content; from 1024 to 1327, headline and subline across the top, routes left and the record right under them, so the headline never takes five lines and the top sheet and first rows are on an iPad's first screen. Below 1024: headline, subline, record, routes, then the "Follow one receivable" anchor. Phones: the sheets at 0.53 (0.43 under 390 wide) and 18.9 px apart, the names alone beside them, "From" and "Proves" each under its label; the hero is at most 1,150 px tall at 390×844. No footnote in the hero: marker ¹ on "exchange" links to the one under the foundations. |
| The gap `160:63` | Heading and lead across the top. One raised card `241:3412`: "About $80bn" at 96 px, "$126.92M" in rani at 56 px, each with its caption in Sans/Body; a full-width petrol bar 64 px high and under it a rani sliver at 0.16% of the bar's width, with the "Drawn to scale" caption in Sans/Fine. Footnote ² opens from the disclosure link "How we estimate this"; following marker ² opens it and moves focus to the footnote (without script, landing on the closed disclosure is accepted). Footnote ³ stays visible. |
| One receivable `160:71` | The heading with its lead beside it ("Kubar is in the data path of every step and in the money path of none."), then the pinned journey on the lanes drawing (section 9). Eight cards; "Skip the story" with no arrow; no legend, no tag, no "Party ·" line, no link of its own. |
| Band | "Every receivable that settles adds to a priced loss history, and that history is what brings in the next financier." with "See how it works". |
| An exchange needs more than a venue `160:104` | `242:3390`: TReDS and Indian Energy Exchange as two quiet columns, GIFT City · ITFS as one raised petrol card (480 wide); "Today" stays, "On the exchange" is cut. Then an inset panel `242:3433` holding `Foundations · isometric` `246:3160`: four solid blocks, widest at the bottom, the venue dashed on top, each tied to its title and sentence; "Planned¹" on the venue in the secondary colour with a rani marker. Footnote ¹ is under it. |
| Who takes part `160:127` | A map on an inset panel `243:3330`. Top row: Exporters, Financiers, Buyers. Bottom row: Trade platforms, Kubar (petrol), Credit insurers. Solid 2 px arrows for money (financiers to exporters, buyers to financiers); dashed 1.5 px arrows for data (exporters to trade platforms, trade platforms to Kubar, Kubar to financiers, Kubar to credit insurers). No solid line touches Kubar. The legend is under the cards. Tablet and phone: one column of cards in the order Buyers, Financiers, Exporters, Trade platforms, Kubar, Credit insurers, joined by the same two arrow styles, with a dashed return arrow from Kubar up to Financiers on the right, inside the panel (cards inset 28 px on that side). A card picked by hover or tap dims the arrows that don't touch it to 30% (`PickStage`). |
| Standing `160:844` | Four plain statements, no kind labels, no lead, no cards. Six programme marks in one row with names (T-Hub, RubriX Cohort 5 among them; its mark centred in its 176 × 64 box). |
| People | Six portraits (`public/people/`, 800 × 1000 PNGs on transparent ground), greyscale at rest and in colour on hover and keyboard focus of the card, over 200 ms. The row has `scroll-padding-inline` equal to the page margin. |
| Contact `160:1022` | Two route cards (the financial-institution one in petrol), then investor and press as two small link rows. |

The technology programmes are not on Home; they are on About only.

### Kubar Protocol (`167:6`, 768 `169:1931`, 390 `168:684`)

| Section | As built |
|---|---|
| Hero `167:52` | Text at 720 beside `Limit and receivables · isometric`: a dashed box for the programme limit, RCV-0001 and RCV-0002 inside, RCV-0003 above it with a rani edge. The headline is the display face; the button is 48 px. Phone and tablet: the drawing under the text. Then the "On this page" row `291:3962`. |
| Where this sits `309:2495` (768 `314:3130`, 390 `314:2805`) | A strip on the inset ground, the full width of the screen, directly under the hero and its "On this page" row: the five foundations drawn small with Standing buyers in petrol, "Where this sits", the sentence and the link "Follow one receivable through all five" to `/#one-receivable`. See "The strip" under NavDhan SDK. |
| What you buy `167:101` | `Receivable sheet` `255:1955`: face value at 56 px, the other nine attributes in two columns, two sheets behind; "An example" as plain muted Sans/Fine on its top row. The money timeline `167:127` beside it, drawn to scale on a day axis that follows its column; between 1200 and 1279 it stacks under the sheet at the full content width. At 768 and 390 the small drawing sits above the words as a list. |
| How a programme runs `167:128` | `251:2015`: "Set up once" as six numbered dots on a vertical line; "Then, for every receivable" as five raised cards round an ellipse with five direction arrows, the RCV line in the middle; no party tags. The loop keeps 760 from 1280 up and is fitted to its column below that (`FitStage`). "The credit decision is yours; Kubar can’t override it." is 15 px. Phone and tablet: the five cards in a column with a return arrow up the left side. Stepper: a click, a tap or focus on a card moves the travelling sheet to rest just before that card and raises the card; a click elsewhere returns the sheet to 05. |
| The evidence package | The ten elements show once, as a list of buttons: each row shows the element and its source with a small plus at its right; a click, a tap or Enter/Space opens its "Checked against" line under it, one at a time (`aria-expanded`). At desktop dashed stubs join the elements to one spine and one arrow into the record. There is no separate table. |
| Cover in your name `167:319` | Under the lead, the hero's limit box at 0.8 scale, still, with three labels (`289:2664`): "An approved buyer limit", "Headroom" (a bracket on the right post) and "Receivables bought". From 1440 it sits in the lead's column; narrower laptops move it left so its labels fit. |
| The payment path | `Money path` (`120:1167`): four parties, Kubar filled and off to the side with "Kubar holds none" on its chip, solid money arrows only between the three banks' columns; the lanes follow their column. Below 1200 the three payments are rows, each with its from and to, then Kubar with the chip. |
| The loss history `167:387` | `288:2663` beside the heading: four stacked settled sheets with RCV-0003 hovering above on two dashed drop lines; labels "Settled" and "The loss history" (with "Recorded by buyer, exporter and commodity" under it); two dashed arrows out to "It lets an insurer price the pool" and "It brings in the next financier". The lead is not shown; it is the drawing's description for screen readers. Laptops from 1200 narrow the heading's column to 340. |
| Who holds what `167:393` | "You, the financier" as one raised petrol card (420); the other four as plain blocks in a two-by-two. Filled dot for "Holds", hollow rani dot for "Doesn’t hold". |
| Questions | Ten questions. From 768 up they are all open; below 768 they are an accordion with the first one open. |
| Where each institution fits | A two-column register, Institution and Role. |
| Programme 1 `167:561` | The corridor: Exporters and Buyers as two raised cards joined by a 2 px arrow labelled "Terms / Open account"; Financier and Cover as plain text; "Next" in a dashed box. Labels in Sans/Fine, secondary colour. |
| The venue `167:591` | "Planned" with footnote ¹, three unnumbered points and the closing line. |
| Next step | Heading, lead, button, "Or email". |

### NavDhan SDK (`170:6`; the 768 and 390 frames were not updated)

| Section | As built |
|---|---|
| Hero `170:53` | The headline, lead and button; then "What you embed." (H3) and the six capabilities at 640 beside the embed sketch at 519 (list `291:1349`, outline `291:1370`). Each row is a button; hover, focus or a tap picks it (`aria-pressed`), and "Eligibility check" is picked from the start. The picked row has a 2 px ink rule on its left and its part of the sketch is outlined in 2 px ink. "Shipment and document capture" outlines the Shipment list. "Consented onboarding" swaps the SDK panel for three filled marks ("Identity check", "Business check", "Consent recorded"); "Events for your product" shows a small "Purchased" status beside "Invoice". No tag and no figures on the sketch. From 1000 the sketch sits beside the list (the list about 45% wide between 1000 and 1199). Below 1000 there is no full sketch: the six rows are an accordion (`aria-expanded`), one open at a time, "Eligibility check" open from the start, and an open row shows its own piece of the sketch under its sentence. |
| Where this sits `310:1331` (768 `320:1567`, 390 `320:1440`) | The same strip directly under the hero, with the common standard in petrol. **The strip:** the stack is Home's at a quarter of its size, four solid blocks and the venue dashed, beside a ruler with a tick at each level; the five names sit on their levels in muted Sans/Fine. The page's level has a petrol top face, an ink leader, a rani tick (rule 11.4: the one element the drawing is about) and its name in ink; it is `aria-current` in the list. Side by side from 768, stacked below. From 390 to 767 a long name may take two lines, as the 390 frame draws it; under 390 the art is at 0.8 so each name but the last keeps its line. Server-rendered, no script, nothing moves. The venue's name carries no "Planned" and no footnote marker here. |
| For your exporters, For your platform | One two-column block from 1200 up (`296:9538`), stacked below. |
| How it runs on your platform | A five-step register beside three lanes (Your platform, Kubar Protocol filled, The financier), fitted to its column on narrower laptops. Below 1200 the register only. No column heads. |
| Rules | Four rules, no numbers. |
| Behind it `170:152` | `Layers · isometric` `261:843`: from the top, your platform (white) with a small rani-edged NavDhan SDK tile on it, Kubar Protocol (petrol), banks, insurers and funds (white). Labels on leaders to the right at desktop, under the drawing below that; a label marks its layer at desktop. No layer descriptions. |
| Next step | Heading, lead, button. |

### How it works (`172:6`, 768 `172:1770`, 390 `172:760`)

| Section | As built |
|---|---|
| Hero `172:52` | Text at 660 beside `Eight states · isometric steps` `258:1829`: eight blocks rising left to right, numbered 01 to 08 on their top faces, 08 in petrol. Then the "On this page" row. |
| What happens to a receivable `172:95` | The pinned journey on the evidence stack `258:1864` (section 9). The documents are numbered so they land in order (Doc 01 to 08, in `copy/04-how-it-works.md`). Each state's documents land as its card passes, bottom up, with no empty slots: state 01, Doc 01 to 03; 02, Doc 04 and 05; 03, Doc 06; 04, Doc 07; 05, Doc 08. The relying lines appear with their states and stay: 05 "The financier buys on it."; 06 the exporter's bank and the subvention lines; 07 "The insurer prices on it." Each card keeps its sentence, its data path and its money path; no Documents block and no legend on the card. The two notes stay under the stack. Tapping a row lifts its sheet. |
| Where the money moves | The same `Money path` as Kubar Protocol. |
| If a buyer doesn’t pay `172:528` | `259:2120`: steps 01 to 03 (Kubar) in a row, a fork under step 03 labelled "No dispute" and "A dispute", steps 04 and 05 on the first branch and 06 on the second, then "Kubar holds none of the risk" and the note. No lead; the heading runs 800 wide at desktop. Phone: one column, the two branches stacked under their labels. |
| Each party signs for its own part `172:541` | From 1200 up a map `287:2806`: seven cards (304 × 204, three columns with 184 px gaps, 160 below 1280, and 100 px between rows). Row 1: Insurer, Financier. Row 2: Trade platform, Kubar (petrol), Exporter. Row 3: Exporter’s bank and Buyer, under Kubar and Exporter. Five agreements as 1.5 px ink lines with a label on each and no arrowheads; three papers a party signs alone as a tag in its card; a two-line key at the bottom left, at 15 px. A card picked by hover or tap keeps its lines and dims the others; no tab stops for the highlight; a tap outside clears it. Below 1200 the stacked register shows. The table stays in the page for screen readers at every width. |
| The terms | Nineteen terms, no column heads. Each row has an id; abbreviation tips across the site link to them. |
| Next step | Two routes, no heading. |

### About (`173:6`, 768 `173:1118`, 390 `173:566`)

| Section | As built |
|---|---|
| Hero | Headline, lead, and footnote ¹ under it. |
| What we’re building `173:86` | The isometric foundations from Home with About's own, shorter sentences and "Planned" as the venue's state word; no H3 over them. Then the link. |
| The team | Six full person cards and the four advisers; "Advisers serve in a personal capacity." at 15 px. LinkedIn links have a 44 px tap area. |
| Standing and memberships `173:355` | As on Home: four statements beside the heading, no lead, no kind labels; the programme marks; then the technology programmes. |
| Why GIFT City `173:417` | Beside the text, `290:2574`: three isometric platforms in a row, each with a title and a line (Onshore India; GIFT City, with a petrol top and a small receivable sheet; Abroad), a dashed arrow "The receivable" and a solid arrow "Purchase price" between the first two, and a solid arrow "Payment on the due date" from Abroad to GIFT City. A schematic, not a map. From 768 the drawing takes its column's width with its words on it. Below 768 the three zones stack down the page, each a platform about 120 px wide with its title and line beside it, and the arrows run vertically between the rows with their labels beside them. The marker ¹ here links to the hero's footnote. |
| Band | "Kubar connects Indian trade flows to global institutional capital through GIFT City." |
| The company | A register with no visible column heads (the table keeps them for screen readers). |
| Next step | Three links. |

### Contact (`174:6`)

- The routes table has two columns ("If you are", "Next step"). Choosing a route that leads to the form pre-fills "I’m writing as" and moves focus to that field; arriving from another page with `?intent=` pre-fills it and leaves focus alone.
- The form: section 16.
- The direct addresses sit beside the form from 1200 up and under it below that. No separate Direct section.

### 404, error, privacy, terms

No drawings and no section hairlines. Legal pages: title and date; contents in the left three columns, sticky at desktop and under the date on phones; numbered H4 headings; body at 628. Contents links are 44 px tall on touch screens; the 404 page's links are spaced so their tap areas don't overlap. Terms of use, section 4, is "4. Plans and examples". Counsel's review of both legal pages is done.

## 9 · The pinned journeys

One pinned journey a page. Home pins the lanes drawing; How it works pins the evidence stack. Both run on `src/components/story/StoryView.tsx`. Prototype: `prototypes/pinned-story-options.html`, option B.

- **What is pinned.** Only the drawing is sticky (`position: sticky`). The states are cards in normal flow: beside the drawing at desktop, below it on tablets and phones. Nothing traps or drives the scroll. The cards are real content in reading order; the drawing is `aria-hidden`. "Skip the story" is first.
- **Which state is current.** A state becomes current when its card crosses a line 45% of the way down the space left for the text. An IntersectionObserver watches that line; there is no scroll handler. The current card is raised (`--elevation-2`); the others sit flat, in the secondary text colour; the change takes 200 ms. At laptop width each state holds for its slot: 36svh on Home, a little over a third of the screen (the section is 3,239 px at 1440×900; it was 4,649), and about 60svh on How it works.
- **Row heights come from the viewport, in `svh`,** so a phone's address bar does not make the drawing jump. Desktop: rows of `clamp(44px, (100svh − header − party row − 48px) / 8, 74px)`. Below desktop the drawing takes at most 45% of `100svh`, with rows of `clamp(22px, (45svh − party row − 24px) / 8, 40px)`.
- **The compact lanes** (below desktop; `266:4120`): six equal columns, party boxes 40 px high with labels on two lines where needed (Kubar's box filled petrol), the current row tinted with the rani marker at its left edge, arrows without labels, dashed 1.5 px for data and solid 2 px for money. Earlier rows stay drawn; later rows are empty.
- **Home on phones** (below 768; 16 Nov 2026). The target is 2,750 px for the section at 390×844 (it was 3,129), with all eight cards and every word, inside two limits: each state holds for at least a third of the screen's height of scroll, and the current card is never under the pinned lanes. So the lanes are at their smallest rows (22 px; 226 px tall), cards sit 8 px apart, and from the second state on a slot is at least a third of the screen. A card turns current one slot's height below the lanes (never lower than 48 px above the foot of the screen), so the card before it is still clear of them when it hands over, and the lanes let go as the last card reaches them. As built the section is 2,807 px, accepted by Vaibhav on 16 Nov: the two tallest cards (292 and 314 px) are taller than a third of the screen, and the heading block is not trimmed to make up the 57 px. Known limit at 375×667: there the two tallest cards are taller than the space under the lanes and pass under them by up to 47 px; accepted. Tablets keep the 45% line and the taller lanes.
- **The pin's edge.** On phones and tablets the pinned drawing's ground fades out over its bottom 24 px, so cards aren't sliced as they pass under it. The drawing stays pinned only while the cards pass it.
- **How it works.** The stack's height comes from the viewport as the lanes' rows do. Desktop pins the stack, the financier's line and the four relying lines. Tablets pin the stack with its rows beside it, evenly spaced, at most 45% of the screen's height. Phones pin a small stack, with no numbers on its sheets, beside the eight rows. Below desktop the financier's line and the relying lines follow the cards.
- **Fallback.** The ledger register shows instead of the journey with `prefers-reduced-motion: reduce` (decided in CSS, so it holds without script), and when the drawing doesn't fit: Home under about 545 px of height; How it works on laptops under about 590 px and on phones under about 620 px (375 × 667 pins). On How it works the complete stack shows with the ledger.
- **Viewports that must pin, on both pages, in Chromium and WebKit:** 1440×790, 1366×650, 1536×730, 1280×590, 820×1050, 390×664, 375×548 (the browser tests hold these; How it works shows its ledger where the fallback above says so).
- If sticky proves unreliable on iOS Safari, stop and tell Vaibhav; never fall back to scroll-jacking.

## 10 · How the drawings are built

All isometric drawings use one projection. A flat rectangle becomes a sheet with a 2D matrix, so no 3D context is needed:

```css
.iso { transform-origin: 0 0; transform: matrix(0.866, 0.5, -0.866, 0.5, 0, 0); }
```

- **Sheets** (documents, receivables): a white rectangle with the matrix above, a 1 px border, an elevation shadow, and a copy of itself 4 px lower in `rule/default` (rani for the current sheet) for thickness.
- **Blocks** (foundations, layers, steps): three SVG polygons, top face white, left face `petrol/100`, right face `petrol/50`. Kubar Protocol's layer is petrol/900 with `petrol/850` and `petrol/800` sides. A planned item is the same outline dashed `6 5` with no fill.
- **Ground shadow:** one blurred ellipse under each drawing, petrol at 20%. Its svg is `overflow-visible`, or the blur is cut off in a hard line; a browser test holds this on every route.
- **Labels are real text.** Each drawing is a list in the DOM whose items sit beside the art at desktop and under it, in the same order, below that. The art is `aria-hidden`.
- Inline SVG or positioned HTML only. No canvas, no WebGL, no image files.
- **Below desktop** a drawing scales to its column's width and its labels sit under it as a list, unless section 8 says otherwise.
- **Drawing a line on** uses `stroke-dashoffset`. A dashed line can't be drawn with its own dashoffset: reveal it through a mask whose solid copy animates. Show each arrowhead only when its line arrives.

## 11 · Standing rules from the reviews

1. **Laptops get the desktop composition.** From 1024 up a page keeps its 1440 composition: drawings take their column's width instead of a fixed one, or are fitted to it (`src/components/drawings/FitStage.tsx`), so nothing stacks into the tablet layout. Section 7a lists what is re-flowed below 1200, and the two re-flows that run up to 1279.
2. **Tablets and phones keep their drawings.** Where the 768 and 390 frames draw something, it is built as drawn.
3. **References stay whole.** An identifier such as RCV-0003 never breaks at its hyphen; a list of them breaks only between them.
4. **Rani is kept for footnote markers, the current state and errors.** It also marks the one element a drawing is about: the current sheet, the current state, the SDK tile on the layers. Labels are Sans/Fine in the secondary colour at every width. Nothing else gets it; in particular "Kubar holds none", "Planned" and step numbers are in the secondary colour. *Addition, approved by Vaibhav on 16 Nov 2026 for the build after the release:* in a pick, rani may outline what the picked item does not hold, at most two at once.
5. **Home's JavaScript budget is measured without prefetches:** the scripts its own HTML names, compressed and with headers, at 390 and at 1440. Next's prefetches of linked routes are reported separately.
6. **Type floor.** Any sentence is at least 15 px (Sans/Body small). 13 px is for short labels, footnotes and the footer's fine print.
7. **Tap areas.** Every standalone text link has a tap area at least 44 px tall on touch screens, with no change to how it looks.
8. **A hover that shows information has a keyboard and a tap equivalent; a hover that only highlights needs a tap equivalent, not a tab stop.** The record's rows stay in the tab order (they show what each document proves); highlight-only items take `tabindex="-1"`, so a tap focuses them at any width (an iPad is a touch screen at laptop width; About's team cards colour their portrait this way). Do not write `:has(…:hover)` rules: Safari does not restyle them on hover reliably. A script marks the picked item instead (`PickStage`, `data-picked`), and answers hover only for a mouse.
9. **"On this page" names** are the words a visitor sees, never an internal section name.
10. **No "Illustrative" tag anywhere.** The example is marked in plain words: Home's record line starts "An example:", the receivable sheet carries "An example", and How it works' lead says "One illustrative receivable". The timeline's caption keeps "The purchase date is illustrative".
11. **Footnote ¹ once per page** that discusses the venue; every marker ¹ on the page links to it. On Home it is under the foundations; on About under the hero.

## 12 · Motion

Motion shows a change of state and nothing else. The site has three kinds of interaction: the pinned journey (section 9), play once on scroll (`src/components/drawings/PlayOnce.tsx`, `data-phase`) and pick (`src/components/how/PickStage.tsx`, `src/components/sdk/EmbedPicker.tsx`).

- Each drawing has one authored movement. It plays once, when 40% of the drawing is in view, and stays in its end state. A drawing already on screen when the page loads stays drawn.
- The end state is what the server renders: with reduced motion or without script the reader sees the finished drawing, with every word. Nothing on a first screen starts hidden.
- Movements that play as a page loads (the hero drawings) run only where frames are being drawn: an inline script marks `<html data-frames>` on the first frame, and their CSS waits for that mark. In a background tab or a hidden pane the mark never comes and the drawings stay complete. A browser test holds this.
- No fade-up applied to sections in general. No parallax, looping, pulsing or spinning. No count-up numbers.
- Animate `transform` and `opacity` only (and `stroke-dashoffset` for the lines named below).
- No animation library: CSS transitions and keyframes on the tokens, CSS sticky and IntersectionObserver.

| Drawing | On entering view | On hover, focus or tap |
|---|---|---|
| Home hero stack | On page load. Sheets drop in from 24 px above, 01 first and 06 last, 320 ms each, 80 ms apart; each row's hairline and text fade in as its sheet lands. | A row lifts its sheet 14 px to `--elevation-3`. 200 ms. |
| Home scale bar | The big bar grows from the left over 600 ms; the sliver and its caption appear 200 ms after. | None. |
| Foundations (Home, About) | Blocks rise into place from the bottom, 80 ms apart; the dashed venue draws its outline last (480 ms). | At desktop a label draws its block's top edges in rani at 2 px. Below desktop there is no highlight. |
| Who-takes-part map | The two money arrows draw first, then the data arrows, 320 ms each; the return arrow last. | A card dims the arrows that don't touch it to 30%. |
| Kubar Protocol hero | RCV-0003 starts 40 px higher and settles above the box. | None. |
| Programme loop | The ellipse draws once clockwise from step 01 (900 ms); each card fades in as the line reaches it; one small sheet travels the loop once and stops at 05. | The stepper (section 8). With reduced motion the sheet jumps. |
| Loss history | RCV-0003 starts 40 px higher and comes down to its place above the stack over 600 ms. | None. |
| Buyer limit (Cover in your name) | None. | None. |
| How it works hero steps | Blocks rise in order 01 to 08, 60 ms apart; 08 turns petrol last. | None. |
| If a buyer doesn’t pay | Steps 01 to 03 appear in order with their arrows; the fork draws; both branches appear together. | None. |
| Signs map | None. | A card keeps its lines and dims the others. |
| NavDhan layers | Layers settle from 20 px apart to their drawn spacing, bottom first; the SDK tile lands last. | At desktop a label marks its layer. |
| Three zones (About) | None. | None. |
| Raised cards generally | No entrance. | Linked cards rise from `--elevation-2` to `--elevation-3` and move up 2 px, 120 ms. |
| Buttons, links, nav items, rows | — | Colour, ground or underline (1 px → 2 px) only. The focus ring appears at once. |
| Menus, the sheet, tips, answers | Fade in over 200 ms (the menu settles from 8 px above); leave on the exit ease; Escape closes; focus moves in and returns. | — |
| Footnote, arrived at from its marker | Takes the inset ground and rani marker, fading after 2 s; "Back to text" returns focus to the marker. | — |
| Form errors and the error summary | Appear with no transition; the summary takes focus. | — |

With `prefers-reduced-motion: reduce`: every drawing is in its end state, the two journeys show their registers, hover lifts become a colour change, portraits change colour with no transition, smooth scroll is off.

## 13 · Accessibility

Target WCAG 2.2 AA. The browser tests run axe (WCAG 2.0 to 2.2, A and AA) on every route and must stay green; the helper waits until nothing is animating before it measures.

- "Skip to content" is the first focusable element; `#main-content` takes focus.
- One `h1` per page.
- External links add "(opens in a new tab)" to their accessible name and show the up-right arrow.
- Footnote markers are links named "Footnote 1" and so on; each footnote ends with "Back to text".
- Portraits: alt "[Name], [role]". Programme logos: alt is the programme name as written.
- Abbreviations: the first use on each page carries its expansion as a tip that is also available to screen readers (AD bank, DPIIT, EDPMS, FACE, GFTN, GIFT City, GIFT IFIH, IBU, IFSC, IFSCA, ITFS, MeitY, MSME, NIBM, RBI, SME, STPI).
- Colour never carries meaning alone.
- Focus ring: 2 px `--color-focus`, offset 2 px, on every interactive element, never removed.
- Targets: 44 px for primary controls, 24 px minimum for inline links; rule 11.7 for standalone links on touch screens.
- Menus and the sheet: Escape closes, focus is trapped in the sheet while open, the page behind doesn't scroll.
- Text at 200% zoom and at 320 px wide reflows with no sideways scroll.
- Contrast on petrol cards meets AA for the small labels.

## 14 · Performance budget

Mobile, p75: LCP ≤ 2.0 s, INP ≤ 200 ms, CLS ≤ 0.05. Fonts ≤ 300 KB in total with two preloaded (Schibsted Grotesk and Geist Mono; Newsreader loads on demand), `font-display: swap` with metric-matched fallbacks, self-hosted and subset to Latin. Home's own JavaScript ≤ 170 KB compressed, measured as rule 11.5 says. Cloudflare Web Analytics only; no other trackers, no cookies. Images through the Cloudflare Images binding, with explicit width and height.

At release: Lighthouse mobile LCP 0.9 to 1.1 s and CLS 0 on all eight routes; own JavaScript 153.8 to 162.7 KB a route (Home 162.7 KB, accepted by Vaibhav on 15 Nov).

## 15 · Checks

Before each report:

```bash
npm run lint && npm run typecheck && npm test
npm run build && npm run test:e2e      # the browser tests start their own server on 3100
npm run check:js                       # Home's own JavaScript against 170 KB (needs the build)
npm run check:lighthouse               # Lighthouse mobile on all eight routes (needs the build)
npm run check:safari                   # every route at every size, in WebKit
```

The three `check:` scripts live in `scripts/checks/`.

- **`check:safari`** makes a `LOCAL_PREVIEW=1` build in `.next-preview` (no `upgrade-insecure-requests`, so WebKit can load the site over plain http; `.next` is left alone), serves it on 3302 and runs `pass.mjs` in Playwright's own image under podman. Playwright's WebKit build does not start on Fedora, and nothing is installed with `dnf`. The image tag is taken from the installed `@playwright/test`; the repo is mounted with `:Z` for SELinux; the container uses `--network=host`. `ENGINE=chromium` runs the same pass in Chromium. The pass checks, for every route at every size: no script error; no sideways scroll at the top, on the way down and at the bottom; each pinned journey holds from state 3 to state 6 or shows its register; no ground shadow is clipped; every pick in its table answers a tap on touch sizes and a hover or click on the others. It prints one line per size and `ALL CLEAR`. Add a row to its table for every new pick.
- **`check:lighthouse`** runs Lighthouse 13.6.0, mobile, performance only, in the same image, with a full Chrome on a virtual display (headless Chrome on this machine does not tick animation frames and reports `NO_FCP`). `RUNS=5` for five runs a route; the default is three. It fails if a route's median is over LCP 2.0 s or CLS 0.05.
- **`scripts/checks/capture.mjs <base> <dir>`** takes a full-page picture and measurements of every route at every size; `--compare <before> <after>` lists what changed.
- **`scripts/checks/heights.mjs <base>`** gives each page's total height at 390×844 against main (the live site); every report carries it. `scripts/checks/shot.mjs` takes a report's pictures.
- **`check:js`** loads each route in Chromium at 390 and 1440 and applies rule 11.5. It fails if Home is over 170 KB. `e2e/acceptance.spec.ts` applies the same rule.

**The sizes** (`scripts/checks/sizes.mjs`), used for every check: 360×800, 375×667, 390×844, 430×932; 744×1133, 768×1024, 820×1180, 834×1194; 1024×768, 1080×810, 1133×744, 1180×820, 1194×834, 1366×1024, 1376×1032; 1200×800, 1280×800, 1366×768, 1440×900, 1920×1080. The first fifteen are touch screens: phones, tablets upright, and iPads in landscape. Phones first, then tablets, then laptops. The pinned journeys also keep their own viewports (section 9).

Also held by the tests: every word on every page matches `copy/`; no status words except the venue's "Planned"; no "as at" dates, section numbers, labels above headings, italics, rounded corners or stray shadows; no section has a border; redirects; the sitemap; the form's states.

Checked by eye, not by a test: no headline wraps to five lines or more at 1440 or 768 (Home's hero at 390 is five short lines and is accepted).

Tests wait for state (`data-phase`, an attribute, `expect.poll`), never a fixed time. When a check flakes, fix the cause; do not rerun.

A phone on the same Wi-Fi can open the preview build (`LOCAL_PREVIEW=1 npx next start --hostname :: --port 3300`); the firewall port is Vaibhav's to open and close.

## 16 · The contact form, API and Worker

- **Fields** (`copy/06-contact.md`): intent (institution, platform, exporter, investor, press, other), name, email, organisation, role (optional), message (≤ 2,000 characters), website (honeypot). No phone. Server-side limits mirror the client's. `?intent=` preselects.
- **Pipeline:** `src/app/api/contact/route.ts`, `src/lib/contact-queue.ts` and `workers/contact-email/`: the queue, the email Worker, the rate limiter, the honeypot (silently dropped), the origin check and the request-size limit.
- **Routing:** institution, platform and investor messages go to partnerships@kubar.tech; exporter, press and other to outreach@kubar.tech. If the routed address can't be reached the Worker falls back to outreach@.
- **The internal email:** subject "kubar.tech · [intent] · [organisation]"; plain, readable HTML in the site's palette plus a text part; everything escaped.
- **States:** rest, hover, focus, filled, error (a message under the field, and an error summary at the top that takes focus and links to each field), sending ("Sending…", the button keeps its width and is never disabled), sent, server error, rate limit, offline. Native select; no placeholders. No reply-time promise anywhere.
- `next.config.ts` carries the security headers and the content security policy (Cloudflare Web Analytics allowed), cache headers and the redirects. Deployment is `wrangler.jsonc`, `open-next.config.ts`, `worker.mjs` and `docs/deployment.md`.

## 17 · Assets

- **Mark and lock-up:** the master SVGs (Figma components 7:5 and 7:10), colour from `--color-mark`, never rani. Favicon and app icon from the mark.
- **Portraits:** `public/people/`, six 800 × 1000 PNGs on transparent ground.
- **Programme logos:** single ink in a 176 × 64 box (`components.md` lists the nodes). The T-Hub mark is a raster used as a mask.
- **Icons:** the nine Figma icons as inline SVG in currentColor (`src/components/icons/Icon.tsx`). No icon library.
- No shadcn, no animation library. The dev-only Agentation toolbar stays out of production.

## 18 · Release record and open items

- 15 Nov 2026: Vaibhav checked the build on his iPhone and iPad; nothing to change. Released to production from `main`.
- After the release, on `main`: the contact Worker logs the send binding's error; the content security policy allows Cloudflare Web Analytics; partnerships@ is allowed as a destination.
- Open: a vector of the T-Hub mark.

## Appendix · Where the old sections went

| Old file and section | Here |
|---|---|
| HANDOFF 1 Ground rules | 1 |
| HANDOFF 2 Sources of truth | 2 |
| HANDOFF 3 Figma | 3 |
| HANDOFF 4 What changed after the sign-offs | 5, 6, 7, 8 |
| HANDOFF 5 Routes, redirects and metadata | 4 |
| HANDOFF 6 Layout and responsive behaviour | 7 |
| HANDOFF 7 Motion | 12 |
| HANDOFF 8 Accessibility | 13 |
| HANDOFF 9 What carries over, the form's contract | 16 |
| HANDOFF 10 Assets | 17 |
| HANDOFF 11 Performance budget | 14 |
| HANDOFF 12 Build order, 13 Acceptance checks | 15 |
| HANDOFF 14 Open items | 18 (all but one closed) |
| REDRAW 1 The rules behind the redraw | 5 |
| REDRAW 2 Tokens | 6 |
| REDRAW 3 Fixes, 3a The pinned story | 8, 9 |
| REDRAW 4 How to build the isometric drawings | 10 |
| REDRAW 5 Page by page | 8 |
| REDRAW 6 Copy cut or moved, 10 Copy changes | `copy/` (already applied), 8, rules 11.10 and 11.11 |
| REDRAW 7 Motion | 12 |
| REDRAW 8 Checks | 15 |
| REDRAW 9 Answers of 14 Nov | 5 (rule 6), 9, 10, 11.11, 15 |
| REDRAW 11 Review of build step 4 | 11.1 to 11.5, same numbers |
| REDRAW 12 More drawn moments | 7 ("On this page"), 8 |
| REDRAW 13 Audit changes | 8, 11.6, 11.7 |
| REDRAW 14 Review of 95868f5 | 8, 9, 15 |
| REDRAW 15 NavDhan SDK, 16 About and Contact | 8, 11.9 |
| REDRAW 17 Final pass | 8, 14, 15 |
| REDRAW 18 Device check and release | 18 |
