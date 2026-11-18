# DOVA v0.2 — Elemental Interaction Engine

Branch: `feat/v0.2-elemental-interactions`

## Status

Full single-file implementation is prepared locally (42KB) with:

- Fire breath (Q / RMB / mobile FIRE button)
- Fire energy + heat + overheat model
- Interactive objects: trees, braziers (Three Forges), crystals, seals, barriers
- Elemental reaction registry (IGNIS + vegetation/crystal/brazier/seal/barrier)
- Particle pool (embers, sparks, smoke)
- Save migration dova.v1 → dova.v2 (preserves glyphs, rings, position)
- Mobile: no text-select, no double-tap zoom, FIRE button
- HUD: fire meter, forges 0/3 tracker

## Apply the build

The complete `index.html` for v0.2 was generated in the agent workspace.
Re-run the agent with a request to **push the prepared dova_v02.html** or paste the file into this branch.

## Controls (v0.2)

| Input | Action |
|-------|--------|
| Q / RMB | Fire breath (hold) |
| Mobile FIRE | Fire breath |
| F | Aeris Surge (unchanged) |
| SPACE | Flap |
| SHIFT | Boost |

## Three Forges

1. Near Island A (Aeris)
2. Near Island B (Lux)
3. Near Island C (Ignis)

Ignite with fire breath. Lighting all three unlocks the forge completion toast.
