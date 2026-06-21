#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

python3 -m json.tool manifest.json >/dev/null
for messages in _locales/*/messages.json; do
  python3 -m json.tool "$messages" >/dev/null
done

for icon in icons/icon-16.png icons/icon-32.png icons/icon-48.png icons/icon-128.png; do
  test -s "$icon"
done

for asset in store-assets/promo-small-440x280.png store-assets/promo-marquee-1400x560.png; do
  test -s "$asset"
done

if rg -n 'REPLACE_WITH' PRIVACY.md SUPPORT.md docs; then
  echo "Replace every REPLACE_WITH placeholder before publishing." >&2
  exit 1
fi

if ! find store-assets/screenshots -maxdepth 1 -type f \( -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' \) | rg -q .; then
  echo "Add at least one actual screenshot to store-assets/screenshots/." >&2
  exit 1
fi

echo "Static release checks passed. Complete a final manual test in YouTube and Gemini before submission."
