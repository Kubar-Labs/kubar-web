# Handover for the next session (15 Nov 2026)

> 16 Nov 2026: written before the release. The site is live from `main`; the spec is `SPEC.md` (the two files this note cites are in `archive/`); the check scripts are back, in `scripts/checks/`, with `npm run check:safari`, `check:lighthouse` and `check:js` (SPEC.md, section 15). The notes on this machine and on flaky checks still hold.

State: branch `rebuild-2026`, steps 1 to 8 built, last code commit `92e17bf`. 74 unit and 159 e2e tests pass. Nothing is deployed; `main` and Cloudflare are untouched. Spec: `REDRAW-2026-11-14.md` (sections 1 to 17), copy in `copy/`, budget in `HANDOFF.md` section 11. No further build step is authorised; wait for Vaibhav.

## Commands

Run from `/home/yash/kubar-web-rebuild`. `S` is any scratch directory. The dev server stays on 3200 (`npx next dev -p 3200`); e2e starts its own server on 3100 from the normal build.

**Before each check-in:** `npm run lint`, `npm run typecheck`, `npm test`. Before a final one also `npm run build` and `npm run test:e2e`.

**LOCAL_PREVIEW build** (drops `upgrade-insecure-requests`, so WebKit and phones can open it over http). Turbopack will not build in a copied directory, so build in the repo, copy `.next` out, then rebuild normally:

```bash
LOCAL_PREVIEW=1 npm run build
D=$S/preview; mkdir -p $D && cp -r package.json next.config.ts public messages $D/ && ln -sfn /home/yash/kubar-web-rebuild/node_modules $D/node_modules
rsync -a --delete --exclude dev .next/ $D/.next/
npm run build   # always, or e2e and localhost:3301 serve the preview build
```

**WebKit pass** (serve the preview on 3302, run Playwright's image; never `sudo dnf`):

```bash
(cd $D && npx next start -H 127.0.0.1 -p 3302 &)
podman run --rm --network=host -e PW=/work/node_modules/playwright/index.mjs -e ENGINE=webkit \
  -v $PWD:/work:Z -v $S/scripts:/scripts:Z -w /work \
  mcr.microsoft.com/playwright:v1.62.1-noble node /scripts/final.mjs http://127.0.0.1:3302
```

`ENGINE=chromium` gives the Chromium pass. The image tag must match `@playwright/test`. Both passes together take about ten minutes; run them in the background.

**Lighthouse** (mobile, normal build served with `npx next start -H 127.0.0.1 -p 3301`):

```bash
podman run --rm --network=host -v $S/scripts:/scripts:Z -v $S/lhc:/out:Z \
  mcr.microsoft.com/playwright:v1.62.1-noble bash /scripts/lhc.sh http://127.0.0.1:3301/ home 5
```

`lhc.sh <url> <name> <runs>` runs, inside the container, `CHROME_PATH=<the image's chromium> xvfb-run -a npx --yes lighthouse@13.6.0 <url> --only-categories=performance --form-factor=mobile --output=json --chrome-flags="--no-sandbox --disable-dev-shm-usage"` and prints score, LCP, CLS and TBT per run. Last figures: Home LCP 1.1 s, CLS 0; the other routes 0.9 to 1.1 s.

**JavaScript budget:** `node $S/scripts/js-budget.mjs http://127.0.0.1:3301 /`. It loads the page in Chromium at 390 and 1440 with CDP `Network.enable`, sums `encodedDataLength` of scripts, and counts as the page's own only scripts whose path appears in the page's HTML; anything else, or anything sent with a prefetch header, is reported apart. `e2e/acceptance.spec.ts` applies the same rule. Home is 162.7 KB at both widths (budget 170).

**Phone preview on port 3300** (same LOCAL_PREVIEW copy):

```bash
(cd $D && npx next start --hostname :: --port 3300 &)
sudo firewall-cmd --zone=FedoraWorkstation --add-port=3300/tcp      # runtime only; ask Vaibhav first, he runs it
sudo firewall-cmd --zone=FedoraWorkstation --remove-port=3300/tcp   # when he says the check is done
```

The phone opens `http://fedora.local:3300`, or the laptop's global IPv6 address in brackets (`ip -6 -o addr show scope global`). The port is closed now and the server is stopped.

## The 13 sizes

390×844, 375×667, 768×1024, 744×1133, 820×1180, 834×1194, 1180×820, 1194×834, 1376×1032, 1200×800, 1280×800, 1366×768, 1440×900. Touch below 1200 and at 1376; mobile below 744. Phones first, then tablets in WebKit, then laptops.

## Scratch scripts (gone; rewrite as needed)

They lived in the session scratchpad under `/tmp/claude-1000/`, which a reboot clears. All import Playwright from the repo's `node_modules` (`PW` env inside the container).

- `final.mjs <base> [sizes]`: the pass above. Every route at every size: sideways scroll at top and bottom; both pinned stories hold from state 3 to 6 (or report the ledger); a tap or hover for the record row, Home's map, foundations, evidence rows, the loop, the stack, the signs map, the SDK picker and layers, About's blocks. Prints one line per size and `ALL CLEAR`.
- `lhc.sh`, `js-budget.mjs`: as above.
- `shot.mjs <path> <name> <outdir> <widths> [selector]`: reduced-motion screenshots from the dev server, of a section or in viewport slices.
- `typefloor.mjs`: lists text under 15 px that reads as a sentence.
- `step7.mjs`, `sdkaudit.mjs`, `idxchk.mjs`: per-step WebKit checks of About, Contact, NavDhan SDK and the On this page button; `final.mjs` covers them.

## Tests and checks that flaked

- **Home story and On this page, axe contrast:** axe measured text mid-fade. Fix: `expectNoAxeViolations` in `e2e/site.spec.ts` polls until `document.getAnimations()` has none running.
- **Lighthouse `NO_FCP`:** headless Chrome on this machine does not tick animation frames. Fix: full Chrome under `xvfb-run` in the container.
- **Tests with fixed waits:** same cause. Fix: wait for state (`data-phase`, an attribute, `expect.poll`), never a timeout. Vaibhav's rule: fix the cause, do not rerun.
- **Home's map tap in WebKit below 768:** not a flake. `:has(…:hover)` is not restyled reliably in Safari; the map now uses `PickStage` (`data-picked`), as the evidence stack and signs map do. Do not write new `:has(:hover)` rules.
- **An empty workflow result:** once every agent had failed on a usage limit. Check failures before trusting "no findings".

## This machine

- Fedora 45, SELinux on: podman mounts need `:Z`, and `--network=host` to reach local servers. The login shell is fish; commands run in bash.
- WebKit cannot hydrate the dev server (the HMR websocket fails), so WebKit checks need a production build.
- Playwright's tap fires `mouseleave`; `PickStage` answers hover only for `pointerType === "mouse"`.
- The session's working directory is `/home/yash/claudedesktop`; `cd` into the repo in every command.
- After any rebuild, restart whatever serves `.next` (find the PID with `ss -ltnp`).

## Open

1. **Vaibhav's check on his iPhone and iPad.** Needs the port 3300 preview above and his yes on the firewall. He reports anything that reads badly.
2. **Counsel's review of the legal pages.** The dates (15 November 2026) and the 24 months retention are set; `copy/07-system-and-legal.md` line 89 still carries one OPEN note on the status-label sentence.
3. Home's JS went from 160.7 to 162.7 KB with the map fix; Vaibhav has not yet said whether that is acceptable.
