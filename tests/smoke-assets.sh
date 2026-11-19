#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
test -f "$ROOT/index.html"
test -f "$ROOT/assets/game.js"
if grep -q "v3_s_" "$ROOT/index.html" "$ROOT/assets/game.js"; then
  echo "FAIL: still references v3_s_ fragments"
  exit 1
fi
if ! grep -q 'assets/game.js' "$ROOT/index.html"; then
  echo "FAIL: index does not load assets/game.js"
  exit 1
fi
echo "PASS smoke-assets"
