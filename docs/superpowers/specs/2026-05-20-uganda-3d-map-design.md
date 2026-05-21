# Design: Uganda 3D Raised Region Map

**Date:** 2026-05-20  
**Project:** Business Yoo (Uganda Business Ideas)  
**Component:** `components/UgandaRegionMap.tsx`

## Problem

The current map is a hand-drawn geometric approximation using simple polygons — it looks nothing like Uganda. Users seeing it for the first time don't recognise it as a country map. It undermines trust and brand quality.

## Goal

Replace the fake polygon map with a visually impressive component that:
1. Uses the **real Uganda silhouette** from accurate GeoJSON data
2. Has a **3D raised tile effect** — each region looks like a physical raised surface with depth (side face + drop shadow)
3. **Active region** glows yellow (`#F5C842`) with a stronger shadow — matching existing brand colours
4. Keeps the same React props interface (`activeRegion`, `onRegionClick`) so zero changes needed in `IdeasDiscoveryClient.tsx`

## Approach: SVG + CSS (No WebGL)

All 3D depth is achieved with pure SVG techniques:
- Each region has two SVG paths: a **side face** (darker shade, offset downward) and a **top face** (the clickable region colour)
- SVG `<filter>` with `feDropShadow` for depth shadow on top faces
- A second filter `shadow-active` adds a yellow glow when the region is selected
- No `deck.gl`, `three.js`, or `react-simple-maps` runtime needed — the GeoJSON paths are baked into the component as SVG path strings at build time

## GeoJSON Source

- **Primary:** `bahiirwa/uganda-APIs` — Uganda districts JSON, aggregate to 4 regions
- **Fallback:** simplemaps.com Uganda GIS free download
- The 4 regions (Northern, Eastern, Western, Central) are composited from districts grouped by region name
- Final SVG path strings are hand-optimised/simplified for the `viewBox="0 0 220 280"` coordinate space — no runtime TopoJSON parsing needed

## Component Design

```
UgandaRegionMap
  props: { activeRegion: "All" | Region, onRegionClick: (r: "All" | Region) => void }

  SVG structure per region:
    <g class="region-group" onClick={...}>
      <path />   ← side face (darker, offset +7px Y)
      <path      ← top face (clickable, filter=shadow or shadow-active)
        fill={active ? "#F5C842" : REGION_COLORS[id]}
        filter={active ? "url(#shadow-active)" : "url(#shadow)"}
      />
      <text />   ← label (dark text when active, white otherwise)
    </g>

  SVG filters (defined once in <defs>):
    #shadow       — feDropShadow dx=3 dy=6 stdDeviation=4 flood-color=#00000044
    #shadow-active — feDropShadow x2 for glow: flood-color=#F5C84266 stdDeviation=8
                     + same depth shadow stacked

  Mobile fallback (< 360px): chip row (unchanged from current)
  Reset button: shown when activeRegion !== "All"
```

## Colour Palette (unchanged from current)

| Region   | Top Fill  | Side Face |
|----------|-----------|-----------|
| Northern | `#4d9a6e` | `#1a4a2a` |
| Eastern  | `#3d7a58` | `#1a3a28` |
| Western  | `#2D5A40` | `#0e2a18` |
| Central  | `#1C3A2A` | `#0a1f10` |
| Active   | `#F5C842` | (no side change) |

## Files Changed

- `components/UgandaRegionMap.tsx` — full replacement with 3D SVG map
- No other files need changes (props interface stays identical)

## Out of Scope

- District-level detail (136 districts) — future phase
- WebGL/3D library — rejected for bundle size and phone performance
- react-simple-maps runtime — paths baked at build time instead
