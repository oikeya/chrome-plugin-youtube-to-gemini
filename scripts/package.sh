#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

version="$(python3 -c 'import json; print(json.load(open("manifest.json"))["version"])')"
output="dist/youtube-to-gemini-${version}.zip"

python3 -m json.tool manifest.json >/dev/null
for messages in _locales/*/messages.json; do
  python3 -m json.tool "$messages" >/dev/null
done

mkdir -p dist
zip -q -r -FS "$output" \
  manifest.json \
  content.js content.css \
  gemini.js \
  popup.html popup.js popup.css \
  icons \
  _locales

if ! unzip -Z1 "$output" | rg -qx 'manifest.json'; then
  echo "manifest.json is not at the ZIP root" >&2
  exit 1
fi

echo "Created $output"
