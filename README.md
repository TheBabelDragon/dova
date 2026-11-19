# DOVA — First Flight

**v0.3.1 recovery** — full playable game restored for GitHub Pages.

Play: https://thebabeldragon.github.io/dova/

## Root cause

`main` `index.html` loaded **40** fragments named `v3_s_0.txt` … `v3_s_39.txt`.
Only **`v3_s_0.txt`** was ever committed. Production failed with 404 on the second request.

The complete playable game **was** already in the repository as **`s_0.txt`–`s_34.txt`** (35 fragments, ~42 KB total) — the v0.2 Elemental Interaction Engine payload with forges, fire, seals, flight, saves, and WebGL2.

## Recovery

`index.html` now:

1. Tries optional single bundle `assets/game.html` if present.
2. Otherwise loads the complete historical payload **`s_0` … `s_34`** (35 chunks).
3. Shows an explicit error if any required fragment is missing (no silent failure).

Hardened viewport / touch CSS remain on the shell. Save key stays **`dova.v2`** (reads **`dova.v1`**). **RESET SAVE** is intentional only.

## Architecture

```
index.html           # resilient loader (no v3_s_* dependency)
s_0.txt … s_34.txt   # complete game source fragments (already on main)
assets/              # optional single-file bundle + docs
tests/validate.mjs
tests/smoke-assets.sh
```

## Features in recovered game

- WebGL2 (`#version 300 es`) + context loss recovery
- Procedural world, dragon flight, fire breath, Aeris Surge
- Forges / seals / crystals / elemental interactions
- Desktop + mobile (touch controls in payload)
- `localStorage` progression under `dova.v2`

## Known limitation (honest)

README_V03 describes seeded glyphs, full resonance matrix, and expanded consumables from a **local** ~47–54 KB build that was **never fully uploaded** as `v3_s_*` / `v3f_*` chunks. That source is not in git history. This recovery does **not** invent those systems; it restores the complete committed game.

## Validation

```bash
node tests/validate.mjs
bash tests/smoke-assets.sh
```

## Branch

`fix/v0.3-full-load-recovery` from `main` @ 98321ad
