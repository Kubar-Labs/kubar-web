# Component inventory

From the Figma file (pFO3DEpqVzWCJdPghuq8nU), pages C1 to C6, 13 Nov 2026. Node IDs work with the Figma MCP tools (get_design_context, get_screenshot) and as `?node-id=` in links (replace ":" with "-").

**Read this first.** Many component descriptions in Figma were written before option B (4–12 Nov) and still mention caps labels, italics, greyscale portraits, pictograms, the square state meter or status labels. Where a description disagrees with HANDOFF.md ("What changed after sign-off"), HANDOFF.md wins. Variant names are still accurate.

Each component has a Desktop variant and a Mobile variant. Tablet (768) uses the Mobile structure at eight columns with Tablet type sizes; nothing has a separate tablet variant.

## Build

### C1 · Primitives (Figma page 20:5)
| Node | Component | Variants and properties | Notes |
|---|---|---|---|
| 48:89 | Button | Style Filled/Outline; Size 48/44; State Rest/Hover/Pressed/Focus/Sending | One filled button per view. "Sending…" keeps the button's width. No disabled state (the form validates on submit). Outline has no use in the copy yet. |
| 52:113 | Link | Kind Arrow/Anchor/External/Plain; Size Large/Regular; State Rest/Hover/Focus | Ink, underlined 1 px at rest, 2 px on hover, no colour change. External links add "(opens in a new tab)" to the accessible name and show the up-right arrow. Targets at least 24 px. |
| 52:140 | Disclosure link | Open No/Yes; State | A button styled as a link with a plus/minus; opens the panel below (e.g. "What the labels mean" — no longer used; Questions uses Question row). |
| 60:54 | Footnote marker | State Rest/Hover/Focus | Rani superscript; links to its footnote; accessible name "Footnote 1". |
| 60:67 | Footnote | State Rest/Target | Sans/Fine, hanging marker, "Back to text" link at the end. Target state (arrived at from the marker): inset ground and the rani current marker. |
| 60:82 | Illustrative tag | State Rest/Hover/Focus/Expanded | Plain word "Illustrative" in Sans/Fine, rani, dotted underline. A button: opens "An example receivable, not a real transaction." in place. |
| 60:45 | Section label | Label | Only where a section has no heading of its own ("Direct" on Contact; "Technology programmes, grants and credits"). Sentence case, no number. Never above a heading. |
| 9:2 … 11:18 | Icons | Arrow right, Arrow up-right, Arrow down, Plus, Minus, Check, Close, Alert, Chevron down | Export as SVG; stroke in currentColor. |
| 7:5, 7:10 | Kubar mark, Kubar lock-up | — | Use the master SVGs (kubar-mark-*.svg, kubar-lockup-*.svg, sent 1 Nov; source of truth is these two components). Colour from --color-mark. Never rani. |

