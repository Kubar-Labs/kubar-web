#!/usr/bin/env bash
# Runs inside Playwright's image (see lighthouse.sh).
set -euo pipefail
BASE="$1"; shift
ROUTES=("$@")
if [ ${#ROUTES[@]} -eq 0 ]; then
  ROUTES=(/ /products/kubar-protocol /products/navdhan-sdk /how-it-works /about /contact /legal/privacy /legal/terms)
fi
CHROME_PATH="$(find /ms-playwright -type f -name chrome -path '*chromium-*' | head -1)"
export CHROME_PATH
OUT=.checks/lighthouse
rm -f "$OUT"/*.json
for route in "${ROUTES[@]}"; do
  name="$(echo "$route" | sed 's#^/##; s#/#_#g')"; name="${name:-home}"
  for run in $(seq 1 "${RUNS:-3}"); do
    xvfb-run -a npx --yes lighthouse@13.6.0 "$BASE$route" --quiet --only-categories=performance --form-factor=mobile \
      --output=json --output-path="$OUT/$name.$run.json" --chrome-flags="--no-sandbox --disable-dev-shm-usage" >/dev/null 2>&1 \
      || echo "lighthouse failed: $route run $run" >&2
  done
done
