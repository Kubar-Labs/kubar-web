#!/usr/bin/env bash
# The Safari pass: every route at every size in WebKit, inside Playwright's
# own image under podman (Playwright's WebKit build does not start on Fedora).
#
#   npm run check:safari                 every route, every size, WebKit
#   ENGINE=chromium npm run check:safari the same pass in Chromium
#   npm run check:safari -- 390x844 1180x820     only these sizes
#   SKIP_BUILD=1 npm run check:safari    reuse the last preview build
#
# It makes a LOCAL_PREVIEW build in .next-preview (no upgrade-insecure-requests,
# so WebKit can load the site over plain http) and leaves .next alone.
set -euo pipefail
source "$(dirname "$0")/lib.sh"

PORT="${PORT:-3302}"
if [ -z "${SKIP_BUILD:-}" ]; then
  LOCAL_PREVIEW=1 npx next build --webpack
fi
serve "$PORT" preview

# :Z relabels the mount for SELinux; --network=host reaches the server on this machine.
podman run --rm --network=host -e ENGINE="${ENGINE:-webkit}" -v "$ROOT":/work:Z -w /work \
  "$PLAYWRIGHT_IMAGE" node scripts/checks/pass.mjs "http://127.0.0.1:$PORT" "$@"
