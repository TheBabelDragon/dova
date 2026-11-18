# DOVA v0.2 — Elemental Interaction Engine

Branch: `feat/v0.2-elemental-interactions`

## Status — COMPLETE

Full implementation is live on this branch via the chunked loader.

- **Fire breath**: Q / RMB / mobile FIRE button
- **Fire energy + heat + overheat** model
- **Interactive objects**: trees, braziers (Three Forges), crystals, seals, barriers
- **Elemental reaction registry** (IGNIS + vegetation / crystal / brazier / seal / barrier)
- **Particle pool**: embers, sparks, smoke
- **Save migration**: `dova.v1` → `dova.v2` (preserves glyphs, rings, position)
- **Mobile**: no text-select, no double-tap zoom, dedicated FIRE button
- **HUD**: fire meter + forges 0/3 tracker + objectives

### Delivery method
`index.html` is a 700-byte bootstrap that fetches and concatenates `s_0.txt` … `s_34.txt` (35 chunks × ~1200 chars) then injects the full ~42 KB game. Reassembly is byte-identical to the verified single-file build.

## Controls (v0.2)

| Input | Action |
|-------|--------|
| Q / RMB | Fire breath (hold) |
| Mobile FIRE | Fire breath |
| F | Aeris Surge |
| SPACE | Flap / take off |
| SHIFT | Boost |
| E | Resonance ping |
| ESC | Pause |

## Three Forges

1. Near Island A (Aeris)
2. Near Island B (Lux)
3. Near Island C (Ignis)

Ignite each with fire breath. Lighting all three unlocks the forge completion toast.

## After merge to main
GitHub Pages will serve the new index. Existing v0.1 localStorage saves migrate automatically on first load of v0.2.
