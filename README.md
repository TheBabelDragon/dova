# DOVA — First Flight

A WebGL2 dragon flight game set in **The Shattered Reach**.

**Play it here:** [https://thebabeldragon.github.io/dova/](https://thebabeldragon.github.io/dova/)

## Controls

- **WASD** — Steer (W dive, S climb)
- **Mouse** — Aim
- **SPACE** — Flap / take off
- **SHIFT** — Boost (especially effective when diving)
- **Q / Right Mouse** — Fire breath (hold)
- **F** — Elemental ability (Aeris Surge, unlocked after collecting all glyphs)
- **R** — Recover / level the frame
- **E** — Resonance ping (shows distance to objective)
- **ESC** — Pause
- **`** — Debug overlay

**Touch:** Drag left half of the screen to steer, use the on-screen buttons on the right (including dedicated **FIRE** button).

## Goal

Collect the three ancient glyphs (AERIS, LUX, IGNIS) scattered across the floating islands, then complete the Trial of Rings. Light the **Three Forges** with fire breath for an additional objective.

## Technical

- Pure HTML + WebGL2 (no external dependencies except Google Fonts)
- Pixelated aesthetic with ordered dithering
- Procedural world with islands, ruins, clouds, and mountains
- Local save with v1 → v2 migration (position, progress, settings, forge state)
- Elemental Interaction Engine (fire, reactions, destructible environment)

---

Created for GitHub Pages deployment.
