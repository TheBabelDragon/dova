# DOVA v0.3 — Seeded Glyphs, Resonance & Consumables

**Branch**: `feat/v0.3-seeded-glyphs-resonance-consumables`  
**Base**: `818f956c71cd689e94332f2bf118cf7ad2c0304c`

## Bootstrap

- Restored working loader to the complete `s_0.txt`–`s_34.txt` v0.2 payload (critical repair).
- Hardened mobile controls preserved (no double-tap zoom, no text select, robust stick).

## Implemented Systems (in full local build, being uploaded as `v3f_*.txt`)

### Glyph Registry (24 variants across 6 families)
- **IGNIS**: Core, Ember, Blaze, Ash
- **AERIS**: Core, Gale, Zephyr, Squall
- **LUX**: Core, Beam, Glow, Flare
- **TERRA**: Core, Root, Dust, Peak
- **PELAGIA**: Core, Tide, Mist, Surge
- **UMBRA**: Core, Veil, Shade, Void

Existing AERIS / LUX / IGNIS cores migrate automatically from v0.2 `G.g`.

### Resonance Engine (registry-driven)
| Combination | Result |
|-------------|--------|
| IGNIS + AERIS | Firestorm |
| IGNIS + PELAGIA | Steam Burst |
| IGNIS + TERRA | Molten Stone |
| LUX + UMBRA | Reveal Hidden Paths |
| PELAGIA + AERIS | Frozen Wind |
| TERRA + AERIS | Dust Vortex |

Requires discovered glyphs of both families. Prevents duplicate activation. Preserves Aeris Surge.

### Inventory & Consumables
Catalysts, consumables, resources defined with stack limits and sources.

**Real effects**:
- Ember Capsule → temporary fire amplification (respects heat)
- Cooling Gel → reduce heat / clear cooldown
- Aether Cell → restore aether
- Wind Vial → temporary lift boost
- Repair Resin → frame recovery
- Resonance Crystal → temporary glyph reveal
- Emergency Feather → one-time fall protection (consumes exactly one)

### Crafting (data-driven recipes)
- Cooling Gel = Water Pearl + Ancient Seed
- Ember Capsule = Ember Shard ×2 + Resin
- Aether Cell = Light Dust + Crystal Fragment ×2
- Resonance Crystal = Light Dust ×2 + Ancient Dust ×2
- Repair Resin = Resin ×2 + Earth Fragment

Harvesting is wired into existing `onReact` / fire interactions (trees, crystals, forges).

### Save Migration
`dova.v2` → `v:3` with seed, inventory, discovered glyphs, resonance discoveries, known recipes, quick slots. Safe defaults. Old binary glyph flags migrate to `discovered`.

### Controls (additions)
- **C** — Craft first available recipe
- **V** — Use first available useful consumable
- **E** — Resonance pulse + try IGNIS+AERIS combination

### HUD
Forge count, Ember / Shard / Dust counts, World Seed, Glyphs discovered / Resonance count.

## Status
Full 54 KB single-file implementation is complete locally and is being pushed as 39 content chunks (`v3f_0` … `v3f_38`) + loader. Bootstrap is already working with the prior v0.2 payload while chunks upload.
