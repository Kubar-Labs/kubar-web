<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Quick Commands (npm)

- Dev: `npm run dev`
- Lint: `npm run lint` (ESLint v9)
- Typecheck: `npm run typecheck`
- Test: `npm test` (Vitest)
- Browser test: build first, then `npm run test:e2e` (Playwright)
- Build: `npm run build`
- Prod: `npm run start`

## Project Shape

- Single Next.js app using App Router under `src/app/`.
- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).

## i18n (next-intl)

- `next-intl` is wired via the Next plugin: `createNextIntlPlugin("./src/i18n/request.ts")` in `next.config.ts`.
- Locale is currently hardcoded to `en` in `src/i18n/request.ts`.
- Translations are JSON, loaded from `messages/en.json` by `src/i18n/request.ts`.
- Root provider is in `src/app/layout.tsx` (`RouteIntlProvider`, passing only the namespaces client components read).

## The rebuild

- `docs/rebuild/HANDOFF.md` is the brief; `docs/rebuild/copy/` holds the signed-off words. Use them exactly.

## Styling / UI Stack

- Tailwind CSS v4 via `src/app/globals.css`, which imports the design tokens (`src/app/tokens.css`, a copy of `docs/rebuild/tokens/tokens.css`) and defines one utility per text style (`t-display`, `t-h2`, …). No shadcn, no icon library: icons are `src/components/icons/Icon.tsx`.
- Utility `cn()` lives at `src/lib/utils.ts`.

## Notable Toolchain Quirks

- React Compiler is enabled (`reactCompiler: true` in `next.config.ts`). Avoid introducing patterns that rely on memoization for correctness.
- Production builds intentionally use webpack (`next build --webpack`) and local font files so validation does not depend on downloading Google Fonts.
