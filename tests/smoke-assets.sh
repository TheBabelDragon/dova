#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
test -f "$ROOT/index.html"
if grep -q "v3_s_" "$ROOT/index.html"; then
  echo "FAIL: index still references v3_s_ fragments"
  exit 1
fi
if ! grep -qE "s_|n = 35|n=35|Promise\.all" "$ROOT/index.html"; then
  echo "FAIL: index does not target s_* payload"
  exit 1
fi
# Live check against raw GitHub content for mainline fragments
for i in 0 17 34; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://raw.githubusercontent.com/TheBabelDragon/dova/main/s_${i}.txt" || true)
  if [[ "$code" != "200" ]]; then
    echo "WARN: main s_${i}.txt HTTP $code (ok if offline)"
  else
    echo "OK main s_${i}.txt"
  fi
done
echo "PASS smoke-assets"
