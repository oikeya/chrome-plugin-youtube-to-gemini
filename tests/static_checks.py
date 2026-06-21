#!/usr/bin/env python3
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


def load_json(path: Path):
    with path.open(encoding="utf-8") as file:
        return json.load(file)


manifest = load_json(ROOT / "manifest.json")
assert manifest["manifest_version"] == 3
assert manifest["default_locale"] == "en"
assert "clipboardWrite" not in manifest.get("permissions", []), (
    "clipboardWrite must remain disabled so prompts are not copied automatically"
)

for source_name in ("content.js", "gemini.js", "popup.js"):
    source = (ROOT / source_name).read_text(encoding="utf-8")
    assert "navigator.clipboard" not in source, (
        f"{source_name}: automatic Clipboard API use is prohibited"
    )

referenced_files = []
for content_script in manifest["content_scripts"]:
    referenced_files.extend(content_script.get("js", []))
    referenced_files.extend(content_script.get("css", []))

action = manifest["action"]
referenced_files.append(action["default_popup"])
referenced_files.extend(manifest["icons"].values())
referenced_files.extend(action["default_icon"].values())

missing = sorted({name for name in referenced_files if not (ROOT / name).is_file()})
assert not missing, f"Manifest references missing files: {', '.join(missing)}"

locale_dir = ROOT / "_locales"
english = load_json(locale_dir / "en" / "messages.json")
expected_keys = set(english)
for messages_path in sorted(locale_dir.glob("*/messages.json")):
    messages = load_json(messages_path)
    assert set(messages) == expected_keys, (
        f"{messages_path.parent.name}: locale keys differ from English; "
        f"missing={sorted(expected_keys - set(messages))}, "
        f"extra={sorted(set(messages) - expected_keys)}"
    )
    empty = sorted(key for key, value in messages.items() if not value.get("message"))
    assert not empty, f"{messages_path.parent.name}: empty messages: {empty}"

print("Static manifest and locale checks passed.")
