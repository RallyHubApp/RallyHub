#!/usr/bin/env bash
set -u

APP_ROOT="${APP_ROOT:-/app}"
PORT="${PORT:-5173}"
RESULT_DIR="$APP_ROOT/tmp/mobile-test-results"
mkdir -p "$RESULT_DIR"

cd "$APP_ROOT" || exit 2

log(){ printf '[mobile-test] %s\n' "$*"; }

# 1) Make Playwright self-healing on fresh Base44 sandboxes.
if ! npx playwright --version >/dev/null 2>&1; then
  log "Playwright package unavailable"
  exit 3
fi

CHROME_BIN="$(find /root/.cache/ms-playwright -type f \( -name chrome-headless-shell -o -name chrome \) 2>/dev/null | head -n 1 || true)"
if [ -z "$CHROME_BIN" ]; then
  log "Chromium missing; installing once for this sandbox"
  npx playwright install chromium >/tmp/rallyhub-playwright-install.log 2>&1 || {
    cat /tmp/rallyhub-playwright-install.log
    exit 4
  }
  CHROME_BIN="$(find /root/.cache/ms-playwright -type f \( -name chrome-headless-shell -o -name chrome \) 2>/dev/null | head -n 1 || true)"
fi

# If Chromium exists but Linux libs are missing, install deps only then.
if [ -n "$CHROME_BIN" ] && ldd "$CHROME_BIN" 2>/dev/null | grep -q 'not found'; then
  log "Chromium system libraries missing; installing dependencies once for this sandbox"
  npx playwright install-deps chromium >/tmp/rallyhub-playwright-deps.log 2>&1 || {
    cat /tmp/rallyhub-playwright-deps.log
    exit 5
  }
fi

# 2) Remove stale dev server rather than letting Playwright reuse a half-dead one.
if command -v fuser >/dev/null 2>&1; then
  fuser -k "${PORT}/tcp" >/dev/null 2>&1 || true
elif command -v pkill >/dev/null 2>&1; then
  pkill -f "vite.*${PORT}" >/dev/null 2>&1 || true
fi

# 3) Start a clean Vite server and wait for it to answer.
log "Starting clean Vite server"
nohup npm run dev -- --host 127.0.0.1 --port "$PORT" >"$RESULT_DIR/vite.log" 2>&1 &
VITE_PID=$!
trap 'kill "$VITE_PID" >/dev/null 2>&1 || true' EXIT

READY=0
for _ in $(seq 1 40); do
  if curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then READY=1; break; fi
  sleep 0.5
done
if [ "$READY" -ne 1 ]; then
  log "Vite did not become ready"
  tail -n 80 "$RESULT_DIR/vite.log" || true
  exit 6
fi

# 4) Run tests in small batches so one slow route cannot consume the whole tool window.
run_batch(){
  local name="$1"; shift
  log "Running $name"
  if npx playwright test "$@" --reporter=line >"$RESULT_DIR/${name}.log" 2>&1; then
    echo "PASS $name" >>"$RESULT_DIR/summary.txt"
    return 0
  else
    echo "FAIL $name" >>"$RESULT_DIR/summary.txt"
    tail -n 120 "$RESULT_DIR/${name}.log"
    return 1
  fi
}

: >"$RESULT_DIR/summary.txt"
FAIL=0
run_batch shell e2e/app-shell-mobile-regression.spec.mjs || FAIL=1
run_batch kotc e2e/kotc-host-journey.spec.mjs e2e/kotc-player-scoring.spec.mjs || FAIL=1
run_batch interclub e2e/interclub-team-manager.spec.mjs || FAIL=1
run_batch public e2e/public-directory-prelaunch.spec.mjs e2e/public-events.spec.mjs || FAIL=1

log "Summary"
cat "$RESULT_DIR/summary.txt"
exit "$FAIL"
