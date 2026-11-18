#!/usr/bin/env bash
# Home's own JavaScript against its 170 KB budget, on the normal build.
#   npm run build && npm run check:js
set -euo pipefail
source "$(dirname "$0")/lib.sh"

PORT="${PORT:-3301}"
[ -d .next ] || { echo "No build in .next: run npm run build first." >&2; exit 1; }
serve "$PORT"
node scripts/checks/js-budget.mjs "http://127.0.0.1:$PORT" "$@"