### C2 · Registers (Figma page 20:6)
| Node | Component | Variants and properties | Notes |
|---|---|---|---|
| 71:487 | Record | Layout | RCV-0001: header (code, Illustrative), Serif/Record summary, document rows, the Proves line, the state counter. |
| 71:200 | Record row | Layout; State Rest/Hover/Focus/Current | Number, document, source, status word. The Pictogram property is unused: no pictograms in rows. Hover/focus/tap a row: the Proves line shows what that document proves (the line keeps its height so nothing moves). Current: inset ground plus the angled rani marker. |
| 71:79 | State meter | Current 01–07 | Now a text counter in Mono/Label: "05 of 08". Not squares. |
| 72:554, 72:309 | Ledger, Ledger row | Layout; State Rest/Current/Planned | The eight states as a register. Used at 768 and 390, and on desktop when reduced motion is on, in place of the lanes and story panel. |
| 71:15 | Path cell | Kind Active/Planned/None | The data-path and money-path cells in the ledger. |
| 73:475, 73:476 | Route row, Route rows | State | The hero's two routes: whole row is one link, ruled. |
| 73:766, 73:541 | Who takes part, Party row | Layout; Link Yes/No | Party name, role, link. No pictograms and no Kubar mark in these rows (Mark property unused). |
| 76:684, 76:651 | Standing, Standing row | Layout | Four rows: Sandbox, Membership, Award, Award. |
| 76:858, 76:713 | Contact routes, Contact route row | Page Home/Contact; Layout | Home has two columns; Contact adds "Goes to". |
| 135:1896 | Numbered row | Layout Desktop/Mobile/Five columns | Short numbered registers (the venue's three things, the SDK rules). |
| 141:1902 | Three-column row | Layout | Element/From/Checked against; Party/Holds/Doesn't hold; Party/Does/Signs. |

### C3 · Navigation (Figma page 20:7)
| Node | Component | Notes |
|---|---|---|
| 87:142 | Header | Layout; State Default/Products open/Menu open. Lock-up links home (mark 28 px desktop, 24 px mobile). Fixed on scroll on every page (changed in option B; the component description says it scrolls — ignore that). Double rule under it. |
| 85:44 | Nav item | Kind Link/Menu/External; State Rest/Hover/Focus/Current/Open. Not underlined at rest, 1 px on hover, 2 px when current. 44 px target. |
| 85:56, 85:55 | Products menu, Menu item | Opens on click only (not hover). Raised surface, control border. Items: Kubar Protocol, NavDhan SDK, each with its one-line descriptor. |
| 85:77 | Menu button | "Menu"/"Close", 64 × 44, mobile and tablet. Opens a full-screen sheet of ruled rows with "Talk to us" (48 px) at the foot. |
| 85:78 | Skip link | "Skip to content", first focusable element on every page. |
| 88:158 | Footer | Opened by a 2 px strong rule; lock-up; four link groups; the role, entity, marks and copyright lines. |

### C4 · Content blocks (Figma page 20:8)
| Node | Component | Notes |
|---|---|---|
| 91:329 | Page hero | Every page but Home. Kicker in Mono/Label ("Kubar Protocol · For banks, finance companies, insurers and funds") stays. The Status property is off everywhere. |
| 91:288 | Section head | At desktop, heading (400 wide) with the lead beside it (680); at 768/390 stacked. No section label above it. |
| 92:332 | Figure pair | The gap's two figures, each under a 2 px strong rule, plus the drawn-to-scale bar. |
| 92:370 | Band | Petrol ground, one Serif/Line sentence (roman, not italic), optional link. |
| 118:1470 | Lanes diagram | State 01–08. Six party columns, Kubar the one filled column; data path dashed through Kubar, money path solid and never touching Kubar. Desktop only. |
| 119:1280 | Story panel | Page Home/How it works; Kind Current/Planned. Beside the lanes in the pinned story. |
| 120:1167 | Money path | Kubar Protocol and How it works. Four parties. |
| 121:1171 | Exchange comparison | Home: TReDS, IEX, GIFT City · ITFS. |
| 121:1424 | Foundations stack | Context Home/About. Ruled rows, bottom-up arrow on the left at desktop; no boxes, no squares, no status words except the venue's "Planned". |
| 122:1272 | Programme loop | Kubar Protocol "How a programme runs.": two ruled registers side by side (desktop variant rebuilt 12 Nov); stacked on mobile. No boxes or arrows. |
| 123:1184 | Money timeline | Kubar Protocol "What you buy": day axis 0–75, drawn to scale; the deferred purchase price is a dotted box with no figure. |
| 127:2464 | Evidence stack | How it works: eight document cards on raised surfaces locking into the record; the last card open. |
| 130:2584 | Evidence sources | Kubar Protocol: ten elements, dashed stubs into one spine, one arrow to the record. Desktop only; the register below it carries the same content at all sizes. |
| 133:2422 | If a buyer doesn't pay | Six-row ruled register with a right-hand branch column (No dispute / A dispute in rani) and a closing sentence. Rebuilt 4 Nov. |
| 136:2398 | Venue register | "Planned" with footnote ¹, then three numbered rows. |
| 138:2455 | Platform lanes | NavDhan SDK, desktop only. |
| 139:2456 | Layer stack | NavDhan SDK. Kubar Protocol the filled layer. |
| 140:2523 | Embed sketch | NavDhan SDK hero; a schematic, no price figures. |
| 93:384, 93:317 | Questions, Question row | Disclosure list; the question is the button, the answer opens in place. |
| 93:514, 93:391 | Terms, Term row | The glossary. |
| 95:438 | Abbreviation | First use per page carries its expansion (tooltip on hover and focus, and available to screen readers). |
| 20:13 | Portrait | 4:5, square corners. In colour at rest (the description says greyscale — ignore). Hover: no colour change; see Motion. |
| 23:64 | Person card | Compact (Home: portrait, name, role; the card links to LinkedIn) and Full (About: plus the line and a LinkedIn link). |
| 95:484, 95:445 | Advisers, Adviser row | About. |
| 165:3536 | Programme entry | Logo (176 × 64 box), name, kind. Two lists of three at desktop. |
| 41:20 | Technology entry | Logo with its name under it; seven across at desktop, two per row at 390. |

Programme logos (each a component, 176 × 64, single ink from --color-partner-mark; export as SVG where the source is vector, PNG at 2× otherwise): GIFT IFIH 35:15, BharatNetra (GFTN) 35:18, STPI FinGlobe 35:49, MeitY Startup Hub 35:52, Pusa Krishi 35:55, T-Hub 199:17872 (a raster from t-hub.co used as an alpha mask over ink; export at 2× or ask for a vector), Google 38:14, NVIDIA 36:21, Perplexity 38:22, OpenAI 36:14, Microsoft 38:33, Intel 36:17, ElevenLabs 38:40, Amplitude 39:11, Polkadot Blockchain Academy 38:11, Uniswap 39:24, Sarvam 38:54, Cloudflare 39:42, Claude 39:56, MongoDB 39:60. The repo's public/logos has some of these as PNG/SVG already; prefer the Figma components, which are the reviewed versions.

### C5 · Forms (Figma page 20:9)
| Node | Component | Notes |
|---|---|---|
| 152:119 | Select | "I'm writing as". States Rest/Focus/Open/Error. Use a native select styled to match, not a custom listbox. |
| 151:73 | Text field | Label above, optional help, error below. States Rest/Focus/Error. No placeholders. |
| 151:154 | Message field | 160 px tall textarea, live "N of 2,000" count. |
| 152:157 | Error summary | Above the form after a failed submit; receives focus; each item links to its field. |
| 152:197 | Form message | Kind Success/Server error/Rate limit/Offline. Words in copy deck 4.7 (Notion); the Figma variants carry them. |

### C6 · System pages (Figma page 20:10)
| Node | Component | Notes |
|---|---|---|
| 156:60 | System page | Kind 404/Error. |
| 156:67 | Legal section | Numbered H4 heading and body at 628. |
| 156:165 | Contents | Sticky in the left three columns on desktop; under the title on mobile. |

## Do not build

These remain in the Figma file for the record but are not used on any page after 12 Nov:
- 61:57 Status label and 77:177 Status legend (status words were removed from the site; the venue's "Planned" is plain text in Mono/State).
- 78:1073 Where we are, 79:1123 Where we are · line, 78:793 Status row (the "Where we are" and "Where it stands" sections are removed).
- Pictogram/* components (removed from rows and party boxes; the idiom board keeps them for reference).
- Programme logo/InfoEdge Centre for Entrepreneurship 36:11 (replaced by T-Hub).
