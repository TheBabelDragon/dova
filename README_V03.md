# DOVA v0.3 — Seeded Glyphs, Resonance & Consumables

Branch: `feat/v0.3-seeded-glyphs`

## What's new

- **Hardened touch controls** (from the fix branch): no double-tap zoom, no text highlight/select, robust virtual stick + buttons, no pointer-lock on mobile.
- **Seeded minor glyphs**: 6 additional shards placed deterministically around the three main islands (world seed 1337). Collect for resonance.
- **Inventory**: Ember (from burning trees), Shard (from heating crystals), Essence (from lighting forges / seals).
- **Resonance**: per-family levels (AERIS / LUX / IGNIS). Main glyphs +2, shards +1. E key shows levels and gives mild fire refill from IGNIS resonance.
- **Crafting** (C key):
  - 3 Ember + 1 Shard → Fire Core (full fire energy + clear heat/cooldown)
  - 2 Essence + 1 Shard → Aether Draft (full aether)
- **HUD**: Ember / Shard / Essence counts + RES A# L# I#
- **Save migration**: dova.v2 → v3 (preserves everything + adds inv / res / sg)

## Controls (additions)

| Input | Action |
|-------|--------|
| E | Resonance pulse (shows levels + mild IGNIS fire refill) |
| C | Craft (see recipes above) |
| Touch | Same hardened stick + FLAP / BOOST / FIRE / SURGE |

## Status

Full single-file implementation ready (47 KB). Loader + 40 chunks being pushed to this branch.
