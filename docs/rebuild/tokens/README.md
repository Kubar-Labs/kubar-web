# Tokens

`tokens.json` and `tokens.css` are exported from the Figma variables and text styles (file pFO3DEpqVzWCJdPghuq8nU) as they stood on 13 Nov 2026, after option B. The CSS custom-property names are the WEB code syntax set on each Figma variable, so `var(--color-ink)` in code is `color/text/primary` in Figma.

Use the tokens, not raw values. Wire them into Tailwind 4 with `@theme` in `src/app/globals.css` (the repo already uses Tailwind 4 and shadcn's CSS variables; replace the old palette rather than layering on top of it).

## Colour

Two modes. **Paper** is the default for every page. **Petrol** is only the band (the one full-width dark section on Home and About): set `data-ground="petrol"` on the band and the semantic tokens swap. There is no dark theme for the site.

Rules that come with the palette:
- Rani (`--color-accent`) marks what a reader must not miss: footnote markers, the current state, "Illustrative", errors, the current-row marker. Never a button, never decoration, never the logo.
- Every corner is square (`--radius-none`). No shadows anywhere.
- Hairlines (`--color-rule`) are decorative; a control's boundary is always `--color-rule-control`.

## Type

Three families, self-hosted as woff2 (production builds use local font files; see AGENTS.md):
- **Newsreader** (serif): the display headline, the band's line, the record's summary. Regular only. Check optical sizing in the browser (Newsreader has an `opsz` axis; the display should use the large optical size).
- **Schibsted Grotesk** (sans): headings (Medium 500), body (Regular 400), UI (Medium 500).
- **Geist Mono** (mono): labels, tags, codes, figures, status words. Regular and Medium. Already in `src/app/fonts/geist-mono-latin.woff2`.

Budget: fonts 300 KB or less in total, two preloaded (Newsreader for the display, Schibsted Grotesk Regular). Subset to Latin.

Text styles, and the short tags used in `../copy/*.md`:

| Tag | Figma style | Family, weight | Size / line height (desktop · tablet · mobile) | Tracking, case |
|---|---|---|---|---|
| Display | Serif/Display | Newsreader 400 | 56/60 · 64/68 · 46/50 | -0.02em |
| H2 | Heading/H2 | Schibsted 500 | 44/50 · 36/42 · 30/36 | -0.01em |
| H3 | Heading/H3 | Schibsted 500 | 28/34 · 26/32 · 24/30 | -0.005em |
| H4 | Heading/H4 | Schibsted 500 | 22/28 · 20/26 · 19/25 | 0 |
| Line | Serif/Line | Newsreader 400 | 48/58 · 36/44 · 28/36 | 0, roman |
| Lead | Sans/Lead | Schibsted 400 | 30/40 · 26/36 · 22/30 | 0 |
| Figure | Mono/Figure | Geist Mono 400 | 56/60 · 46/50 · 36/40 | -0.02em, tabular-nums |
| Record | Serif/Record | Newsreader 400 | 19/27 · 18/26 · 17/25 | 0 |
| BodyL | Sans/Body large | Schibsted 400 | 20/30 · 19/29 · 18/28 | 0 |
| Body | Sans/Body | Schibsted 400 | 17/26 · 17/26 · 16/25 | 0 |
| BodyS | Sans/Body small | Schibsted 400 | 15/22 | 0 |
| Fine | Sans/Fine | Schibsted 400 | 13/20 | 0 |
| UIL | Sans/UI large | Schibsted 500 | 18/24 · 18/24 · 17/24 | 0 |
| UI | Sans/UI | Schibsted 500 | 15/20 | 0 |
| UIS | Sans/UI small | Schibsted 500 | 13/18 | 0 |
| Label | Mono/Label | Geist Mono 400 | 13/20 | 0, sentence case |
| Tag | Mono/Tag | Geist Mono 500 | 11/16 | 0, sentence case |
| Code | Mono/Code | Geist Mono 400 | 13/20 | 0.02em |
| State | Mono/State | Geist Mono 500 | 13/20 | 0.06em, UPPERCASE |

"mixed" in the copy files means a line with a link or a second style inside it.

No italics anywhere. Mono capitals only for State (status words in the record and ledger). Labels never carry section numbers and never sit above a heading.

**Open: tablet display size.** The display token is 56 at desktop (reduced for the two-column hero on 4 Nov) but still 64 at tablet, so the headline is larger on a tablet than on a laptop. Proposal: tablet 48/52. Confirm with Vaibhav before building; tokens.css carries the Figma values (64/68) until then.

## Layout

| Token | Desktop | Tablet | Mobile |
|---|---|---|---|
| --page-margin | 80 | 40 | 20 |
| --grid-gutter | 24 | 24 | 16 |
| --grid-columns | 12 | 8 | 4 |
| --content-max | 1280 | 688 | 350 |
| --measure | 640 | 640 | 350 |
| --section-space | 72 | 56 | 48 |
| --band-space | 128 | 96 | 72 |

`--section-space` is the padding above and below every section after option B; sections are joined by one hairline (`--rule-hairline` in `--color-rule-strong`). In Figma the variable `layout/section-space` still holds the old 128/96/72, which now applies only to the band; tokens.css splits them into two names.

Breakpoints are not in Figma (the frames are 1440, 768 and 390). Proposed: mobile below 768, tablet 768 to 1199 (the mobile structure at eight columns), desktop from 1200 (twelve columns, content up to 1280, centred). Check the layouts at 1200, 1280 and 1440, and at 360 and 414 on the small side.

## Motion

Four durations and two curves; nothing else.

| Token | Value | For |
|---|---|---|
| --duration-hover | 120 ms | Colour and underline on hover and press |
| --duration-disclose | 200 ms | A menu, tip, answer or note opening |
| --duration-write | 320 ms | A row or card writing in; the next follows 80 ms later |
| --duration-scene | 600 ms | One step of a pinned story; the scale bar drawing in |
| --ease-standard | cubic-bezier(0.2, 0, 0, 1) | Arrivals and state changes |
| --ease-exit | cubic-bezier(0.4, 0, 1, 1) | Things leaving |

With `prefers-reduced-motion: reduce` every duration is 0 (tokens.css does this).
