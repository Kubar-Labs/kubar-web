# Shared by the check scripts: serve a production build on a local port.
# Source it; never run it.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

# The container image must match the installed @playwright/test exactly.
PLAYWRIGHT_IMAGE="mcr.microsoft.com/playwright:v$(node -p "require('@playwright/test/package.json').version")-noble"

SERVER_PID=""
stop_server() {
  if [ -n "$SERVER_PID" ]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
    SERVER_PID=""
  fi
}
trap stop_server EXIT

# serve <port> [preview]: start `next start` unless something already answers on the port.
serve() {
  local port="$1" preview="${2:-}"
  if curl -fsS -o /dev/null "http://127.0.0.1:$port/" 2>/dev/null; then
    echo "Using the server already on port $port."
    return
  fi
  if [ "$preview" = "preview" ]; then
    LOCAL_PREVIEW=1 npx next start -H 127.0.0.1 -p "$port" >/dev/null 2>&1 &
  else
    npx next start -H 127.0.0.1 -p "$port" >/dev/null 2>&1 &
  fi
  SERVER_PID=$!
  for _ in $(seq 1 60); do
    curl -fsS -o /dev/null "http://127.0.0.1:$port/" 2>/dev/null && return
    sleep 0.5
  done
  echo "The server on port $port did not start." >&2
  exit 1
}
