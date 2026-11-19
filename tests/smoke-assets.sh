#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
test -f "$ROOT/index.html"
if grep -q "v3_s_" "$ROOT/index.html"; then
  echo "FAIL: index still references v3_s_ fragments"
  exit 1
fi
if ! grep -qE "s_\+?'|s_\"|n=35|assets/game" "$ROOT/index.html"; then
  echo "FAIL: index does not target s_* or assets/game"
  exit 1
fi
echo "PASS smoke-assets"
