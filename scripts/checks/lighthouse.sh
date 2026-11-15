#!/usr/bin/env bash
# Lighthouse, mobile, on all eight routes, against the budget (LCP 2.0 s,
# CLS 0.05). Runs a full Chrome on a virtual display inside Playwright's image:
# headless Chrome on this machine does not tick animation frames, which gives
# NO_FCP.
#
#   npm run build && npm run check:lighthouse            three runs a route
#   RUNS=5 npm run check:lighthouse                      five runs a route
#   npm run check:lighthouse -- / /how-it-works          only these routes
set -euo pipefail
source "$(dirname "$0")/lib.sh"

PORT="${PORT:-3301}"
[ -d .next ] || { echo "No build in .next: run npm run build first." >&2; exit 1; }
serve "$PORT"

mkdir -p .checks/lighthouse
# A named volume keeps the npm cache, so Lighthouse is downloaded once.
podman run --rm --network=host -e RUNS="${RUNS:-3}" -v "$ROOT":/work:Z -v kubar-checks-npm:/root/.npm -w /work \
  "$PLAYWRIGHT_IMAGE" bash scripts/checks/lighthouse-in-container.sh "http://127.0.0.1:$PORT" "$@"
node scripts/checks/lighthouse-summary.mjs .checks/lighthouse
