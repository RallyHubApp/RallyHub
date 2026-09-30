#!/usr/bin/env bash
set -euo pipefail
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"

find_chromium() {
  find "${HOME:-/root}/.cache/ms-playwright" -type f \( -name chrome-headless-shell -o -name chromium -o -name chrome \) 2>/dev/null | head -n 1 || true
}

BIN="$(find_chromium)"
if [ -z "$BIN" ]; then
  echo "[responsive-test] Chromium not cached; installing Playwright Chromium…"
  npx playwright install chromium
  BIN="$(find_chromium)"
fi

if [ -n "$BIN" ] && command -v ldd >/dev/null 2>&1; then
  if ldd "$BIN" 2>/dev/null | grep -q 'not found'; then
    echo "[responsive-test] Browser runtime libraries missing; installing Chromium dependencies…"
    npx playwright install-deps chromium
  fi
fi

echo "[responsive-test] Playwright Chromium ready."
