# DOVA — First Flight

**v0.3.1 recovery** — full playable game restored for GitHub Pages.

Play: https://thebabeldragon.github.io/dova/

## Status

The multi-fragment loader (`v3_s_0` … `v3_s_39`) never received a complete upload. Only `v3_s_0.txt` existed on `main`, so production failed with 404s after the first chunk.

**Recovery (this branch):** the complete, working game payload from `s_0.txt`–`s_34.txt` (v0.2 Elemental Interaction Engine + hardened touch controls) is assembled into a **single** `index.html`. No sequential fragment fetches.

## Features preserved

- WebGL2 rendering (`#version 300 es`)
- Procedural world, dragon flight, combat / fire breath
- Forges, seals, crystals, elemental interactions
- Save/load via `dova.v2` (reads legacy `dova.v1`)
- Desktop + hardened mobile controls
- Intentional **RESET SAVE** only (never auto-wipes)

## Architecture

```
index.html          ← single authoritative entry (HTML + CSS + JS)
tests/validate.mjs  ← integrity + save checks
tests/smoke-assets.sh
```

No `assets/game.js` split required for recovery; the entire game is self-contained.

## Controls

| Input | Action |
|-------|--------|
| WASD | Steer |
| Mouse | Aim (pointer lock) |
| SPACE | Flap |
| SHIFT | Boost |
| Q / RMB | Fire breath |
| F | Aeris Surge |
| R | Recover |
| E | Resonance |
| ESC | Pause |
| Touch | Virtual stick + FLAP / BOOST / FIRE / SURGE |

## Saves

- Primary key: `localStorage['dova.v2']`
- Migration: `dova.v1` is still read on load
- RESET SAVE is a deliberate UI action

## Development notes

See `README_V02.md` / `README_V03.md` for feature history. Full v0.3 seeded-glyph / resonance / consumable systems were documented and partially started as chunk uploads but **the complete source was never committed**. This recovery prioritizes a working complete game over fabricating missing systems.

## Validation

```bash
node tests/validate.mjs
bash tests/smoke-assets.sh
```
