#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
root="$(pwd)"

python3 tests/static_checks.py

if [[ -n "${CHROME_BIN:-}" ]]; then
  chrome="$CHROME_BIN"
elif command -v google-chrome >/dev/null 2>&1; then
  chrome="$(command -v google-chrome)"
elif command -v google-chrome-stable >/dev/null 2>&1; then
  chrome="$(command -v google-chrome-stable)"
elif command -v chromium >/dev/null 2>&1; then
  chrome="$(command -v chromium)"
elif command -v chromium-browser >/dev/null 2>&1; then
  chrome="$(command -v chromium-browser)"
else
  echo "Chrome or Chromium was not found. Set CHROME_BIN to its executable." >&2
  exit 1
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

run_browser_test() {
  local name="$1"
  local url="$2"
  local output="$tmp_dir/$name.html"

  if ! "$chrome" \
      --headless=new \
      --no-sandbox \
      --disable-gpu \
      --disable-dev-shm-usage \
      --no-first-run \
      --no-default-browser-check \
      --user-data-dir="$tmp_dir/profile-$name" \
      --virtual-time-budget=5000 \
      --dump-dom \
      "$url" >"$output" 2>"$tmp_dir/$name.log"; then
    echo "$name browser failed to start." >&2
    sed -n '1,160p' "$tmp_dir/$name.log" >&2
    exit 1
  fi

  if ! rg -q '<div id="test-result">PASS</div>' "$output"; then
    echo "$name browser test failed." >&2
    rg -n 'test-result|test-error' "$output" >&2 || true
    sed -n '1,120p' "$tmp_dir/$name.log" >&2
    exit 1
  fi
  echo "$name browser test passed."
}

run_browser_test \
  "content" \
  "file://$root/tests/fixtures/content-smoke.html"
run_browser_test \
  "gemini" \
  "file://$root/tests/fixtures/gemini-smoke.html?yt2gemini=smoke-request"
run_browser_test \
  "gemini-fallback" \
  "file://$root/tests/fixtures/gemini-fallback-smoke.html?yt2gemini=fallback-request"

echo "All automated tests passed."
