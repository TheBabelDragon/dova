#!/usr/bin/env bash
# Smoke: ensure production entry and no required missing fragments
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
test -f "$ROOT/index.html"
# Must not require v3_s_1..39
if grep -q "v3_s_" "$ROOT/index.html"; then
  echo "FAIL: index still references v3_s_ fragments"
  exit 1
fi
echo "PASS smoke-assets"
