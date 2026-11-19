# DOVA — First Flight

WebGL2 dragon flight in **The Shattered Reach**.

**Play:** [https://thebabeldragon.github.io/dova/](https://thebabeldragon.github.io/dova/)

## Status (v0.3.1 recovery)

Production was broken: the loader requested `v3_s_0`…`v3_s_39`, but only `v3_s_0.txt` existed.

**Fixed:** `index.html` loads the complete committed payload **`s_0.txt`–`s_34.txt`** (35 fragments). Optional `assets/game.html` is used when present. Missing assets surface an explicit error.

Saves use `localStorage['dova.v2']` (still reads `dova.v1`). **RESET SAVE** is intentional only.

## Controls

| Input | Action |
|-------|--------|
| WASD | Steer |
| Mouse | Aim |
| SPACE | Flap / take off |
| SHIFT | Boost |
| Q / RMB | Fire breath |
| F | Aeris Surge (after glyphs) |
| R | Recover |
| E | Resonance ping |
| ESC | Pause |
| Touch | Left steer · FLAP / BOOST / FIRE / SURGE |

## Goal

Collect the three ancient glyphs (AERIS, LUX, IGNIS), light the Three Forges, complete the Trial of Rings.

## Architecture

```
index.html           # resilient loader (parallel s_0…s_34, or assets/game.html)
s_0.txt … s_34.txt   # complete game (~42 KB assembled)
tests/validate.mjs
tests/smoke-assets.sh
```

## Validation

```bash
node tests/validate.mjs
bash tests/smoke-assets.sh
```

## Notes

Expanded systems described in `README_V03.md` (full glyph registry, resonance matrix, extra consumables) came from a local build that was never fully uploaded as `v3_s_*` chunks. This recovery restores the complete **committed** game; it does not invent missing source.
